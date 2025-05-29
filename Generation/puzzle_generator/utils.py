import re

def extract_groups_from_llm_output(llm_text):
    lines = llm_text.strip().split("\n")
    groups = {}
    current_category = None

    for line in lines:
        if line.lower().startswith("category"):
            current_category = line.split(":", 1)[1].strip()
            groups[current_category] = []
        elif line.lower().startswith("words") and current_category:
            word_line = line.split(":", 1)[1]
            words = re.split(r',\s*', word_line)
            cleaned = [re.sub(r"\s*\(.*?\)", "", word).strip() for word in words]
            groups[current_category].extend(cleaned)

    return groups


def get_all_words(groups):
    return [word for group in groups.values() for word in group]
