from puzzle_generator.story_prompting import generate_story_from_seed_words, generate_category_candidates_from_story, parse_category_output
from puzzle_generator.tree_of_thought import tree_of_thought_generate
from puzzle_generator.difficulty_logic import choose_final_words_per_group
import random

GENERATION_MODE = "cot"  # options: "cot" or "tot"
TARGET_DIFFICULTY = "hard"

with open("words.txt") as f:
    word_pool = f.read().splitlines()

random_words = random.sample(word_pool, 4)

if GENERATION_MODE == "cot":
    print(f"\n=== Using Chain-of-Thought Generation ({TARGET_DIFFICULTY.capitalize()} Difficulty) ===")
    
    story = generate_story_from_seed_words(random_words)
    print("\n=== Generated Story ===\n", story)

    raw = generate_category_candidates_from_story(story, difficulty=TARGET_DIFFICULTY)
    print("\n=== Raw LLM Output ===\n", raw)

    parsed = parse_category_output(raw)

    final_groups = [
        choose_final_words_per_group({
            "category": group["category"],
            "candidates": group["words"],
            "explanation": group["explanation"]
        })
        for group in parsed
    ]


elif GENERATION_MODE == "tot":
    print(f"\n=== Using Tree-of-Thought Generation ({TARGET_DIFFICULTY.capitalize()} Difficulty) ===")

    story = generate_story_from_seed_words(random_words)
    print("\n=== Generated Story ===\n", story)

    final_groups = tree_of_thought_generate(story=story, difficulty=TARGET_DIFFICULTY)


else:
    raise ValueError("Unsupported generation mode. Use 'cot' or 'tot'.")

# Ensure exactly 4 groups
if len(final_groups) < 4:
    print(f"[Error] Only {len(final_groups)} groups generated. Cannot form a complete puzzle.")
    exit(1)
elif len(final_groups) > 4:
    final_groups = final_groups[:4]

# Flatten and shuffle the 16 words
all_words = [word for group in final_groups for word in group["words"]]
random.shuffle(all_words)

# Show puzzle-style view
print("\n=== Puzzle Words (Shuffled) ===")
print(", ".join(all_words))


# Show the answers for reference
print("\n=== Answer Key ===")
for g in final_groups:
    print(f"\nCategory: {g['category']}")
    print(f"Words: {', '.join(g['words'])}")
    print(f"Explanation: {g['explanation']}")
