import os

from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from ..database import get_db
from ..models import User
from ..utils.security import create_access_token

load_dotenv()

router = APIRouter(
    tags=["OAuth"]
)

oauth = OAuth()

oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url=(
        "https://accounts.google.com/"
        ".well-known/openid-configuration"
    ),
    client_kwargs={
        "scope": "openid email profile"
    }
)


# =========================================================
# GOOGLE LOGIN
# =========================================================

@router.get("/auth/google/login")
async def google_login(request: Request):
    redirect_uri = (
        "http://127.0.0.1:8000/"
        "auth/google/callback"
    )

    return await oauth.google.authorize_redirect(
        request,
        redirect_uri
    )


# =========================================================
# GOOGLE CALLBACK
# =========================================================

@router.get("/auth/google/callback")
async def google_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    token = await oauth.google.authorize_access_token(request)

    user_info = token.get("userinfo")

    if not user_info:
        raise HTTPException(
            status_code=400,
            detail="Could not retrieve Google user information"
        )

    email = user_info.get("email")
    full_name = user_info.get(
        "name",
        "Google User"
    )

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Google account email not available"
        )

    existing = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    # -----------------------------------------------------
    # CREATE USER IF NOT EXISTS
    # -----------------------------------------------------

    if existing is None:
        existing = User(
            full_name=full_name,
            email=email,
            password="oauth_google_no_password",
            role="Security Analyst",
            department="Not Set",
            is_active=True
        )

        db.add(existing)
        db.commit()
        db.refresh(existing)

    # -----------------------------------------------------
    # CHECK ACCOUNT STATUS
    # -----------------------------------------------------

    if not existing.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive"
        )

    # -----------------------------------------------------
    # CREATE JWT
    # -----------------------------------------------------

    access_token = create_access_token({
        "sub": existing.email,
        "role": existing.role
    })

    # -----------------------------------------------------
    # REDIRECT TO REACT FRONTEND
    # -----------------------------------------------------

    frontend_redirect = (
        "http://localhost:5173/oauth-success"
        f"?token={access_token}"
        f"&role={existing.role}"
        f"&name={existing.full_name}"
        f"&department={existing.department}"
    )

    return RedirectResponse(
        url=frontend_redirect
    )