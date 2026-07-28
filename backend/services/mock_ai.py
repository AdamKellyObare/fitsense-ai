def estimate_with_mock(food: str) -> dict:
    food = food.lower()

    estimates = {
        "egg": 70,
        "toast": 80,
        "chicken": 250,
        "rice": 200,
        "apple": 95,
        "banana": 105
    }

    calories = 0

    for item, item_calories in estimates.items():
        if item in food:
            calories += item_calories

    if calories == 0:
        calories = 300  # reasonable default for unknown meals

    return {
        "calories": calories,
        "protein": round(calories * 0.15 / 4),
        "carbs": round(calories * 0.5 / 4),
        "fat": round(calories * 0.35 / 9),
    }
