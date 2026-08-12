import pytest
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.core.database import Base, get_db
from app.main import app
from fastapi.testclient import TestClient


# ============================================================================
# TEST DATABASE SETUP - Transaction-based isolation (rollback after each test)
# ============================================================================

@pytest.fixture(scope="session")
def test_engine():
    """
    Create a test engine connected to the REAL database but with transaction
    isolation. Each test runs in its own transaction that rolls back.
    
    This prevents tests from touching your production data while avoiding the
    need to create a separate test database.
    """
    engine = create_engine(
        settings.DATABASE_URL,
        echo=False,
        future=True,
    )
    
    # Create all tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    yield engine
    
    # NOTE: We do NOT drop tables here because we're using the real database.
    # Table cleanup is not needed since each test rolls back its own transaction.


@pytest.fixture
def test_db_session(test_engine):
    """
    Create a test database session with transaction rollback isolation.
    
    Each test gets its own transaction that's rolled back after the test,
    ensuring test data never persists to the real database.
    """
    connection = test_engine.connect()
    transaction = connection.begin()
    
    # Create a session bound to this transaction
    TestingSessionLocal = sessionmaker(bind=connection, expire_on_commit=False)
    session = TestingSessionLocal()
    
    yield session
    
    # Rollback the transaction (undoes all changes made during the test)
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(test_db_session):
    """
    Override FastAPI's dependency injection to use the test session.
    This ensures all database calls in the app use the test transaction.
    """
    def override_get_db():
        yield test_db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    yield TestClient(app)
    
    # Clean up
    app.dependency_overrides.clear()


# ============================================================================
# EMAIL MOCKING FIXTURE
# ============================================================================

@pytest.fixture
def capture_email_tokens(monkeypatch):
    """
    Mock email sending to capture tokens instead of sending real emails.
    """
    from app.services import email_service
    
    tokens = {"verify": None, "reset": None}

    async def fake_send_verification_email(email: str, name: str, token: str) -> None:
        tokens["verify"] = token

    async def fake_send_reset_password_email(email: str, name: str, token: str) -> None:
        tokens["reset"] = token

    monkeypatch.setattr(email_service, "send_verification_email", fake_send_verification_email)
    monkeypatch.setattr(email_service, "send_reset_password_email", fake_send_reset_password_email)
    
    return tokens
