import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MealCreate(BaseModel):
    food: str = Field(min_length=1, max_length=255)

    # Optional pre-computed nutrition, set when logging a meal that was
    # already estimated via POST /meals/preview — lets "Log This Meal" reuse
    # those exact numbers instead of paying for and re-running a second real
    # AI estimate, and guarantees what gets logged matches what was shown.
    # Left unset, log_meal estimates fresh exactly as it always has.
    calories: Optional[int] = None
    protein: Optional[int] = None
    carbs: Optional[int] = None
    fat: Optional[int] = None
    source: Optional[str] = None


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
    photo_key: Optional[str]
    generated_photo_url: Optional[str]
    photo_status: str
    created_at: datetime


class MealPreview(BaseModel):
    # Deliberately no id/created_at/photo fields — nothing was persisted, so
    # there's nothing for the frontend to delete/update/render a photo for.
    food: str
    goal: str
    calories: Optional[int]
    protein: Optional[int]
    carbs: Optional[int]
    fat: Optional[int]
    source: str
