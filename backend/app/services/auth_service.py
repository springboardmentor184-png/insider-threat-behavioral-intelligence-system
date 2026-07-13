from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate,UserUpdate, ChangePassword
from app.services.otp_service import create_otp
from app.core.security import hash_password,  verify_password
from fastapi import HTTPException
from app.core.security import verify_password, create_access_token


from app.services.audit_service import create_audit_log

# def create_user(db: Session, user: UserCreate):

#     db_user = User(
#         username=user.username,
#         email=user.email,
#         full_name=user.full_name,
#         hashed_password=hash_password(user.password),
#         role=user.role
#     )

#     db.add(db_user)
#     db.commit()
#     db.refresh(db_user)

#     return db_user

def create_user(db, user: UserCreate):

    db_user = User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hash_password(user.password),
        role=user.role
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    create_audit_log(
        db=db,
        user_id=db_user.id,
        action="REGISTER",
        status="SUCCESS",
        description="User account created successfully."
    )

    return db_user


# def login_user(db: Session, email: str, password: str):

#     user = db.query(User).filter(
#         User.email == email
#     ).first()

#     if not user:
#         return None

#     if not verify_password(password, user.hashed_password):
#         return None
    
#     if not user.is_verified:
#         return {
#             "error": "Please verify your email before logging in."
#         }

#     token = create_access_token(
#         data={
#             "sub": user.email,
#             "role": user.role
#         }
#     )
#     create_audit_log(
#     db=db,
#     user_id=user.id,
#     action="LOGIN",
#     status="SUCCESS",
#     description="User logged in successfully."
# )

#     return {
#         "access_token": token,
#         "token_type": "bearer"
#     }



def login_user(db: Session, email: str, password: str):

    user = db.query(User).filter(
        User.email == email
    ).first()

    # Email not found
    if not user:
        create_audit_log(
            db=db,
            user_id=None,
            action="LOGIN",
            status="FAILED",
            description=f"Login failed for email: {email}"
        )
        return None

    # Wrong password
    if not verify_password(password, user.hashed_password):
        create_audit_log(
            db=db,
            user_id=user.id,
            action="LOGIN",
            status="FAILED",
            description="Incorrect password."
        )
        return None

    # Email not verified
    if not user.is_verified:
        create_audit_log(
            db=db,
            user_id=user.id,
            action="LOGIN",
            status="FAILED",
            description="Email not verified."
        )
        return {
            "error": "Please verify your email before logging in."
        }

    # Generate JWT
    token = create_access_token(
        data={
            "sub": user.email,
            "role": user.role
        }
    )

    # Successful login
    create_audit_log(
        db=db,
        user_id=user.id,
        action="LOGIN",
        status="SUCCESS",
        description="User logged in successfully."
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

from app.schemas.user import UserUpdate


# def update_profile(
#     db: Session,
#     current_user: User,
#     user_data: UserUpdate
# ):

#     current_user.username = user_data.username
#     current_user.full_name = user_data.full_name

#     db.commit()
#     db.refresh(current_user)

#     return current_user

def update_profile(
    db: Session,
    current_user: User,
    user_data: UserUpdate
):

    # Check if username already exists
    existing_user = db.query(User).filter(
        User.username == user_data.username,
        User.id != current_user.id
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists."
        )

    current_user.username = user_data.username
    current_user.full_name = user_data.full_name

    db.commit()
    db.refresh(current_user)

    return current_user

def change_password(
    db: Session,
    current_user: User,
    password_data: ChangePassword
):

    # Check current password
    if not verify_password(
        password_data.current_password,
        current_user.hashed_password
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect."
        )

    # Hash new password
    current_user.hashed_password = hash_password(
        password_data.new_password
    )

    db.commit()

    return {
        "message": "Password changed successfully."
    }