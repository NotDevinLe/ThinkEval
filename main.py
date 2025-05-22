from puzzle_generator.story_prompting import generate_story_and_category
from puzzle_generator.embedding_utils import get_most_similar_groups
from puzzle_generator.difficulty_logic import create_false_group_tree
from puzzle_generator.editor import edit_category_names
from puzzle_generator.utils import extract_groups_from_llm_output, get_all_words
from puzzle_generator.config import OPENAI_API_KEY

import random

# Generate random seed words to inspire the puzzle
with open("words.txt") as f: 
    word_pool = f.read().splitlines()

random_words = random.sample(word_pool, 4)


# Step 1: Generate story + initial puzzle draft from LLM
story_output = generate_story_and_category(random_words)
print("\n=== Raw LLM Output ===\n", story_output)

# Step 2: Parse LLM output into structured categories and words
groups = extract_groups_from_llm_output(story_output)
print("\n=== Extracted Groups ===\n", groups)

# Step 3: Rank by difficulty using sentence embeddings
all_words = get_all_words(groups)
ranked = get_most_similar_groups(all_words)
print("\n=== Ranked Word Groups by Similarity ===\n", ranked)

# Step 4: Add difficulty logic (false group prompts)
false_group_prompts = create_false_group_tree(list(groups.values())[0])
print("\n=== False Group Prompts ===\n", false_group_prompts)

# Step 5: Edit category names with LLM
final = edit_category_names(OPENAI_API_KEY, groups)
print("\n=== Edited Categories ===\n", final)
