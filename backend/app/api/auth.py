# backend/app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import hash_password, verify_password, create_access_token
from ..models import models
from pydantic import BaseModel, EmailStr

router = APIRouter()

# 1. We need "Schemas" to tell the computer what data to expect
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role_name: str = "Analyst"  # Default role

class UserLogin(BaseModel):
    username: str
    password: str

# 2. The "Sign Up" Route
@router.post("/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Find the role in our database
    role = db.query(models.Role).filter(models.Role.role_name == user_data.role_name).first()
    if not role:
        # If the role doesn't exist, we create it (for now)
        role = models.Role(role_name=user_data.role_name)
        db.add(role)
        db.commit()
        db.refresh(role)

    # Create the new user with a "scrambled" password
    new_user = models.User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role_id=role.role_id
    )
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully! You can now log in."}

# 3. The "Login" Route
@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Create the "ID Badge" (JWT Token)
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}
