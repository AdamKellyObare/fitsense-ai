from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.deps import get_current_user, require_csrf
from db.session import get_db
from models.meal import Meal
from models.user import User
from schemas.meal import MealCreate, MealPublic
from services.ai_provider import estimate_calories

router = APIRouter(prefix="/meals", tags=["meals"])


@router.post("", response_model=MealPublic, status_code=status.HTTP_201_CREATED)
async def log_meal(
    payload: MealCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_csrf),
) -> Meal:
    estimate = estimate_calories(payload.food)

    meal = Meal(
        user_id=current_user.id,
        food=payload.food,
        goal=payload.goal,
        calories=estimate["calories"],
        protein=estimate["protein"],
        carbs=estimate["carbs"],
        fat=estimate["fat"],
        source="openai" if settings.USE_REAL_AI else "mock",
    )
    db.add(meal)
    await db.commit()
    await db.refresh(meal)
    return meal


@router.get("", response_model=List[MealPublic])
async def get_meals(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[Meal]:
    result = await db.scalars(
        select(Meal).where(Meal.user_id == current_user.id).order_by(Meal.created_at.desc())
    )
    return list(result)
