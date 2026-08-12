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
from app.core.database import SessionLocal
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


# ============ TEMPORARY DEBUG ENDPOINTS (REMOVE AFTER DIAGNOSTICS) ============

@app.post("/debug/test-login", tags=["DEBUG"])
def debug_test_login(email: str, password: str):
    """
    Temporary endpoint to diagnose login failures.
    Logs detailed info about user lookup, password hash format, and verify result.
    """
    from app.services import user_service
    from app.core.security import pwd_context, verify_password
    
    # Get a DB session
    db = SessionLocal()
    try:
        user = user_service.get_by_email(db, email)
        if not user:
            return {
                "status": "user_not_found",
                "email": email,
                "message": "User not found in database"
            }
        
        # User found, check password
        hash_info = {
            "stored_hash": user.hashed_password[:50] + "..." if len(user.hashed_password) > 50 else user.hashed_password,
            "hash_length": len(user.hashed_password),
            "hash_format": user.hashed_password.split("$")[0] if "$" in user.hashed_password else "unknown",
        }
        
        # Test verify_password
        try:
            result = verify_password(password, user.hashed_password)
            return {
                "status": "login_attempt_complete",
                "email": email,
                "user_found": True,
                "user_id": user.id,
                "password_verify_result": result,
                "hash_info": hash_info,
                "pwd_context_schemes": pwd_context.schemes(),
                "message": "Password verification returned " + str(result)
            }
        except Exception as e:
            return {
                "status": "password_verify_error",
                "email": email,
                "user_found": True,
                "error": str(e),
                "error_type": type(e).__name__,
                "hash_info": hash_info,
                "pwd_context_schemes": pwd_context.schemes(),
            }
    finally:
        db.close()


@app.post("/debug/test-smtp", tags=["DEBUG"])
def debug_test_smtp():
    """
    Temporary endpoint to test real SMTP connectivity and send a test email.
    Does NOT use background tasks — runs synchronously to capture exceptions.
    """
    import asyncio
    from app.services import email_service
    
    try:
        # Run async function synchronously
        asyncio.run(
            email_service.send_verification_email(
                email="test-recipient@example.com",
                name="Debug Test",
                token="debug-token-12345"
            )
        )
        return {
            "status": "success",
            "message": "SMTP test email sent successfully",
            "mail_config": {
                "MAIL_SERVER": settings.MAIL_SERVER,
                "MAIL_PORT": settings.MAIL_PORT,
                "MAIL_FROM": settings.MAIL_FROM,
                "MAIL_STARTTLS": settings.MAIL_STARTTLS,
                "MAIL_SSL_TLS": settings.MAIL_SSL_TLS,
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "error_message": str(e),
            "error_type": type(e).__name__,
            "mail_config": {
                "MAIL_SERVER": settings.MAIL_SERVER,
                "MAIL_PORT": settings.MAIL_PORT,
                "MAIL_FROM": settings.MAIL_FROM,
                "MAIL_STARTTLS": settings.MAIL_STARTTLS,
                "MAIL_SSL_TLS": settings.MAIL_SSL_TLS,
            },
            "traceback_hint": "Check logs for full traceback"
        }


# ============ END DEBUG ENDPOINTS ============


app.include_router(api_router, prefix=settings.API_V1_PREFIX)