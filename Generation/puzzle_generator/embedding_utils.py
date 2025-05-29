from sentence_transformers import SentenceTransformer, util
from itertools import combinations

model = SentenceTransformer('all-mpnet-base-v2')

def get_most_similar_groups(words, num_groups=4):
    word_embeddings = model.encode(words)
    combs = list(combinations(range(len(words)), 4))
    scored_combs = []

    for comb in combs:
        group = [words[i] for i in comb]
        embeddings = [word_embeddings[i] for i in comb]
        sim_matrix = util.pytorch_cos_sim(embeddings, embeddings)
        score = sim_matrix.mean().item()
        scored_combs.append((group, score))

    scored_combs.sort(key=lambda x: x[1], reverse=True)

    yellow = scored_combs[0]
    purple = scored_combs[-1]
    green = scored_combs[len(scored_combs)//3]
    blue = scored_combs[2*len(scored_combs)//3]

    return {
        "yellow": yellow[0],
        "green": green[0],
        "blue": blue[0],
        "purple": purple[0],
    }
