"""
Authentication and JWT cookie integration tests.
"""

import pytest
from httpx import AsyncClient
from backend.core.security import verify_password
from backend.models.enums import UserRole
from backend.models.user import User


def test_password_hashing():
    """Verify password hashing utility functionality."""
    from backend.core.security import hash_password, verify_password
    pwd = "my-secure-password"
    hashed = hash_password(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("wrong-password", hashed) is False


@pytest.mark.asyncio
async def test_user_registration(test_client: AsyncClient):
    """Test successful user registration API."""
    response = await test_client.post(
        "/api/auth/register",
        json={
            "email": "newuser@test.com",
            "username": "newuser",
            "full_name": "New User",
            "password": "securepassword",
            "role": "security_analyst"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@test.com"
    assert data["username"] == "newuser"
    assert data["role"] == "security_analyst"
    assert "hashed_password" not in data


@pytest.mark.asyncio
async def test_duplicate_registration_fails(test_client: AsyncClient, seed_user):
    """Test duplicate registration returns error code 400."""
    response = await test_client.post(
        "/api/auth/register",
        json={
            "email": seed_user.email,  # duplicate
            "username": "different_uname",
            "full_name": "Another User",
            "password": "securepassword",
            "role": "security_analyst"
        }
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_user_login_sets_cookies(test_client: AsyncClient, seed_user):
    """Test login endpoint sets HttpOnly cookies correctly."""
    response = await test_client.post(
        "/api/auth/login",
        json={
            "email": seed_user.email,
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

    # Check cookies
    cookies = response.cookies
    assert "access_token" in cookies
    assert "refresh_token" in cookies


@pytest.mark.asyncio
async def test_token_refresh(test_client: AsyncClient, seed_user):
    """Test rotating tokens via refresh endpoint."""
    # Log in first to get refresh token cookie
    login_res = await test_client.post(
        "/api/auth/login",
        json={
            "email": seed_user.email,
            "password": "password123"
        }
    )
    assert login_res.status_code == 200
    refresh_token = login_res.cookies.get("refresh_token")

    # Set cookies explicitly in request client
    test_client.cookies.set("refresh_token", refresh_token)
    refresh_res = await test_client.post("/api/auth/refresh")
    
    assert refresh_res.status_code == 200
    assert "access_token" in refresh_res.json()
    assert "access_token" in refresh_res.cookies
    assert "refresh_token" in refresh_res.cookies


@pytest.mark.asyncio
async def test_logout_clears_cookies(test_client: AsyncClient):
    """Test logout deletes authentication cookies."""
    response = await test_client.post("/api/auth/logout")
    assert response.status_code == 200
    # Cookie values are cleared (deleted or max-age set to 0)
    assert response.cookies.get("access_token") in (None, "")


@pytest.mark.asyncio
async def test_google_oauth2_unconfigured_redirect(test_client: AsyncClient, monkeypatch):
    """Test that Google redirect falls back to simulated callback on unconfigured environments."""
    from backend.routers.auth import settings
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "")
    
    response = await test_client.get("/api/auth/oauth2/google", follow_redirects=False)
    assert response.status_code == 307
    # Redirects straight to callback with simulation parameters
    assert "/api/auth/oauth2/google/callback?code=mock_code_123&mock=true" in response.headers["location"]


@pytest.mark.asyncio
async def test_totp_mfa_setup_enable_and_verify(test_client: AsyncClient, seed_user: User):
    """Test Google Authenticator TOTP setup, enable, and login verification."""
    # 1. Login to get session
    login_res = await test_client.post(
        "/api/auth/login",
        json={"email": seed_user.email, "password": "password123"}
    )
    assert login_res.status_code == 200
    access_token = login_res.cookies.get("access_token")
    test_client.cookies.set("access_token", access_token)

    # 2. Setup TOTP 2FA
    setup_res = await test_client.post("/api/auth/2fa/setup")
    assert setup_res.status_code == 200
    setup_data = setup_res.json()
    assert "secret" in setup_data
    assert "provisioning_uri" in setup_data
    secret = setup_data["secret"]

    # 3. Generate verification code
    import pyotp
    totp = pyotp.TOTP(secret)
    valid_code = totp.now()

    # 4. Enable 2FA
    enable_res = await test_client.post(
        "/api/auth/2fa/enable",
        json={"secret": secret, "code": valid_code}
    )
    assert enable_res.status_code == 200
    assert enable_res.json()["status"] == "success"

    # 5. Clear login cookies to simulate new login
    test_client.cookies.clear()

    # 6. Try login - should require MFA code
    login_mfa_res = await test_client.post(
        "/api/auth/login",
        json={"email": seed_user.email, "password": "password123"}
    )
    assert login_mfa_res.status_code == 200
    assert login_mfa_res.json()["status"] == "mfa_required"
    assert login_mfa_res.json()["email"] == seed_user.email

    # 7. Verify with invalid code - should fail
    verify_fail_res = await test_client.post(
        "/api/auth/2fa/verify",
        json={"email": seed_user.email, "code": "000000"}
    )
    assert verify_fail_res.status_code == 400

    # 8. Verify with valid code - should succeed and set cookies
    verify_success_res = await test_client.post(
        "/api/auth/2fa/verify",
        json={"email": seed_user.email, "code": totp.now()}
    )
    assert verify_success_res.status_code == 200
    assert verify_success_res.json()["status"] == "success"
    assert "access_token" in verify_success_res.cookies
    assert "refresh_token" in verify_success_res.cookies


@pytest.mark.asyncio
async def test_admin_create_user_success(test_client: AsyncClient, seed_admin: User):
    """Test administrative user provisioning (success)."""
    # Log in as admin
    login_res = await test_client.post(
        "/api/auth/login",
        json={"email": seed_admin.email, "password": "admin123"}
    )
    access_token = login_res.cookies.get("access_token")
    test_client.cookies.set("access_token", access_token)

    # Provision user
    new_user_res = await test_client.post(
        "/api/users/",
        json={
            "email": "new.analyst@itbis.com",
            "username": "newanalyst",
            "full_name": "New Employee",
            "password": "securepass123",
            "role": "security_analyst"
        }
    )
    assert new_user_res.status_code == 200
    assert new_user_res.json()["email"] == "new.analyst@itbis.com"
    assert new_user_res.json()["role"] == "security_analyst"


@pytest.mark.asyncio
async def test_admin_create_user_unauthorized(test_client: AsyncClient, seed_user: User):
    """Test administrative user provisioning fails for non-admins."""
    # Log in as normal analyst user
    login_res = await test_client.post(
        "/api/auth/login",
        json={"email": seed_user.email, "password": "password123"}
    )
    access_token = login_res.cookies.get("access_token")
    test_client.cookies.set("access_token", access_token)

    # Attempt user provisioning - should return HTTP 403 Forbidden
    new_user_res = await test_client.post(
        "/api/users/",
        json={
            "email": "new.analyst@itbis.com",
            "username": "newanalyst",
            "full_name": "New Employee",
            "password": "securepass123",
            "role": "security_analyst"
        }
    )
    assert new_user_res.status_code == 403


@pytest.mark.asyncio
async def test_self_registration_requires_admin_approval_approve_flow(test_client: AsyncClient, seed_admin: User):
    """Test self-registration requires administrator confirmation, and approval grants dashboard login access."""
    # 1. Self register as employee
    reg_res = await test_client.post(
        "/api/auth/register",
        json={
            "email": "employee@test.com",
            "username": "employee",
            "full_name": "Self Registered Employee",
            "password": "employeepassword123",
            "role": "soc_engineer"
        }
    )
    assert reg_res.status_code == 200
    employee_id = reg_res.json()["id"]
    assert reg_res.json()["approval_status"] == "pending"
    assert reg_res.json()["is_active"] is False

    # 2. Attempt login - should block with 403 pending status
    login_fail_res = await test_client.post(
        "/api/auth/login",
        json={"email": "employee@test.com", "password": "employeepassword123"}
    )
    assert login_fail_res.status_code == 403
    assert "pending administrator approval" in login_fail_res.json()["detail"]

    # 3. Log in as Administrator to approve the request
    test_client.cookies.clear()
    admin_login_res = await test_client.post(
        "/api/auth/login",
        json={"email": seed_admin.email, "password": "admin123"}
    )
    admin_token = admin_login_res.cookies.get("access_token")
    test_client.cookies.set("access_token", admin_token)

    # 4. Approve request
    approve_res = await test_client.post(f"/api/users/{employee_id}/approve")
    assert approve_res.status_code == 200
    assert approve_res.json()["approval_status"] == "approved"
    assert approve_res.json()["is_active"] is True

    # 5. Log in as employee - should succeed now
    test_client.cookies.clear()
    login_success_res = await test_client.post(
        "/api/auth/login",
        json={"email": "employee@test.com", "password": "employeepassword123"}
    )
    assert login_success_res.status_code == 200
    assert login_success_res.json()["status"] == "success"


@pytest.mark.asyncio
async def test_self_registration_requires_admin_approval_reject_flow(test_client: AsyncClient, seed_admin: User):
    """Test registration denial by administrator."""
    # 1. Self register as employee
    reg_res = await test_client.post(
        "/api/auth/register",
        json={
            "email": "employee.denied@test.com",
            "username": "emp_denied",
            "full_name": "Rejected Employee",
            "password": "employeepassword123",
            "role": "security_manager"
        }
    )
    assert reg_res.status_code == 200
    employee_id = reg_res.json()["id"]

    # 2. Log in as Administrator to reject
    test_client.cookies.clear()
    admin_login_res = await test_client.post(
        "/api/auth/login",
        json={"email": seed_admin.email, "password": "admin123"}
    )
    admin_token = admin_login_res.cookies.get("access_token")
    test_client.cookies.set("access_token", admin_token)

    # 3. Reject/Deny request
    reject_res = await test_client.post(f"/api/users/{employee_id}/reject")
    assert reject_res.status_code == 200
    assert reject_res.json()["approval_status"] == "rejected"
    assert reject_res.json()["is_active"] is False

    # 4. Attempt login as employee - should fail with rejected status
    test_client.cookies.clear()
    login_fail_res = await test_client.post(
        "/api/auth/login",
        json={"email": "employee.denied@test.com", "password": "employeepassword123"}
    )
    assert login_fail_res.status_code == 403
    assert "request has been denied" in login_fail_res.json()["detail"]
