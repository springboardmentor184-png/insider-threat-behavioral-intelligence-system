"""
Pytest configuration and global fixtures.
"""

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool
from httpx import AsyncClient
from typing import AsyncGenerator

from backend.main import app
from backend.core.database import Base, get_db
from backend.models.user import User
from backend.models.enums import UserRole
from backend.core.security import hash_password

# Use an in-memory SQLite database for fast, isolated tests
DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest_asyncio.fixture(scope="function", autouse=True)
async def setup_db():
    """Create all tables in the SQLite test database and drop them after test finishes."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide a database session fixture."""
    async with TestingSessionLocal() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def test_client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Provide an HTTPX AsyncClient that overrides the database dependency."""
    
    async def override_get_db():
        try:
            yield db_session
            await db_session.commit()
        except Exception:
            await db_session.rollback()
            raise
        finally:
            await db_session.close()

    app.dependency_overrides[get_db] = override_get_db
    
    # Use ASGI transport for testing FastAPI app asynchronously
    from httpx import ASGITransport
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
        yield client
        
    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def seed_user(db_session: AsyncSession) -> User:
    """Seed a default analyst user for auth testing."""
    user = User(
        email="analyst@test.com",
        username="test_analyst",
        full_name="Test Analyst",
        hashed_password=hash_password("password123"),
        role=UserRole.SECURITY_ANALYST,
        department="Security",
        is_active=True,
        approval_status="approved"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture(scope="function")
async def seed_admin(db_session: AsyncSession) -> User:
    """Seed a default administrator user for admin tests."""
    user = User(
        email="admin@test.com",
        username="test_admin",
        full_name="Test Admin",
        hashed_password=hash_password("admin123"),
        role=UserRole.ADMINISTRATOR,
        department="Admin",
        is_active=True,
        approval_status="approved"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user
