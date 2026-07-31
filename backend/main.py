from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from api.auth import router as auth_router
from api.meals import router as meals_router
from core.config import settings
from core.limiter import limiter

app = FastAPI()

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    # A wildcard here is not honored for credentialed requests per the
    # Fetch/CORS spec — Authorization must be listed explicitly or the
    # preflight for Bearer-authenticated requests will reject it.
    allow_headers=["Content-Type", "Authorization", "X-CSRF-Token", "X-Refresh-Token"],
    expose_headers=["X-CSRF-Token", "X-Access-Token", "X-Refresh-Token"],
)

app.include_router(auth_router)
app.include_router(meals_router)


@app.get("/")
def root():
    return {"message": "FitSense AI backend is running"}
