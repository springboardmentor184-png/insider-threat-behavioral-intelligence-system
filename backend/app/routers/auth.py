from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from ..database import get_db
from ..schemas import UserRegister
from ..models import User
from ..utils.security import (
    hash_password,
    verify_password,
    create_access_token,
)

router = APIRouter(
    tags=["Authentication"]
)



@router.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db)
):
    existing = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    hashed_pw = hash_password(user.password)

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=hashed_pw,
        role=user.role,
        department=user.department,
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Registration Successful",
        "user_id": new_user.id
    }



@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    existing = (
        db.query(User)
        .filter(User.email == form_data.username)
        .first()
    )

    if existing is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email"
        )

    if not existing.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive"
        )

    if not verify_password(
        form_data.password,
        existing.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    token = create_access_token({
        "sub": existing.email,
        "role": existing.role
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": existing.full_name,
        "role": existing.role,
        "department": existing.department
    }