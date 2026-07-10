from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.user import UserCreate
from app.services.security import hash_password, verify_password
from app.database import get_db
from app.models.user import User

router = APIRouter()


@router.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
    ):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        return {
            "message": "Email already registered"
        }

    hashed_password = hash_password(user.password)

    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password
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