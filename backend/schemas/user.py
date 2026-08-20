import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from models.user import ActivityLevel, Goal, Sex


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: Optional[str] = Field(default=None, max_length=120)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    name: Optional[str]
    age: Optional[int]
    height_cm: Optional[float]
    weight_kg: Optional[float]
    target_weight_kg: Optional[float]
    sex: Optional[Sex]
    activity_level: ActivityLevel
    goal: Goal
    calorie_target: int
    protein_target: int
    carb_target: int
    fat_target: int
    water_target_l: float
    email_verified: bool
    has_onboarded: bool
    created_at: datetime


class UserUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=120)
    age: Optional[int] = Field(default=None, ge=0, le=120)
    height_cm: Optional[float] = Field(default=None, ge=0, le=300)
    weight_kg: Optional[float] = Field(default=None, ge=0, le=500)
    target_weight_kg: Optional[float] = Field(default=None, ge=0, le=500)
    sex: Optional[Sex] = None
    activity_level: Optional[ActivityLevel] = None
    goal: Optional[Goal] = None
    calorie_target: Optional[int] = Field(default=None, ge=0, le=10000)
    protein_target: Optional[int] = Field(default=None, ge=0, le=1000)
    carb_target: Optional[int] = Field(default=None, ge=0, le=1000)
    fat_target: Optional[int] = Field(default=None, ge=0, le=1000)
    water_target_l: Optional[float] = Field(default=None, ge=0, le=20)
    has_onboarded: Optional[bool] = None
