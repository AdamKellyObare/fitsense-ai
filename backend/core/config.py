from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ENV: str = "development"

    DATABASE_URL: str

    JWT_SECRET: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    FRONTEND_ORIGIN: str = "http://localhost:5173"
    COOKIE_SECURE: bool = False

    OPENAI_API_KEY: str = ""
    USE_REAL_AI: bool = False

    USE_AI_PHOTOS: bool = False
    # Independent from USE_REAL_AI (calorie-estimation text) on purpose:
    # that's already approved, active, real spend. Photo generation costs
    # meaningfully more per call, so it gets its own explicit opt-in rather
    # than silently riding along with the text flag.
    USE_REAL_AI_PHOTOS: bool = False
    S3_ENDPOINT_URL: str = ""
    S3_ACCESS_KEY_ID: str = ""
    S3_SECRET_ACCESS_KEY: str = ""
    S3_BUCKET_NAME: str = ""
    S3_PUBLIC_URL_BASE: str = ""

    @property
    def frontend_origins(self) -> list[str]:
        return [origin.strip() for origin in self.FRONTEND_ORIGIN.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
