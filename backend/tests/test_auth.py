from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import pytest

from app.main import app
from app.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    # Seed default roles required for registration tests
    from app.models.models import Role
    session = TestingSessionLocal()
    roles = ["Administrator", "Security Manager", "SOC Engineer", "Security Analyst"]
    for r in roles:
        if not session.query(Role).filter(Role.name == r).first():
            session.add(Role(name=r, description="Test role"))
    session.commit()
    yield session
    Base.metadata.drop_all(bind=engine)
    session.close()

@pytest.fixture(scope="module")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

def test_register_validation_fail(client):
    # 1. Missing fields
    res = client.post("/api/auth/register", json={})
    assert res.status_code == 422

    # 2. Weak password check
    payload = {
        "full_name": "Test User",
        "email": "test@company.com",
        "username": "test_user",
        "password": "password",
        "confirm_password": "password",
        "role_name": "Security Analyst"
    }
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 422

    # 3. Name containing numbers check
    payload["password"] = "Secure@Pass123"
    payload["confirm_password"] = "Secure@Pass123"
    payload["full_name"] = "Test User 123"
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 422

def test_register_and_verify(client):
    payload = {
        "full_name": "Surveillance Analyst",
        "email": "analyst.test@company.com",
        "username": "analyst_test",
        "password": "Secure@Pass123",
        "confirm_password": "Secure@Pass123",
        "role_name": "Security Analyst"
    }
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "analyst.test@company.com"
    assert data["email_verified"] is False
    
    # Try logging in before verifying (should fail with 403)
    res_login = client.post("/api/auth/login", json={
        "email": "analyst.test@company.com",
        "password": "Secure@Pass123"
    })
    assert res_login.status_code == 403
    assert "verify" in res_login.json()["detail"]

    # Extract verification token
    from app.models.models import User
    db_session = TestingSessionLocal()
    user = db_session.query(User).filter(User.email == "analyst.test@company.com").first()
    token = user.verification_token
    assert token is not None
    db_session.close()

    # Trigger verification link
    res_verify = client.post("/api/auth/verify-email", json={"token": token})
    assert res_verify.status_code == 200

    # Log in again (should succeed)
    res_login = client.post("/api/auth/login", json={
        "email": "analyst.test@company.com",
        "password": "Secure@Pass123"
    })
    assert res_login.status_code == 200
    assert "access_token" in res_login.json()
