# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from app.schemas.user import OTPRequest, OTPVerify
# from app.services.otp_service import create_otp, verify_otp
# from app.schemas.user import UserCreate, UserResponse
# from app.services.auth_service import create_user
# from app.core.dependencies import get_db
# from app.models.user import User
# from app.schemas.user import UserCreate, UserResponse, UserLogin
# from app.services.auth_service import create_user, login_user
# router = APIRouter()


# @router.post("/register", response_model=UserResponse)
# def register(user: UserCreate, db: Session = Depends(get_db)):

#     existing_user = db.query(User).filter(
#         User.email == user.email
#     ).first()

#     if existing_user:
#         raise HTTPException(
#             status_code=400,
#             detail="Email already registered"
#         )

#     return create_user(db, user)



# @router.post("/login")
# def login(user: UserLogin, db: Session = Depends(get_db)):

#     result = login_user(
#         db,
#         user.email,
#         user.password
#     )

#     if result is None:
#         raise HTTPException(
#             status_code=401,
#             detail="Invalid email or password"
#         )

#     if "error" in result:
#         raise HTTPException(
#             status_code=403,
#             detail=result["error"]
#         )

#     return result
# @router.post("/request-otp")
# def request_otp(
#     request: OTPRequest,
#     db: Session = Depends(get_db)
# ):

#     otp = create_otp(db, request.email)

#     if otp is None:
#         raise HTTPException(
#             status_code=404,
#             detail="No account found with this email address."
#         )

#     return {
#         "success": True,
#         "message": "OTP has been generated successfully. Please verify your email.",
#         "otp": otp      # Remove this later when email sending is implemented
#     }
# @router.post("/verify-otp")
# def verify_email(
#     request: OTPVerify,
#     db: Session = Depends(get_db)
# ):

#     success = verify_otp(
#         db,
#         request.email,
#         request.otp
#     )

#     if not success:
#         raise HTTPException(
#             status_code=400,
#             detail="Invalid or expired OTP."
#         )

#     return {
#         "success": True,
#         "message": "Email verified successfully."
#     }

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from fastapi.security import OAuth2PasswordRequestForm

from app.core.dependencies import get_db
from app.models.user import User

from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserLogin,
    OTPRequest,
    OTPVerify
)

from app.services.auth_service import (
    create_user,
    login_user
)

from app.services.otp_service import (
    create_otp,
    verify_otp
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register", response_model=UserResponse)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    return create_user(db, user)


# @router.post("/login")
# def login(
#     user: UserLogin,
#     db: Session = Depends(get_db)
# ):

#     result = login_user(
#         db,
#         user.email,
#         user.password
#     )

#     if result is None:
#         raise HTTPException(
#             status_code=401,
#             detail="Invalid email or password."
#         )

#     if "error" in result:
#         raise HTTPException(
#             status_code=403,
#             detail=result["error"]
#         )

#     return result


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    result = login_user(
        db,
        form_data.username,
        form_data.password
    )

    if result is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    if "error" in result:
        raise HTTPException(
            status_code=403,
            detail=result["error"]
        )

    return result

# @router.post("/request-otp")
# def request_otp(
#     request: OTPRequest,
#     db: Session = Depends(get_db)
# ):

#     otp = create_otp(
#         db,
#         request.email
#     )

#     if otp is None:
#         raise HTTPException(
#             status_code=404,
#             detail="No account found with this email address."
#         )

#     return {
#         "success": True,
#         "message": "OTP has been generated successfully. Please verify your email.",
#         "otp": otp   # Remove this after email integration
#     }


@router.post("/request-otp")
def request_otp(
    request: OTPRequest,
    db: Session = Depends(get_db)
):

    success = create_otp(
        db,
        request.email
    )

    if success is None:
        raise HTTPException(
            status_code=404,
            detail="No account found with this email address."
        )

    if success is False:
        raise HTTPException(
            status_code=500,
            detail="Failed to send OTP email. Please try again."
        )

    return {
        "success": True,
        "message": "OTP has been sent successfully to your email."
    }

@router.post("/verify-otp")
def verify_email(
    request: OTPVerify,
    db: Session = Depends(get_db)
):

    success = verify_otp(
        db,
        request.email,
        request.otp
    )

    if not success:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OTP."
        )

    return {
        "success": True,
        "message": "Email verified successfully."
    }