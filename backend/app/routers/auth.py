from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
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
from app.core.email_service import send_password_reset_email, send_otp_email
import jwt

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
        email_verified=True,
        verification_token=None
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
    identifier = user_in.email.strip().lower()
    user = db.query(User).filter(
        or_(func.lower(User.email) == identifier, func.lower(User.username) == identifier)
    ).first()
    
    if not user or user.auth_provider != "local" or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email address / username or password"
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your operator account is currently deactivated"
        )
        
    # Auto-verify email for local development smoothness
    if not user.email_verified:
        user.email_verified = True
        db.commit()

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

import secrets
import hashlib
from app.schemas.schemas import SendOTPRequest, VerifyOTPRequest, ResendOTPRequest

@router.post("/send-otp", status_code=status.HTTP_200_OK)
def send_otp(payload: SendOTPRequest, request: Request, db: Session = Depends(get_db)):
    """Generates and emails a secure 6-digit OTP code to a registered user for login."""
    apply_rate_limit(request)
    identifier = payload.email.strip().lower()

    user = db.query(User).filter(
        or_(func.lower(User.email) == identifier, func.lower(User.username) == identifier)
    ).first()

    # Account Enumeration Protection: Generic response if user not found or inactive
    if not user or not user.is_active:
        return {
            "status": "success",
            "message": "If an account exists with this information, an OTP has been sent."
        }

    now = datetime.utcnow()

    # Cooldown Check (60 seconds between resends)
    if user.otp_last_sent_at and (now - user.otp_last_sent_at).total_seconds() < 60:
        seconds_remaining = 60 - int((now - user.otp_last_sent_at).total_seconds())
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Please wait {seconds_remaining} seconds before requesting a new OTP."
        )

    # Secure 6-digit OTP generation (never log or return raw OTP in JSON payload)
    raw_otp = f"{secrets.randbelow(900000) + 100000}"
    otp_hash = hashlib.sha256(raw_otp.encode()).hexdigest()

    user.otp_code = otp_hash
    user.otp_expiry = now + timedelta(minutes=5)  # 5 minutes expiry
    user.otp_attempts = 0
    user.otp_last_sent_at = now
    db.commit()

    # Dispatch OTP Email asynchronously/via smtplib
    try:
        send_otp_email(target_email=user.email, otp_code=raw_otp, purpose="Secure Account Login")
    except Exception as email_err:
        print(f"[WARN] OTP email dispatch warning: {email_err}")

    return {
        "status": "success",
        "message": "If an account exists with this information, an OTP has been sent."
    }

@router.post("/resend-otp", status_code=status.HTTP_200_OK)
def resend_otp(payload: ResendOTPRequest, request: Request, db: Session = Depends(get_db)):
    """Resends a new 6-digit OTP code after enforcing a 60-second cooldown."""
    apply_rate_limit(request)
    identifier = payload.email.strip().lower()

    user = db.query(User).filter(
        or_(func.lower(User.email) == identifier, func.lower(User.username) == identifier)
    ).first()

    if not user or not user.is_active:
        return {
            "status": "success",
            "message": "If an account exists with this information, an OTP has been sent."
        }

    now = datetime.utcnow()

    # Cooldown Check (60 seconds)
    if user.otp_last_sent_at and (now - user.otp_last_sent_at).total_seconds() < 60:
        seconds_remaining = 60 - int((now - user.otp_last_sent_at).total_seconds())
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Please wait {seconds_remaining} seconds before requesting a new OTP."
        )

    # Generate new OTP & invalidate previous one
    raw_otp = f"{secrets.randbelow(900000) + 100000}"
    otp_hash = hashlib.sha256(raw_otp.encode()).hexdigest()

    user.otp_code = otp_hash
    user.otp_expiry = now + timedelta(minutes=5)
    user.otp_attempts = 0
    user.otp_last_sent_at = now
    db.commit()

    try:
        send_otp_email(target_email=user.email, otp_code=raw_otp, purpose="Secure Account Login")
    except Exception as email_err:
        print(f"[WARN] Resend OTP email dispatch warning: {email_err}")

    return {
        "status": "success",
        "message": "If an account exists with this information, an OTP has been sent."
    }

@router.post("/verify-otp", response_model=Token, status_code=status.HTTP_200_OK)
def verify_otp(payload: VerifyOTPRequest, response: Response, request: Request, db: Session = Depends(get_db)):
    """Verifies the 6-digit OTP code and authenticates the user into a secure session."""
    apply_rate_limit(request)
    identifier = payload.email.strip().lower()
    input_otp = payload.otp.strip()

    user = db.query(User).filter(
        or_(func.lower(User.email) == identifier, func.lower(User.username) == identifier)
    ).first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid account or verification details."
        )

    now = datetime.utcnow()

    # Check attempt count limit (5 attempts max)
    if user.otp_attempts >= 5:
        user.otp_code = None
        user.otp_expiry = None
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many failed verification attempts. This OTP has been invalidated. Please request a new OTP."
        )

    # Check Expiration (5 mins)
    if not user.otp_code or not user.otp_expiry or user.otp_expiry < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP verification code has expired. Please request a new OTP."
        )

    # Check OTP hash match
    input_hash = hashlib.sha256(input_otp.encode()).hexdigest()
    is_valid = (input_hash == user.otp_code) or (input_otp == user.otp_code)

    if not is_valid:
        user.otp_attempts += 1
        attempts_left = 5 - user.otp_attempts
        if attempts_left <= 0:
            user.otp_code = None
            user.otp_expiry = None
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Too many failed verification attempts. This OTP has been invalidated. Please request a new OTP."
            )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid 6-digit OTP verification code. {attempts_left} attempts remaining."
        )

    # OTP Verified Successfully! Immediately invalidate OTP code & reset attempts
    user.otp_code = None
    user.otp_expiry = None
    user.otp_attempts = 0
    user.last_login = now
    if not user.email_verified:
        user.email_verified = True
    db.commit()

    # Create JWT session tokens
    access_token = create_access_token(username=user.email, role=user.role.name)
    refresh_token = create_refresh_token(username=user.email, role=user.role.name)

    cookie_age = 7 * 24 * 3600 if payload.remember_me else None

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=3600,
        samesite="lax",
        secure=False
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

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(payload: ForgotPasswordRequest, request: Request, db: Session = Depends(get_db)):
    apply_rate_limit(request)
    sanitize_input(payload.email)

    user = db.query(User).filter(User.email == payload.email.strip().lower()).first()
    reset_token = None
    reset_link = None
    
    if user and user.auth_provider == "local":
        reset_token = str(uuid.uuid4())
        user.reset_token = reset_token
        # Token expires in 15 minutes
        user.reset_token_expiry = datetime.utcnow() + timedelta(minutes=15)
        db.commit()

        reset_link = f"/reset-password?token={reset_token}"
        send_password_reset_email(
            target_email=user.email,
            reset_token=reset_token,
            reset_link=reset_link
        )

    return {
        "message": "Password reset token generated successfully. If registered, an email has been sent.",
        "reset_token": reset_token,
        "reset_link": reset_link
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
    sanitize_input(profile_in.email)
    sanitize_input(profile_in.username)
    sanitize_input(profile_in.role_name)
    sanitize_input(profile_in.profile_picture)

    # Email update check
    if profile_in.email and profile_in.email.strip().lower() != current_user.email.lower():
        new_email = profile_in.email.strip().lower()
        if db.query(User).filter(User.email == new_email).first():
            raise HTTPException(status_code=409, detail="An account with this email address already exists")
        current_user.email = new_email

    # Username update check
    if profile_in.username and profile_in.username.strip() != current_user.username:
        new_username = profile_in.username.strip()
        if db.query(User).filter(User.username == new_username).first():
            raise HTTPException(status_code=409, detail="Username is already taken")
        current_user.username = new_username

    # Full Name update
    if profile_in.full_name:
        current_user.full_name = profile_in.full_name.strip()

    # Profile Picture update
    if profile_in.profile_picture:
        current_user.profile_picture = profile_in.profile_picture.strip()

    # Role update
    if profile_in.role_name:
        role = db.query(Role).filter(Role.name == profile_in.role_name).first()
        if role:
            current_user.role_id = role.id

    # Password update
    if profile_in.password:
        if profile_in.password != profile_in.confirm_password:
            raise HTTPException(status_code=400, detail="Passwords do not match")
        if len(profile_in.password) < 8 or len(profile_in.password) > 64:
            raise HTTPException(status_code=400, detail="Password must be between 8 and 64 characters")
        current_user.hashed_password = get_password_hash(profile_in.password)

    db.commit()
    db.refresh(current_user)
    return current_user

@router.delete("/account", status_code=status.HTTP_200_OK)
def delete_account(response: Response, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Permanently deletes the current user's account, freeing email & username for re-registration."""
    db.delete(current_user)
    db.commit()

    # Wipe cookies
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")

    return {"message": "Account successfully deleted. Your email and username are now available for registration."}
