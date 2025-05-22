from openai import OpenAI
from puzzle_generator.config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

def edit_category_names(api_key, puzzle):
    prompt = """Evaluate the following puzzle. For each group, correct or improve the category name if needed.
Make sure to output in the following format:
Category: Category1
Words: word1, word2, word3, word4
Category: Category2
Words: word1, word2, word3, word4
Category: Category3
Words: word1, word2, word3, word4
Category: Category4
Words: word1, word2, word3, word4"""

    for cat, words in puzzle.items():
        prompt += f"\nCategory: {cat}\nWords: {', '.join(words)}"

    response = client.chat.completions.create(
        model="gpt-4",
        temperature=0.7,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content
