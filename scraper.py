from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import json

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
driver.get("https://word.tips/todays-nyt-connections-answers/")

wait = WebDriverWait(driver, 10)
wait.until(EC.presence_of_element_located((By.XPATH, "//button[starts-with(@id, 'accordion-header-')]")))

soup = BeautifulSoup(driver.page_source, "html.parser")

answers = []

buttons = driver.find_elements(By.XPATH, "//button[starts-with(@id, 'accordion-header-')]")

for button in buttons:
    try:
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", button)
        time.sleep(0.3)
        button.click()
        time.sleep(1.5)

        soup = BeautifulSoup(driver.page_source, "html.parser")

        open_panel = soup.find("section", attrs={"id": button.get_attribute("aria-controls")})
        if not open_panel:
            print("Could not find open panel for", button.get_attribute("id"))
            continue

        month_title = button.find_element(By.XPATH, ".//span[@slot='title']").text

        game_blocks = open_panel.find_all("li", attrs={"slot": "solution"})

        for game in game_blocks:
            game_dict = {}
            category_blocks = game.find_all("div", class_="py-3", recursive=True)

            for block in category_blocks:
                span = block.find("span", class_="text-base font-bold")
                ul = block.find("ul")
                if span and ul:
                    category = span.get_text(strip=True)
                    words = {li.get_text(strip=True).rstrip(',') for li in ul.find_all("li", recursive=False)}
                    game_dict[category] = words

            if len(game_dict) == 4:
                answers.append(game_dict)

    except Exception as e:
        print("Error:", e)
        
serializable_answers = []
for game in answers:
    serializable_game = {
        category: list(words) if isinstance(words, set) else words
        for category, words in game.items()
    }
    serializable_answers.append(serializable_game)

with open("nyt_connections_data.json", "w", encoding="utf-8") as f:
    json.dump(serializable_answers, f, indent=2, ensure_ascii=False)
