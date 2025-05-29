import numpy as np
from itertools import combinations
from collections import Counter
import spacy

nlp = spacy.load("en_core_web_md")

def cosineSimilarity(u, v):
    return np.dot(u, v) / (np.linalg.norm(u)  * np.linalg.norm(v))

def pairwiseSimilarity(words):
    return np.mean([cosineSimilarity(u, v) for u, v in combinations(words, 2)])

def evaluate(history, games):
    """
    
    History is the four word groupings that the model makes and games is the json dictionary which also holds the correct groupings

    History format:
        [
            [
                [Word1, word2, word3, word4],
                [Word1, word2, word3, word4],
                [Word1, word2, word3, word4],
                [Word1, word2, word3, word4],
            ]
        ]

    Games format:
        [
            {
                "Category 1": [Word1, word2, word3, word4],
                "Category 2": [Word1, word2, word3, word4],
                "Category 3": [Word1, word2, word3, word4],
                "Category 4": [Word1, word2, word3, word4],
            }
        ]

    """
    numGames = len(games)
    numGuesses = numGames * 4

    R = 0
    C = 0
    N = 0
    S = 0

    for i, game in enumerate(history):
        currGame = [sorted(category) for category in list(games[i].values())]

        # Logic for Repeats
        temp = [' '.join(sorted(group)) for group in currGame]
        counts = Counter(temp)

        for count in counts.values():
            if count > 1:
                r += count - 1
        
        # Logic for Average cosine similarity
        for j in range(len(game)):
            C += pairwiseSimilarity([nlp(word).vector for word in game[j]])
        
        # Logic for continually good choices
        for j in range(1, len(game)):
            first, second = pairwiseSimilarity([nlp(word).vector for word in game[j - 1]]), pairwiseSimilarity([nlp(word).vector for word in game[j]])
            if first > second:
                continue
            N += second - first
        
        # Logic for if the model guessed correctly
        for guess in game:
            if sorted(guess) in currGame:
                S += 1

    return R, C, N , S

