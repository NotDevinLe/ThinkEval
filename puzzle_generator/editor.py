from openai import OpenAI
from puzzle_generator.config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

def edit_category_names(api_key, puzzle):
    prompt = "Evaluate the following puzzle. For each group, correct or improve the category name if needed.\n"
    for cat, words in puzzle.items():
        prompt += f"\nCategory: {cat}\nWords: {', '.join(words)}"

    response = client.chat.completions.create(
        model="gpt-4",
        temperature=0.7,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content
