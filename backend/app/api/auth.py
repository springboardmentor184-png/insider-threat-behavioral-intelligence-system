from fastapi import APIRouter
from app.schemas.user import UserCreate
from app.services.security import hash_password, verify_password

router = APIRouter()


@router.post("/register")
def register_user(user: UserCreate):
    hashed_password = hash_password(user.password)

    is_valid = verify_password(user.password, hashed_password)

    print(f"Original Password: {user.password}")
    print(f"Hashed Password: {hashed_password}")
    print(f"Password Verified: {is_valid}")
    
    return {
        "message": "User registered successfully!",
        "user": {
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }