from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from database.db import get_db
from services import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

# --- Pydantic schemas: define the exact shape of request/response JSON ---
class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "security_analyst"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    try:
        user = auth_service.register_user(
            db, payload.full_name, payload.email, payload.password, payload.role
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"id": user.id, "email": user.email, "role": user.role}

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    token = auth_service.login_user(db, payload.email, payload.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return TokenResponse(access_token=token)