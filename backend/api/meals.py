# backend/api/meals.py
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

# In-memory storage for now
meals_db = []

@router.post("/log-meal")
async def log_meal(food: str, goal: str):
    meal = {
        "food": food,
        "goal": goal,
        "timestamp": datetime.now().isoformat()
    }
    meals_db.append(meal)
    return {"message": "Meal logged", "meal": meal}

@router.get("/meals")
async def get_meals():
    return {"meals": meals_db}
