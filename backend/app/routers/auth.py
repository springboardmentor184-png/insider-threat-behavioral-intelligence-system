from fastapi import APIRouter
from sqlalchemy.orm import Session
from fastapi import Depends

from ..database import get_db
from ..schemas import UserRegister
from ..schemas import UserLogin
from ..models import User
from ..utils.security import hash_password, verify_password, create_access_token

router = APIRouter(tags=["Authentication"])

@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):

    existing = db.query(User).filter(User.email == user.email).first()

    if existing:
        return {"message": "Email already exists"}

    hashed_pw = hash_password(user.password)

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=hashed_pw,
        role=user.role,
        department=user.department
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Registration Successful",
        "user_id": new_user.id
    }


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    existing = db.query(User).filter(User.email == user.email).first()

    if existing is None:
        return {"message": "Invalid Email"}

    if not verify_password(user.password, existing.password):
        return {"message": "Invalid Password"}

    token = create_access_token({
        "sub": existing.email,
        "role": existing.role
    })

    return {
        "message": "Login Successful",
        "access_token": token,
        "token_type": "bearer",
        "user": existing.full_name,
        "role": existing.role
    }