from fastapi import APIRouter
from app.schemas.user import UserCreate
from app.services.security import hash_password

router = APIRouter()


@router.post("/register")
def register_user(user: UserCreate):
    hashed_password = hash_password(user.password)

    print(f"Original Password: {user.password}")
    print(f"Hashed Password: {hashed_password}")
    
    return {
        "message": "User registered successfully!",
        "user": {
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }