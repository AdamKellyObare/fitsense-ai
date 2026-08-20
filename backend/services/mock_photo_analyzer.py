import asyncio


async def analyze_photo_with_mock(image_bytes: bytes) -> dict:
    # Short delay makes the "analyzing" UI state actually observable while
    # verifying the pipeline locally, without a real API call — same
    # reasoning as photo_generator.py's mock path.
    await asyncio.sleep(1.5)

    return {
        "food": "Mixed plate (mock analysis — enable USE_REAL_AI for a real estimate)",
        "calories": 550,
        "protein": 30,
        "carbs": 55,
        "fat": 20,
    }
