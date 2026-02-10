def estimate_with_mock(food: str) -> str:
    food = food.lower()

    estimates = {
        "egg": 70,
        "toast": 80,
        "chicken": 250,
        "rice": 200,
        "apple": 95,
        "banana": 105
    }

    total = 0

    for item, calories in estimates.items():
        if item in food:
            total += calories

    if total == 0:
        total = 300  # reasonable default for unknown meals

    return f"Estimated calories: {total} kcal (AI-assisted estimate)"
