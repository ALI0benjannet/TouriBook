import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

# Create engine and session only if DATABASE_URL is provided. This makes
# importing app.database safe during Alembic runs when the env may not be
# available or intentionally omitted. Alembic only needs `Base` for
# autogeneration.
if DATABASE_URL:
    engine = create_engine(DATABASE_URL, echo=True, future=True)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
else:
    engine = None
    SessionLocal = None

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()