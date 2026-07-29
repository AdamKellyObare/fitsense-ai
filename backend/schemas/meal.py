import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MealCreate(BaseModel):
    food: str = Field(min_length=1, max_length=255)


class MealUpdate(BaseModel):
    food: Optional[str] = Field(default=None, min_length=1, max_length=255)


class MealPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    food: str
    goal: str
    calories: Optional[int]
    protein: Optional[int]
    carbs: Optional[int]
    fat: Optional[int]
    source: str
    created_at: datetime
