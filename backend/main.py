from api.ai import router as ai_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.meals import router as meals_router

app = FastAPI()

app.include_router(ai_router)
app.include_router(meals_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from datetime import datetime

food_logs = []
meals = []

@app.get("/")
def root():
    return {"message": "FitSense AI backend is running"}


@app.post("/log-food")
def log_food(food: str, quantity: int = 1):
    new_log = {
        "id": len(food_logs) + 1,
        "food": food,
        "quantity": quantity,
        "calories": None,          # AI will fill this later
        "calorieSource": "ai_pending",
        "createdAt": datetime.now()
    }

    food_logs.append(new_log)

    return {
        "message": "Food logged successfully",
        "log": new_log
    }
# get endpoint
@app.get("/food-logs")
def get_food_logs():
    return food_logs

@app.get("/meals")
def get_meals():
    return meals
