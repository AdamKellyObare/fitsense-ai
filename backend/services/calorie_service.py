def estimate_calories(food: str) -> str:
    """
    Temporary fallback calorie estimator
    (used when OpenAI quota is unavailable)
    """

    food = food.lower()

    estimates = {
        "egg": 70,
        "eggs": 70,
        "toast": 80,
        "bread": 80,
        "rice": 200,
        "chicken": 250,
        "apple": 95,
        "banana": 105
    }

    total = 0

    for key, calories in estimates.items():
        if key in food:
            total += calories

    if total == 0:
        return "Unable to estimate calories for this meal."

    return f"Estimated calories: {total}"
