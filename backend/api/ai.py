from fastapi import APIRouter
from services.calorie_service import estimate_calories

router = APIRouter()

@router.get("/estimate-calories/")
def get_calories(food: str):
    """
    Example call:
    /estimate-calories/?food=2 eggs and toast
    """
    calories = estimate_calories(food)
    return {"food": food, "calories": calories}
