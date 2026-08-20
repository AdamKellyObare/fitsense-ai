from __future__ import annotations

import base64
import io
import json
import logging
from typing import Optional

from openai import AsyncOpenAI
from PIL import Image, ImageOps

from core.config import settings

logger = logging.getLogger(__name__)

# Vision tokenizes images very differently from text — gpt-4o-mini uses
# roughly 30x more tokens per image than gpt-4o, which cancels out most of
# its usual per-token discount for this specific workload (confirmed via
# real reported usage, not assumed). gpt-4o ends up comparable-to-cheaper
# for vision specifically while being meaningfully better at actually
# recognizing food/portions, so this endpoint deliberately uses gpt-4o even
# though text estimation elsewhere (services/openai_ai.py) uses
# gpt-4o-mini — that's a considered difference, not an inconsistency.
_MODEL = "gpt-4o"

# Caps cost predictably regardless of the source photo's resolution — a
# modern phone camera can produce images 10-20x larger than a vision model
# needs, and larger images cost more tokens without improving accuracy past
# this size.
_MAX_DIMENSION = 1024
_JPEG_QUALITY = 80

_SCHEMA = {
    "name": "meal_photo_analysis",
    "schema": {
        "type": "object",
        "properties": {
            "food": {"type": "string"},
            "calories": {"type": "integer"},
            "protein": {"type": "integer"},
            "carbs": {"type": "integer"},
            "fat": {"type": "integer"},
        },
        "required": ["food", "calories", "protein", "carbs", "fat"],
        "additionalProperties": False,
    },
    "strict": True,
}

_SYSTEM_PROMPT = (
    "You are a nutrition estimation assistant. Given a photo of a meal, "
    "identify what's in it and write a concise, natural food description "
    "(the way someone would type it into a food log, e.g. '2 fried eggs "
    "with toast and avocado'). Then estimate its total calories (kcal), "
    "protein (g), carbs (g), and fat (g) as your best single-point estimate "
    "for the whole meal shown."
)

_client: Optional[AsyncOpenAI] = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


def resize_for_analysis(image_bytes: bytes) -> bytes:
    image = Image.open(io.BytesIO(image_bytes))
    # Phone photos carry an EXIF orientation tag rather than storing pixels
    # already upright — without this, sideways/upside-down photos get sent
    # to the model exactly as oriented, which measurably hurts recognition.
    image = ImageOps.exif_transpose(image)
    image = image.convert("RGB")

    if max(image.size) > _MAX_DIMENSION:
        image.thumbnail((_MAX_DIMENSION, _MAX_DIMENSION), Image.LANCZOS)

    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=_JPEG_QUALITY)
    return buffer.getvalue()


async def analyze_photo_with_openai(image_bytes: bytes) -> dict:
    resized = resize_for_analysis(image_bytes)
    b64_image = base64.b64encode(resized).decode("utf-8")

    response = await _get_client().chat.completions.create(
        model=_MODEL,
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{b64_image}"},
                    }
                ],
            },
        ],
        response_format={"type": "json_schema", "json_schema": _SCHEMA},
    )

    # Logged so real per-call cost can be checked against the projected
    # estimate once this is live, not just assumed to hold.
    usage = response.usage
    if usage is not None:
        logger.info(
            "meal photo analysis usage: prompt_tokens=%d completion_tokens=%d total_tokens=%d",
            usage.prompt_tokens,
            usage.completion_tokens,
            usage.total_tokens,
        )

    return json.loads(response.choices[0].message.content)
