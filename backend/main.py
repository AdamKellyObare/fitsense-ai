import logging
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from api.auth import router as auth_router
from api.meals import router as meals_router
from api.weight import router as weight_router
from core.config import settings
from core.limiter import limiter

# Without this, logger.info() calls anywhere in the app (this file's own
# usage-tracking in services/photo_analyzer.py included) are silently
# dropped — Python's logging module only shows WARNING+ by default when
# nothing has configured a handler, even though uvicorn's own request logs
# appear regardless since uvicorn configures its own loggers separately.
logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(name)s:%(message)s")

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
app.include_router(weight_router)

# Built frontend, copied here by the Render build step (see render.yaml).
# Absent in local dev, where the frontend runs separately via `npm run dev`
# on :5173 and the CORS middleware above handles the cross-origin calls.
STATIC_DIST = Path(__file__).resolve().parent / "static_dist"
_RESERVED_PREFIXES = {"auth", "meals", "weight-entries"}

if STATIC_DIST.is_dir():
    app.mount("/assets", StaticFiles(directory=STATIC_DIST / "assets"), name="frontend-assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str):
        # Never let this catch-all mask a real (if invalid) API path as HTML.
        if full_path.split("/", 1)[0] in _RESERVED_PREFIXES:
            raise HTTPException(status_code=404)

        candidate = (STATIC_DIST / full_path).resolve()
        if full_path and candidate.is_file() and STATIC_DIST in candidate.parents:
            return FileResponse(candidate)

        # SPA fallback: any other unmatched GET (e.g. /meals, /analytics, a
        # refresh on a deep link) gets index.html; react-router-dom's
        # BrowserRouter then renders the right screen client-side.
        return FileResponse(STATIC_DIST / "index.html")

else:

    @app.get("/")
    def root():
        return {"message": "FitSense AI backend is running"}
