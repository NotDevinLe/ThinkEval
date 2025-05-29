from openai import OpenAI
import json
import random
from evaluate import evaluate
import os
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

with open("games.json", "r") as f:
    games = json.load(f)

def solve_connections_puzzle(words):
    prompt = (
        "You are playing a game in which you're given a set of words, and it is possible to categorize them into groups of four. "
        f"Given the set of words: {', '.join(words)}, find one group of 4 words from this list that belong to the same category. "
        "Only output one group at a time, since you're only allowed to check one group per turn. "
        "Write your final answer in the following format:\n"
        "Word1 Word2 Word3 Word4\n"
        "Do not include quotation marks or any explanation."
    )

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )

    return response.choices[0].message.content.strip().split()

history = []

for j, game in enumerate(games[:20]):
    guesses = []
    all_words = [word for group in game.values() for word in group]
    curr = [sorted(category) for category in list(game.values())]
    random.shuffle(all_words)

    for _ in range(4):
        gpt_output = solve_connections_puzzle(all_words)
        if sorted(gpt_output) in curr:
            for i in range(len(all_words)):
                if sorted(gpt_output) in curr:
                    all_words = [word for word in all_words if word not in gpt_output]
        guesses.append(gpt_output)

    history.append(guesses)
    print(j)

print(evaluate(history, games))