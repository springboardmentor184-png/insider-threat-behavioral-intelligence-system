# backend/app/core/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Try MySQL first if configured, default to SQLite for instant out-of-the-box compatibility
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    try:
        # Test MySQL connection
        test_url = "mysql+pymysql://root:1234@localhost/insider_threat_db"
        test_engine = create_engine(test_url, connect_args={"connect_timeout": 2})
        with test_engine.connect() as conn:
            DATABASE_URL = test_url
    except Exception:
        DATABASE_URL = "sqlite:///./insider_threat.db"

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

