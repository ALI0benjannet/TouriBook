import logging
import time
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.limiter import limiter, rate_limit_exceeded_handler
from app.core.logging import setup_logging
from app.services.email_service import send_verification_email

setup_logging()
logger = logging.getLogger(__name__)  # Correction : __name__ au lieu de name

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API REST de la plateforme de réservation d'activités touristiques TouriBook.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
)

app.add_middleware(SlowAPIMiddleware)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS or ["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

# Static files (avatars, etc.) served from backend/static
static_dir = Path(__file__).resolve().parents[1] / "static"
static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration = (time.perf_counter() - start) * 1000
    logger.info(
        "%s %s -> %s (%.1f ms)",
        request.method,
        request.url.path,
        response.status_code,
        duration,
    )
    response.headers["X-Process-Time-ms"] = f"{duration:.1f}"
    return response


@app.get("/health", tags=["Système"])
def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}


@app.post("/test-email", tags=["Système"])
def test_email(background_tasks: BackgroundTasks):
    background_tasks.add_task(
        send_verification_email,
        "alibenjannette@gmail.com",
        "Test utilisateur",
        "test-token-123",
    )
    return {"status": "ok", "message": "E-mail de test planifié"}


app.include_router(api_router, prefix=settings.API_V1_PREFIX)