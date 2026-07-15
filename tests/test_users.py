import pytest
from httpx import AsyncClient
from backend.models.enums import UserRole
from backend.models.user import User

@pytest.mark.asyncio
async def test_list_users_protected(test_client: AsyncClient):
    """Test that listing users returns 401 for unauthenticated clients."""
    response = await test_client.get("/api/users/")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_list_users_analyst_forbidden(test_client: AsyncClient, seed_user):
    """Test that listing users returns 403 Forbidden for a non-admin user."""
    # Login as analyst
    login_res = await test_client.post(
        "/api/auth/login",
        json={"email": seed_user.email, "password": "password123"}
    )
    assert login_res.status_code == 200
    access_token = login_res.cookies.get("access_token")
    test_client.cookies.set("access_token", access_token)

    response = await test_client.get("/api/users/")
    assert response.status_code == 403
    assert response.json()["detail"] == "Insufficient permissions"

@pytest.mark.asyncio
async def test_list_users_admin_success(test_client: AsyncClient, seed_admin, seed_user):
    """Test that listing users succeeds for an admin user."""
    # Login as admin
    login_res = await test_client.post(
        "/api/auth/login",
        json={"email": seed_admin.email, "password": "admin123"}
    )
    assert login_res.status_code == 200
    access_token = login_res.cookies.get("access_token")
    test_client.cookies.set("access_token", access_token)

    response = await test_client.get("/api/users/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    emails = [u["email"] for u in data]
    assert seed_admin.email in emails
    assert seed_user.email in emails
