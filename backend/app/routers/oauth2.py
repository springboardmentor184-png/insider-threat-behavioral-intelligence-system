import os
from fastapi import APIRouter, Request, Depends
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from ..database import get_db
from ..models import User
from ..utils.security import create_access_token

load_dotenv()

router = APIRouter(tags=["OAuth"])

oauth = OAuth()

oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

@router.get("/auth/google/login")
async def google_login(request: Request):
    redirect_uri = "http://127.0.0.1:8000/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/auth/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")

    email = user_info["email"]
    full_name = user_info.get("name", "Google User")

    existing = db.query(User).filter(User.email == email).first()

    if existing is None:
        existing = User(
            full_name=full_name,
            email=email,
            password="oauth_google_no_password",
            role="Security Analyst",
            department="Not Set"
        )
        db.add(existing)
        db.commit()
        db.refresh(existing)

    access_token = create_access_token({
        "sub": existing.email,
        "role": existing.role
    })

    frontend_redirect = f"http://localhost:5173/oauth-success?token={access_token}&role={existing.role}&name={existing.full_name}"
    return RedirectResponse(frontend_redirect)