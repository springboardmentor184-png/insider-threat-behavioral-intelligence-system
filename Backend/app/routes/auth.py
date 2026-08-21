from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.database import get_db
from app.models import (
    User,
    PasswordResetOTP
)
import secrets
from datetime import datetime, timedelta




from app.schemas import (
    UserRegister,
    UserResponse,
    UserLogin,
    Token,
    ForgotPasswordRequest,
    VerifyOTPRequest,
    ResetPasswordRequest
)

from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_role,
)

from app.config import OTP_EXPIRE_MINUTES

from app.services.password_email_service import send_otp_email

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =====================================================
# Register User
# =====================================================

@router.post(
    "/register",
    response_model=UserResponse
)
def register_user(
    user: UserRegister,
    db: Session = Depends(get_db)
):

    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = hash_password(
        user.password
    )

    new_user = User(
    full_name=user.full_name,
    email=user.email,
    password=hashed_password,
    role="Security Analyst"
)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# =====================================================
# Login User
# =====================================================

@router.post(
    "/login",
    response_model=Token
)
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    db_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": db_user.email
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }



# =====================================================
# Forgot Password - Send OTP
# =====================================================

@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    # Do not reveal whether an email exists
    if not user:

        return {
            "message":
                "If the email is registered, "
                "a password reset OTP has been sent."
        }

    # Invalidate previous unused OTPs
    db.query(PasswordResetOTP).filter(
        PasswordResetOTP.user_id == user.id,
        PasswordResetOTP.is_used == False
    ).update(
        {
            PasswordResetOTP.is_used: True
        }
    )

    # Generate secure 6-digit OTP
    otp = str(
        secrets.randbelow(900000) + 100000
    )

    expires_at = (
        datetime.utcnow()
        + timedelta(
            minutes=OTP_EXPIRE_MINUTES
        )
    )

    otp_record = PasswordResetOTP(
        user_id=user.id,
        otp=otp,
        expires_at=expires_at,
        is_used=False
    )

    db.add(otp_record)
    db.commit()

    try:

        send_otp_email(
            request.email,
            otp
        )

    except Exception:

        db.delete(otp_record)
        db.commit()

        raise HTTPException(
            status_code=500,
            detail="Unable to send OTP email."
        )

    return {
        "message":
            "If the email is registered, "
            "a password reset OTP has been sent."
    }

# =====================================================
# Verify Password Reset OTP
# =====================================================

@router.post("/verify-otp")
def verify_otp(
    request: VerifyOTPRequest,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP."
        )

    otp_record = (
        db.query(PasswordResetOTP)
        .filter(
            PasswordResetOTP.user_id == user.id,
            PasswordResetOTP.otp == request.otp,
            PasswordResetOTP.is_used == False
        )
        .order_by(
            PasswordResetOTP.created_at.desc()
        )
        .first()
    )

    if not otp_record:

        raise HTTPException(
            status_code=400,
            detail="Invalid or already used OTP."
        )

    if datetime.utcnow() > otp_record.expires_at:

        raise HTTPException(
            status_code=400,
            detail="OTP has expired."
        )

    return {
        "message": "OTP verified successfully."
    }

# =====================================================
# Reset Password
# =====================================================

@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=400,
            detail="Invalid password reset request."
        )

    otp_record = (
        db.query(PasswordResetOTP)
        .filter(
            PasswordResetOTP.user_id == user.id,
            PasswordResetOTP.otp == request.otp,
            PasswordResetOTP.is_used == False
        )
        .order_by(
            PasswordResetOTP.created_at.desc()
        )
        .first()
    )

    if not otp_record:

        raise HTTPException(
            status_code=400,
            detail="Invalid or already used OTP."
        )

    if datetime.utcnow() > otp_record.expires_at:

        raise HTTPException(
            status_code=400,
            detail="OTP has expired."
        )

    # Update password using existing bcrypt hashing
    user.password = hash_password(
        request.new_password
    )

    # Mark OTP as used
    otp_record.is_used = True

    db.commit()

    return {
        "message":
            "Password reset successfully."
    }


# =====================================================
# Get Current Logged-In User
# =====================================================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_my_profile(
    current_user: User = Depends(get_current_user)
):

    return current_user

# =====================================================
# User Management
# Administrator Only
# =====================================================

@router.get(
    "/users",
    response_model=list[UserResponse]
)
def get_users(
    current_user: User = Depends(
        require_role("Administrator")
    ),
    db: Session = Depends(get_db)
):

    users = (
        db.query(User)
        .order_by(User.id.asc())
        .all()
    )

    return users

# =====================================================
# Swagger OAuth2 Login
# =====================================================

@router.post(
    "/token",
    response_model=Token
)
def swagger_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    db_user = (
        db.query(User)
        .filter(User.email == form_data.username)
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        form_data.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": db_user.email
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }