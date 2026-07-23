from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid
import re
from typing import Optional, Dict

from app.database import get_db
from app.models.models import User, Role
from app.schemas.schemas import (
    UserCreate, UserResponse, UserLogin, Token,
    ForgotPasswordRequest, ResetPasswordRequest, ProfileUpdate, TokenRefreshRequest, GoogleLoginRequest
)
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Rate limit simulator (using simple in-memory IP log)
ip_request_timestamps = {}

def apply_rate_limit(request: Request):
    ip = request.client.host
    now = datetime.now()
    if ip not in ip_request_timestamps:
        ip_request_timestamps[ip] = []
    
    # Keep only requests within the last minute
    ip_request_timestamps[ip] = [t for t in ip_request_timestamps[ip] if now - t < timedelta(minutes=1)]
    
    # Max 100 requests per minute
    if len(ip_request_timestamps[ip]) >= 100:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again in a minute."
        )
    ip_request_timestamps[ip].append(now)

def sanitize_input(text: Optional[str]):
    if not text:
        return
    # Scan for common SQLi statements/characters
    sqli_patterns = [
        r"(?i)\b(union|select|insert|update|delete|drop|alter|truncate|create)\b",
        r"(--|#|\/\*|\*\/)"
    ]
    # Scan for HTML script blocks or inline script attributes (XSS)
    xss_patterns = [
        r"(?i)<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>",
        r"(?i)\bon\w+\s*=",
        r"(?i)javascript:"
    ]
    for pattern in sqli_patterns + xss_patterns:
        if re.search(pattern, text):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Security Threat: Malicious input patterns detected (SQLi/XSS protection)."
            )

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, request: Request, db: Session = Depends(get_db)):
    apply_rate_limit(request)
    
    # Input sanitization
    sanitize_input(user_in.full_name)
    sanitize_input(user_in.username)
    sanitize_input(user_in.email)
    
    # Check duplicate email
    if db.query(User).filter(User.email == user_in.email.strip().lower()).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists"
        )
        
    # Check duplicate username if provided
    if user_in.username:
        if db.query(User).filter(User.username == user_in.username.strip()).first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This username is already taken"
            )
            
    # Find role
    role = db.query(Role).filter(Role.name == user_in.role_name).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role '{user_in.role_name}' does not exist"
        )

    verification_token = str(uuid.uuid4())
    
    db_user = User(
        full_name=user_in.full_name,
        username=user_in.username.strip() if user_in.username else None,
        email=user_in.email.strip().lower(),
        hashed_password=get_password_hash(user_in.password),
        role_id=role.id,
        auth_provider="local",
        email_verified=False,
        verification_token=verification_token
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # SMTP Simulation - Outputting verification link to console
    print(f"\n========================================================")
    print(f"[SMTP SIMULATOR] Email verification sent to {db_user.email}")
    print(f"Click here to verify: http://localhost:3000/verify-email?token={verification_token}")
    print(f"========================================================\n")
    
    return db_user

@router.post("/verify-email", status_code=status.HTTP_200_OK)
def verify_email(payload: Dict[str, str], db: Session = Depends(get_db)):
    token = payload.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Verification token is required")
        
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=404, detail="Invalid or expired verification token")
        
    user.email_verified = True
    user.verification_token = None
    db.commit()
    return {"message": "Email address successfully verified. You may now log in."}

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, response: Response, request: Request, db: Session = Depends(get_db)):
    apply_rate_limit(request)
    sanitize_input(user_in.email)

    user = db.query(User).filter(User.email == user_in.email.strip().lower()).first()
    if not user or user.auth_provider != "local" or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email address or password"
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your operator account is currently deactivated"
        )
        
    # Prevent login if email verification is mandatory
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email address before logging in."
        )

    # Generate session tokens
    access_token = create_access_token(username=user.email, role=user.role.name)
    refresh_token = create_refresh_token(username=user.email, role=user.role.name)
    
    # Record last login timestamp
    user.last_login = datetime.utcnow()
    db.commit()

    # Determine cookie duration based on 'Remember Me'
    cookie_age = 7 * 24 * 3600 if user_in.remember_me else None  # 7 days or browser session

    # Set secure HttpOnly cookies (production HTTPS ready)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=3600,
        samesite="lax",
        secure=False  # Set to True in production over HTTPS
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=cookie_age,
        samesite="lax",
        secure=False
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(response: Response):
    # Wipe authentication cookies
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Session terminated successfully."}

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(payload: ForgotPasswordRequest, request: Request, db: Session = Depends(get_db)):
    apply_rate_limit(request)
    sanitize_input(payload.email)

    user = db.query(User).filter(User.email == payload.email.strip().lower()).first()
    reset_token = None
    
    if user and user.auth_provider == "local":
        reset_token = str(uuid.uuid4())
        user.reset_token = reset_token
        # Token expires in 15 minutes
        user.reset_token_expiry = datetime.utcnow() + timedelta(minutes=15)
        db.commit()

        # SMTP Simulation - Outputting reset link to console
        print(f"\n========================================================")
        print(f"[SMTP SIMULATOR] Password reset sent to {user.email}")
        print(f"Click here to reset: http://localhost:3000/reset-password?token={reset_token}")
        print(f"========================================================\n")

    return {
        "message": "Password reset token generated successfully.",
        "reset_token": reset_token,
        "reset_link": f"/reset-password?token={reset_token}" if reset_token else None
    }

@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(user_in: ResetPasswordRequest, db: Session = Depends(get_db)):
    sanitize_input(user_in.token)

    user = db.query(User).filter(User.reset_token == user_in.token).first()
    if not user or user.reset_token_expiry < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token has expired or is invalid."
        )

    # Hash new password, invalidate reset token
    user.hashed_password = get_password_hash(user_in.password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()

    return {"message": "Password successfully updated. You may now log in."}

@router.post("/refresh-token", response_model=Token)
def refresh_access_token(
    payload: Optional[TokenRefreshRequest] = None,
    request: Request = None,
    response: Response = None,
    db: Session = Depends(get_db)
):
    # Try getting refresh token from payload or cookies
    token = None
    if payload:
        token = payload.refresh_token
    if not token and request:
        token = request.cookies.get("refresh_token")

    if not token:
        raise HTTPException(status_code=401, detail="Refresh token required")

    try:
        claims = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = claims.get("sub")
        token_type = claims.get("type")
        if token_type != "refresh" or username is None:
            raise HTTPException(status_code=401, detail="Invalid token type")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = db.query(User).filter(User.email == username).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User deactivated or not found")

    new_access = create_access_token(username=user.email, role=user.role.name)
    new_refresh = create_refresh_token(username=user.email, role=user.role.name)

    if response:
        response.set_cookie(key="access_token", value=new_access, httponly=True, samesite="lax")
        response.set_cookie(key="refresh_token", value=new_refresh, httponly=True, samesite="lax")

    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer"
    }

@router.post("/google-login", response_model=Token)
def google_login(payload: GoogleLoginRequest, response: Response, db: Session = Depends(get_db)):
    parts = payload.credential.split(":")
    if len(parts) >= 2:
        name = parts[0]
        email = parts[1]
        google_id = parts[2] if len(parts) >= 3 else f"g-{name}"
        pic_url = parts[3] if len(parts) >= 4 else f"https://api.dicebear.com/7.x/adventurer/svg?seed={name}"
    else:
        name = "Google User"
        email = "google_user@gmail.com"
        google_id = "g-1002391"
        pic_url = "https://api.dicebear.com/7.x/adventurer/svg?seed=Google"

    user = db.query(User).filter(User.email == email.strip().lower()).first()
    
    if not user:
        role = db.query(Role).filter(Role.name == "Security Analyst").first()
        if not role:
            role = db.query(Role).first()

        user = User(
            full_name=name,
            username=email.split("@")[0],
            email=email.strip().lower(),
            google_id=google_id,
            profile_picture=pic_url,
            auth_provider="google",
            email_verified=True,  # Google emails are pre-verified
            role_id=role.id
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Link Google ID if logging in for the first time
        if not user.google_id:
            user.google_id = google_id
            user.auth_provider = "google"
            user.profile_picture = pic_url
            user.email_verified = True
            db.commit()

    access_token = create_access_token(username=user.email, role=user.role.name)
    refresh_token = create_refresh_token(username=user.email, role=user.role.name)

    # Record login
    user.last_login = datetime.utcnow()
    db.commit()

    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="lax")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax")

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(profile_in: ProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sanitize_input(profile_in.full_name)
    sanitize_input(profile_in.username)
    sanitize_input(profile_in.profile_picture)

    if profile_in.username and profile_in.username != current_user.username:
        if db.query(User).filter(User.username == profile_in.username).first():
            raise HTTPException(status_code=409, detail="Username is already taken")
        current_user.username = profile_in.username
        
    if profile_in.full_name:
        current_user.full_name = profile_in.full_name
    if profile_in.profile_picture:
        current_user.profile_picture = profile_in.profile_picture

    db.commit()
    db.refresh(current_user)
    return current_user
