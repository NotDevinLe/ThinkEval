from sentence_transformers import SentenceTransformer, util
import itertools

model = SentenceTransformer("all-mpnet-base-v2")  # Already used elsewhere

def score_candidate_set(candidates: list[str]) -> list[str]:
    """
    Given a list of 8–10 candidate words, select the 4-word subset that is most semantically cohesive.
    """
    best_score = -1
    best_group = None

    # All 4-word combinations
    for combo in itertools.combinations(candidates, 4):
        embeddings = model.encode(combo, convert_to_tensor=True)
        sim_matrix = util.pytorch_cos_sim(embeddings, embeddings)

        # Compute average off-diagonal similarity
        n = len(combo)
        total_sim = sim_matrix.sum().item() - n  # subtract diagonal
        avg_sim = total_sim / (n * (n - 1))

        if avg_sim > best_score:
            best_score = avg_sim
            best_group = combo

    return list(best_group)
