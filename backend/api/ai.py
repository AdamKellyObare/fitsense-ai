from fastapi import APIRouter
from services.ai_provider import estimate_calories

router = APIRouter()

@router.get("/estimate-calories/")
def estimate(food: str, goal: str = "maintenance"):
    base_calories = estimate_calories(food)

    if goal == "cutting":
        message = f"{base_calories}. This meal fits best as a light or moderate option for fat loss."
    elif goal == "bulking":
        message = f"{base_calories}. For muscle gain, consider pairing this with a carb or protein-rich side."
    else:
        message = f"{base_calories}. This meal aligns well with a maintenance goal."

    return {
        "food": food,
        "goal": goal,
        "message": message
    }
