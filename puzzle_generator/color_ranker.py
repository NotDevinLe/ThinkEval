def assign_colors(similarity_scores):
    sorted_items = sorted(similarity_scores.items(), key=lambda x: x[1], reverse=True)
    return {
        "yellow": sorted_items[0][0],
        "green": sorted_items[1][0],
        "blue": sorted_items[2][0],
        "purple": sorted_items[3][0],
    }
