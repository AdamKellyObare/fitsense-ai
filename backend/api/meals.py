from __future__ import annotations

import uuid
from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.deps import get_current_user, require_csrf
from db.session import get_db
from models.meal import Meal
from models.user import User
from schemas.meal import MealCreate, MealPreview, MealPublic, MealUpdate
from services.ai_provider import estimate_calories
from services.mock_photo_analyzer import analyze_photo_with_mock
from services.photo_analyzer import analyze_photo_with_openai
from services.photo_generator import generate_meal_photo
from services.photo_matcher import pick_photo_key

# Comfortably above any reasonable phone-camera photo (usually 2-8MB) while
# still ruling out someone deliberately posting an oversized file.
_MAX_PHOTO_BYTES = 15 * 1024 * 1024

router = APIRouter(prefix="/meals", tags=["meals"])


async def _get_owned_meal(meal_id: uuid.UUID, db: AsyncSession, current_user: User) -> Meal:
    meal = await db.get(Meal, meal_id)
    if meal is None or meal.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found")
    return meal


@router.post("", response_model=MealPublic, status_code=status.HTTP_201_CREATED)
async def log_meal(
    payload: MealCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_csrf),
) -> Meal:
    # Reuse a preview's already-computed numbers if provided (see
    # POST /meals/preview) instead of paying for and running a second real
    # AI estimate — also guarantees what gets logged exactly matches what
    # was previewed. Falls back to a fresh estimate otherwise, unchanged
    # from before.
    if payload.calories is not None:
        estimate = {
            "calories": payload.calories,
            "protein": payload.protein,
            "carbs": payload.carbs,
            "fat": payload.fat,
        }
        source = payload.source or ("openai" if settings.USE_REAL_AI else "mock")
    else:
        estimate = estimate_calories(payload.food)
        source = "openai" if settings.USE_REAL_AI else "mock"

    meal = Meal(
        user_id=current_user.id,
        food=payload.food,
        goal=current_user.goal,
        calories=estimate["calories"],
        protein=estimate["protein"],
        carbs=estimate["carbs"],
        fat=estimate["fat"],
        source=source,
        photo_key=pick_photo_key(payload.food),
        photo_status="pending" if settings.USE_AI_PHOTOS else "disabled",
    )
    db.add(meal)
    await db.commit()
    await db.refresh(meal)

    # Scheduled after the response-triggering commit above — runs once this
    # request has already returned, so logging a meal stays exactly as fast
    # as it is today. photo_key (the stock placeholder) is what the client
    # shows in the meantime.
    if settings.USE_AI_PHOTOS:
        background_tasks.add_task(generate_meal_photo, meal.id, payload.food)

    return meal


@router.post("/preview", response_model=MealPreview)
async def preview_meal(
    payload: MealCreate,
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_csrf),
) -> MealPreview:
    # No db.add/commit, no background_tasks — nothing is persisted. Still
    # requires CSRF like other mutating-ish endpoints: this has a real cost
    # side effect (a real AI call under USE_REAL_AI) even without a DB write,
    # so it shouldn't be forgeable cross-site.
    estimate = estimate_calories(payload.food)
    return MealPreview(
        food=payload.food,
        goal=current_user.goal,
        calories=estimate["calories"],
        protein=estimate["protein"],
        carbs=estimate["carbs"],
        fat=estimate["fat"],
        source="openai" if settings.USE_REAL_AI else "mock",
    )


@router.post("/analyze-photo", response_model=MealPreview)
async def analyze_meal_photo(
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_csrf),
) -> MealPreview:
    # No db.add/commit — same "preview, nothing persisted" contract as
    # POST /meals/preview, just fed by a photo instead of typed text. Still
    # requires CSRF for the same reason: a real-cost external call even
    # without a DB write.
    if not (image.content_type or "").startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be an image")

    image_bytes = await image.read()
    if len(image_bytes) > _MAX_PHOTO_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image too large")

    if settings.USE_REAL_AI:
        estimate = await analyze_photo_with_openai(image_bytes)
    else:
        estimate = await analyze_photo_with_mock(image_bytes)

    return MealPreview(
        food=estimate["food"],
        goal=current_user.goal,
        calories=estimate["calories"],
        protein=estimate["protein"],
        carbs=estimate["carbs"],
        fat=estimate["fat"],
        source="openai" if settings.USE_REAL_AI else "mock",
    )


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
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_csrf),
) -> Meal:
    meal = await _get_owned_meal(meal_id, db, current_user)

    if payload.food is not None and payload.food != meal.food:
        meal.food = payload.food
        meal.goal = current_user.goal
        estimate = estimate_calories(payload.food)
        meal.calories = estimate["calories"]
        meal.protein = estimate["protein"]
        meal.carbs = estimate["carbs"]
        meal.fat = estimate["fat"]
        meal.source = "openai" if settings.USE_REAL_AI else "mock"
        meal.photo_key = pick_photo_key(payload.food)

        # The food text changed, so any previously-generated photo no longer
        # matches — clear it and, if enabled, regenerate for the new text.
        meal.generated_photo_url = None
        meal.photo_status = "pending" if settings.USE_AI_PHOTOS else "disabled"

    await db.commit()
    await db.refresh(meal)

    if payload.food is not None and settings.USE_AI_PHOTOS and meal.photo_status == "pending":
        background_tasks.add_task(generate_meal_photo, meal.id, meal.food)

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
