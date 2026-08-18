from __future__ import annotations

import asyncio
import base64
import logging
import uuid
from typing import Optional

import boto3
from openai import AsyncOpenAI
from sqlalchemy import select

from core.config import settings
from db.session import AsyncSessionLocal
from models.generated_meal_photo import GeneratedMealPhoto
from models.meal import Meal
from services.photo_matcher import pick_photo_key

logger = logging.getLogger(__name__)

_PROMPT_TEMPLATE = (
    "Professional food photography of {food}, prepared exactly as described "
    "— if a cooking method is mentioned (boiled, steamed, grilled, fried, "
    "raw, etc.), the food's visual appearance must accurately reflect that "
    "method rather than defaulting to a seared or fried look. Plated "
    "attractively, natural lighting, shallow depth of field, appetizing, "
    "photorealistic, no text or watermarks."
)

_client: Optional[AsyncOpenAI] = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


def normalize_food_key(food: str) -> str:
    return " ".join(food.strip().lower().split())


async def _generate_image_bytes(food: str) -> bytes:
    if settings.USE_REAL_AI_PHOTOS:
        response = await _get_client().images.generate(
            model="gpt-image-1",
            prompt=_PROMPT_TEMPLATE.format(food=food),
            size="1024x1024",
            quality="medium",
        )
        return base64.b64decode(response.data[0].b64_json)

    # Mock path: no real API call. The short delay makes the "pending" UI
    # state actually observable while verifying the pipeline for free.
    await asyncio.sleep(2)
    return b""


def _upload_to_storage(image_bytes: bytes, food_key: str) -> str:
    if not settings.S3_BUCKET_NAME:
        # Object storage isn't configured yet (no Cloudflare R2 account set
        # up). This fallback exists purely so the async/caching/status
        # pipeline can be verified end-to-end before real storage exists —
        # it reuses an existing stock photo URL instead of a real generated
        # image. Never used once S3_* is actually configured.
        return f"/food/{pick_photo_key(food_key)}.jpg"

    client = boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT_URL,
        aws_access_key_id=settings.S3_ACCESS_KEY_ID,
        aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY,
    )
    key = f"meal-photos/{food_key.replace(' ', '-')}-{uuid.uuid4().hex[:8]}.png"
    client.put_object(Bucket=settings.S3_BUCKET_NAME, Key=key, Body=image_bytes, ContentType="image/png")
    return f"{settings.S3_PUBLIC_URL_BASE.rstrip('/')}/{key}"


async def generate_meal_photo(meal_id: uuid.UUID, food: str) -> None:
    # Runs as a background task, after the request that scheduled it has
    # already returned — needs its own DB session, the request's is closed.
    food_key = normalize_food_key(food)

    async with AsyncSessionLocal() as db:
        try:
            cached = await db.scalar(
                select(GeneratedMealPhoto).where(GeneratedMealPhoto.food_key == food_key)
            )

            if cached is not None:
                image_url = cached.image_url
            else:
                image_bytes = await _generate_image_bytes(food)
                image_url = await asyncio.to_thread(_upload_to_storage, image_bytes, food_key)
                db.add(GeneratedMealPhoto(food_key=food_key, image_url=image_url))

            meal = await db.get(Meal, meal_id)
            if meal is not None:
                meal.generated_photo_url = image_url
                meal.photo_status = "ready"
            await db.commit()
        except Exception:
            logger.exception("Meal photo generation failed for meal_id=%s", meal_id)
            await db.rollback()
            meal = await db.get(Meal, meal_id)
            if meal is not None:
                meal.photo_status = "failed"
                await db.commit()
