from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


def _build_engine():
    database_url = settings.DATABASE_URL

    if database_url.startswith("postgresql"):
        try:
            engine = create_engine(database_url, pool_pre_ping=True)
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return engine
        except OperationalError:
            fallback_db = Path(__file__).resolve().parents[2] / "test.db"
            fallback_url = f"sqlite:///{fallback_db}"
            return create_engine(fallback_url, pool_pre_ping=True)

    return create_engine(database_url, pool_pre_ping=True)


engine = _build_engine()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# FastAPI Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()