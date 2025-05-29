def create_false_group_tree(initial_group):
    alt_prompts = []
    for word in initial_group:
        alt_prompts.append(f"Generate a new category that includes the word '{word}' using a different meaning.")

    return alt_prompts

def create_intentional_overlap_prompt(prev_groups):
    context = "\n".join([f"Group: {', '.join(g)}" for g in prev_groups])
    prompt = f"""
Using the groups below, pick one word from each previous group and reinterpret it under a different category.
Then generate 6–8 words for this new category.

{context}
"""
    return prompt
