import json

from openai import OpenAI

from core.config import settings

_client = None

_SCHEMA = {
    "name": "calorie_estimate",
    "schema": {
        "type": "object",
        "properties": {
            "calories": {"type": "integer"},
            "protein": {"type": "integer"},
            "carbs": {"type": "integer"},
            "fat": {"type": "integer"},
        },
        "required": ["calories", "protein", "carbs", "fat"],
        "additionalProperties": False,
    },
    "strict": True,
}


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


def estimate_with_openai(food: str) -> dict:
    response = _get_client().chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a nutrition estimation assistant. Given a free-text "
                    "description of a meal, estimate its total calories (kcal), "
                    "protein (g), carbs (g), and fat (g). Respond with your best "
                    "single-point estimate for the whole meal as described."
                ),
            },
            {"role": "user", "content": food},
        ],
        response_format={"type": "json_schema", "json_schema": _SCHEMA},
    )

    return json.loads(response.choices[0].message.content)
