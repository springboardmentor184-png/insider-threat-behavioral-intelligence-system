from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from ..database import get_db
from ..models import User
from ..schemas import UserRegister
from ..dependencies import get_current_user, require_role

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# =========================================================
# GET ALL USERS
# Administrator + Security Manager
# =========================================================

@router.get("/")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("Administrator", "Security Manager")
    )
):
    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "department": user.department,
            "is_active": user.is_active,
            "created_at": user.created_at
        }
        for user in users
    ]


# =========================================================
# CREATE USER
# Administrator only
# =========================================================

@router.post("/")
def create_user(
    new_user: UserRegister,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("Administrator")
    )
):
    existing = (
        db.query(User)
        .filter(User.email == new_user.email)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    hashed_password = pwd_context.hash(
        new_user.password
    )

    user = User(
        full_name=new_user.full_name,
        email=new_user.email,
        password=hashed_password,
        role=new_user.role,
        department=new_user.department,
        is_active=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User created successfully",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "department": user.department
        }
    }


# =========================================================
# UPDATE USER
# Administrator only
# =========================================================

@router.put("/{user_id}")
def update_user(
    user_id: int,
    updated_user: UserRegister,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("Administrator")
    )
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    existing = (
        db.query(User)
        .filter(
            User.email == updated_user.email,
            User.id != user_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    user.full_name = updated_user.full_name
    user.email = updated_user.email
    user.role = updated_user.role
    user.department = updated_user.department

    if updated_user.password:
        user.password = pwd_context.hash(
            updated_user.password
        )

    db.commit()
    db.refresh(user)

    return {
        "message": "User updated successfully",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "department": user.department
        }
    }


# =========================================================
# DELETE USER
# Administrator only
# =========================================================

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("Administrator")
    )
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account"
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully"
    }


# =========================================================
# CURRENT USER PROFILE
# All authenticated users
# =========================================================

@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "department": current_user.department,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at
    }