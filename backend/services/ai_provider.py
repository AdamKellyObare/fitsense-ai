from core.config import settings

def estimate_calories(food: str) -> str:
    if settings.USE_REAL_AI:
        from services.openai_ai import estimate_with_openai
        return estimate_with_openai(food)
    else:
        from services.mock_ai import estimate_with_mock
        return estimate_with_mock(food)
