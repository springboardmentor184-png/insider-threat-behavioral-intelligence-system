from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordBearer

from app.services.jwt_handler import (
    create_access_token,
    verify_access_token,
    get_current_user
)
from app.schemas.user import UserCreate, UserLogin
from app.services.security import hash_password, verify_password
from app.database import get_db
from app.models.user import User
from app.services.rbac import require_role

router = APIRouter()

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

@router.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
    ):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = hash_password(user.password)

    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role=user.role.value
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    is_valid = verify_password(user.password, hashed_password)

    print(f"Original Password: {user.password}")
    print(f"Hashed Password: {hashed_password}")
    print(f"Password Verified: {is_valid}")
    
    return {
        "message": "User registered successfully!",
        "user": {
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }
    }

@router.post("/login")
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not verify_password(
        user.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer"
    }

@router.get("/profile")
def get_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.email == current_user["sub"]
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "message": "Profile fetched successfully",
        "user": {
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role
        }
    }


@router.get("/analyst")
def analyst_dashboard(
    current_user: dict = Depends(
        require_role("Security Analyst")
    )
):
    return {
        "message": "Welcome Security Analyst",
        "user": current_user
    }


@router.get("/manager")
def manager_dashboard(
    current_user: dict = Depends(
        require_role("Security Manager")
    )
):
    return {
        "message": "Welcome Security Manager",
        "user": current_user
    }


@router.get("/admin")
def admin_dashboard(
    current_user: dict = Depends(
        require_role("Administrator")
    )
):
    return {
        "message": "Welcome Administrator",
        "user": current_user
    }