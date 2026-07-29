from __future__ import annotations

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.deps import get_current_user, require_csrf
from db.session import get_db
from models.meal import Meal
from models.user import User
from schemas.meal import MealCreate, MealPublic, MealUpdate
from services.ai_provider import estimate_calories

router = APIRouter(prefix="/meals", tags=["meals"])


async def _get_owned_meal(meal_id: uuid.UUID, db: AsyncSession, current_user: User) -> Meal:
    meal = await db.get(Meal, meal_id)
    if meal is None or meal.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found")
    return meal


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


@router.patch("/{meal_id}", response_model=MealPublic)
async def update_meal(
    meal_id: uuid.UUID,
    payload: MealUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_csrf),
) -> Meal:
    meal = await _get_owned_meal(meal_id, db, current_user)

    if payload.goal is not None:
        meal.goal = payload.goal

    if payload.food is not None and payload.food != meal.food:
        meal.food = payload.food
        estimate = estimate_calories(payload.food)
        meal.calories = estimate["calories"]
        meal.protein = estimate["protein"]
        meal.carbs = estimate["carbs"]
        meal.fat = estimate["fat"]
        meal.source = "openai" if settings.USE_REAL_AI else "mock"

    await db.commit()
    await db.refresh(meal)
    return meal


@router.delete("/{meal_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
async def delete_meal(
    meal_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_csrf),
) -> None:
    meal = await _get_owned_meal(meal_id, db, current_user)
    await db.delete(meal)
    await db.commit()
