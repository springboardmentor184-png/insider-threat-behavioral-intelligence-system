from fastapi.testclient import TestClient
from app import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"


def test_register_and_login():
    client.post("/auth/register", json={
        "full_name": "Test User",
        "email": "pytest_user@test.com",
        "password": "TestPass@123",
        "role": "administrator",
    })
    response = client.post("/auth/login", json={
        "email": "pytest_user@test.com",
        "password": "TestPass@123",
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password_fails():
    response = client.post("/auth/login", json={
        "email": "pytest_user@test.com",
        "password": "WrongPassword",
    })
    assert response.status_code == 401


def test_employees_requires_auth():
    response = client.get("/employees/")
    assert response.status_code == 401