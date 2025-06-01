from puzzle_generator.config import OPENAI_API_KEY, DEFAULT_MODEL
from puzzle_generator.embedding_utils import score_candidate_set
from puzzle_generator.story_prompting import (
    parse_category_output,
    generate_story_from_seed_words,
    generate_category_candidates_from_story
)

def tree_of_thought_generate(story: str, branches: int = 6, difficulty: str = "medium") -> list[dict]:
    """
    Tree-of-Thought generation using story prompting.
    Generates a story from seed words, then spawns multiple category sets based on that story.
    Selects and scores candidate groups using embedding similarity.
    """

    # Generate multiple category outputs using the same story
    branch_outputs = [
        generate_category_candidates_from_story(story, difficulty=difficulty)
        for _ in range(branches)
    ]

    # Parse and collect all groups
    all_groups = []
    for output in branch_outputs:
        parsed = parse_category_output(output)
        all_groups.extend(parsed)

    # Score and select 4 best groups
    results = []
    for group in all_groups:
        top_words = score_candidate_set(group["words"])
        results.append({
            "category": group["category"],
            "words": top_words,
            "explanation": group["explanation"]
        })
        if len(results) == 4:
            break

    return results
