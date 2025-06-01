from .embedding_utils import score_candidate_set

def choose_final_words_per_group(group):
    final_words = score_candidate_set(group['candidates'])
    return {
        "category": group["category"],
        "words": final_words,
        "explanation": group["explanation"]
    }
