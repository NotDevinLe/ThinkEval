from openai import OpenAI
from puzzle_generator.config import OPENAI_API_KEY, DEFAULT_MODEL, TEMPERATURE

client = OpenAI(api_key=OPENAI_API_KEY)

def generate_story_and_category(random_words): 
    prompt = f"""
You are a creative puzzle designer. First, write a short story using these words: {', '.join(random_words)}.
Then, based on this story, generate four Connections-style categories, each with exactly four words.


Category styles to choose from: Synonyms, Slang, Wordplay, Fill-in-the-blank.

Format:
Category: <Name>
Words: word1, word2, word3, word4

    """

    response = client.chat.completions.create(
        model=DEFAULT_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=TEMPERATURE
    )

    return response.choices[0].message.content
