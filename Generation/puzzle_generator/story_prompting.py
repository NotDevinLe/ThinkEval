from openai import OpenAI
from puzzle_generator.config import OPENAI_API_KEY, DEFAULT_MODEL

client = OpenAI(api_key=OPENAI_API_KEY)

def generate_story_from_seed_words(seed_words: list[str]) -> str:
    prompt = f"""
    Write a short, vivid story (5-8 sentences) that meaningfully incorporates or is inspired by the following words: {', '.join(seed_words)}.
    The story should feel natural and imaginative—not forced.
    """
    response = client.chat.completions.create(
        model=DEFAULT_MODEL,
        temperature=1.0,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content.strip()


def generate_category_candidates_from_story(story: str, difficulty="medium") -> str:
    prompt = f"""
    You are generating a **{difficulty} difficulty** Connections-style puzzle based on the story below.

    Story:
    \"\"\"
    {story}
    \"\"\"

    Your task is to generate **exactly 4 distinct word categories**, each with 10 **single-word** entries.
    The categories must be creative, logically consistent, and clearly different.
    - Do NOT include multi-word phrases.
    - All words must be unique across the entire puzzle (no word should appear in more than one category).
    - However, you are encouraged to include words that could plausibly fit into more than one category to introduce added difficulty

    For each category:
    - Provide a **short, clear category name**
    - List **10 single words** that fit
    - Add a 1-sentence explanation of the logic

    Use this format exactly:

    Category: <name>  
    Words: <word1>, <word2>, ..., <word10>  
    Explanation: <one-line logic>
    """
    response = client.chat.completions.create(
        model=DEFAULT_MODEL,
        temperature=1.0,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content.strip()



def parse_category_output(raw_output):
    """
    Parses the output of `generate_category_candidates` into structured data.
    Returns a list of dictionaries: [{category, words, explanation}, ...]
    """
    import re
    raw_output = raw_output.replace("\r", "").strip()

    pattern = re.compile(
        r"Category:\s*(.*?)\s*Words:\s*(.*?)\s*Explanation:\s*(.*?)\s*(?=Category:|\Z)",
        re.DOTALL
    )


    matches = pattern.findall(raw_output + "\n")
    result = []
    for match in matches:
        name, word_str, explanation = match
        words = [w.strip() for w in word_str.split(",") if w.strip()]
        result.append({
            "category": name.strip(),
            "words": words,
            "explanation": explanation.strip()
        })
    return result
