"""
Authentication routes: register, login, Google OAuth2, token refresh, logout, and Google Authenticator TOTP 2FA.
"""

from fastapi import APIRouter, Depends, Request, Response, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx
import pyotp
from pydantic import BaseModel

from backend.core.database import get_db
from backend.core.config import get_settings
from backend.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from backend.services.auth_service import register_user, authenticate_user, get_or_create_oauth_user
from backend.core.security import create_access_token, create_refresh_token, decode_access_token
from backend.models.user import User
from backend.services.activity_log_service import create_log
from backend.schemas.activity_log import ActivityLogCreate
from backend.routers.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
settings = get_settings()

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


# --- Request/Response Schemas for TOTP MFA ---

class TOTPSetupResponse(BaseModel):
    secret: str
    provisioning_uri: str


class TOTPEnableRequest(BaseModel):
    secret: str
    code: str


class TOTPVerifyRequest(BaseModel):
    email: str
    code: str


def set_auth_cookies(response: Response, user: User):
    """Utility helper to generate tokens and set them in HttpOnly cookies."""
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value}
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value}
    )

    # Set Access Token Cookie (15 minutes)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=15 * 60,
        expires=15 * 60,
        samesite="lax",
        secure=False,  # Set to True in production with HTTPS
    )

    # Set Refresh Token Cookie (7 days)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=7 * 24 * 60 * 60,
        expires=7 * 24 * 60 * 60,
        samesite="lax",
        secure=False,  # Set to True in production with HTTPS
    )

    return access_token


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    user = await register_user(db, user_data)
    return user


@router.post("/login")
async def login(
    user_data: UserLogin,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Login with email and password. Sets cookies directly (or triggers 2FA check)."""
    user = await authenticate_user(db, user_data.email, user_data.password)

    # Check if Google Authenticator (TOTP) is enabled
    if user.is_mfa_enabled:
        return {
            "status": "mfa_required",
            "email": user.email,
            "message": "Google Authenticator code required to complete authentication"
        }

    access_token = set_auth_cookies(response, user)

    # Log the login activity
    await create_log(db, ActivityLogCreate(
        user_id=user.id,
        action="login",
        details="User logged in via email/password",
        ip_address=request.client.host if request.client else None,
    ))

    return {"status": "success", "access_token": access_token}


# --- Google Authenticator TOTP Endpoints ---

@router.post("/2fa/setup", response_model=TOTPSetupResponse)
async def setup_totp(
    current_user: User = Depends(get_current_user),
):
    """Generate a new Google Authenticator secret key and provisioning URI."""
    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(
        name=current_user.email,
        issuer_name="ITBIS-Platform"
    )
    return TOTPSetupResponse(secret=secret, provisioning_uri=provisioning_uri)


@router.post("/2fa/enable")
async def enable_totp(
    payload: TOTPEnableRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Verify 6-digit code and save secret to enable Google Authenticator MFA."""
    totp = pyotp.TOTP(payload.secret)
    if not totp.verify(payload.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 6-digit authentication code"
        )

    # Enable 2FA in user profile
    current_user.totp_secret = payload.secret
    current_user.is_mfa_enabled = True
    await db.flush()
    await db.refresh(current_user)

    return {"status": "success", "message": "Google Authenticator successfully enabled!"}


@router.post("/2fa/disable")
async def disable_totp(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Disable Google Authenticator MFA in user profile."""
    current_user.totp_secret = None
    current_user.is_mfa_enabled = False
    await db.flush()
    await db.refresh(current_user)
    return {"status": "success", "message": "Google Authenticator successfully disabled"}


@router.post("/2fa/verify")
async def verify_totp(
    payload: TOTPVerifyRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """Verify 6-digit code during the login phase to set auth cookies."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

    if not user.is_mfa_enabled or not user.totp_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is not enabled for this user"
        )

    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(payload.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 6-digit verification code"
        )

    # Authentication succeeded, set cookies
    access_token = set_auth_cookies(response, user)

    # Log the successful login
    await create_log(db, ActivityLogCreate(
        user_id=user.id,
        action="login",
        details="User logged in via email/password + Google Authenticator",
        ip_address=request.client.host if request.client else None,
    ))

    return {"status": "success", "access_token": access_token}


# --- Token Refresh & Logout ---

@router.post("/refresh")
async def refresh_tokens(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Rotate tokens using refresh token from HttpOnly cookie."""
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing",
        )

    payload = decode_access_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    access_token = set_auth_cookies(response, user)
    return {"status": "success", "access_token": access_token}


@router.post("/logout")
async def logout(response: Response):
    """Clear HttpOnly authentication cookies."""
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"status": "success", "message": "Successfully logged out"}


# --- Google OAuth2 ---

@router.get("/oauth2/google")
async def google_oauth2_redirect():
    """Redirect user to Google OAuth2 consent screen. Automatically triggers mock callback if credentials are missing."""
    if not settings.GOOGLE_CLIENT_ID or settings.GOOGLE_CLIENT_ID == "your-google-client-id" or settings.GOOGLE_CLIENT_ID == "":
        # Bypassing unconfigured state by redirecting straight to callback with simulation parameters
        return RedirectResponse(url="/api/auth/oauth2/google/callback?code=mock_code_123&mock=true")
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    query_string = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(url=f"{GOOGLE_AUTH_URL}?{query_string}")


@router.get("/oauth2/google/callback")
async def google_oauth2_callback(
    code: str,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    mock: bool = False
):
    """Handle Google OAuth2 callback. Simulates token response if mock is True."""
    if mock or not settings.GOOGLE_CLIENT_ID or settings.GOOGLE_CLIENT_ID == "your-google-client-id":
        user_info = {
            "email": "google.demo@itbis.com",
            "sub": "mock_google_sub_123456",
            "name": "Google Demo User",
            "picture": ""
        }
    else:
        # Exchange authorization code for access token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code",
                },
            )
            token_data = token_response.json()

            # Get user info from Google
            userinfo_response = await client.get(
                GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {token_data['access_token']}"},
            )
            user_info = userinfo_response.json()

    # Create or find user
    user = await get_or_create_oauth_user(db, user_info)
    
    # Set cookies
    redirect_response = RedirectResponse(url="/dashboard")
    set_auth_cookies(redirect_response, user)

    # Log the OAuth login
    await create_log(db, ActivityLogCreate(
        user_id=user.id,
        action="login",
        details="User logged in via Google OAuth2 (Simulated)" if mock else "User logged in via Google OAuth2",
        ip_address=request.client.host if request.client else None,
    ))

    return redirect_response
