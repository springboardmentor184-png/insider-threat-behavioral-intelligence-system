# backend/app/api/auth.py
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import hash_password, verify_password, create_access_token, get_current_user
from ..models import models
from pydantic import BaseModel, EmailStr

router = APIRouter()

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role_name: str = "Security Analyst"

class UserLogin(BaseModel):
    username: str
    password: str

@router.post("/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    role = db.query(models.Role).filter(models.Role.role_name == user_data.role_name).first()
    if not role:
        role = models.Role(role_name=user_data.role_name, description=f"{user_data.role_name} role")
        db.add(role)
        db.commit()
        db.refresh(role)

    new_user = models.User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role_id=role.role_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Auto-create Employee profile
    new_employee = models.Employee(
        employee_id=str(uuid.uuid4()),
        user_id=new_user.user_id,
        first_name=user_data.username.capitalize(),
        last_name="User",
        email=user_data.email,
        department="Security",
        designation=user_data.role_name,
        status="active"
    )
    db.add(new_employee)
    db.commit()

    return {"message": "User and Employee profile created successfully! You can now log in."}

@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    access_token = create_access_token(data={"sub": user.username})
    employee = db.query(models.Employee).filter(models.Employee.user_id == user.user_id).first()
    emp_id = employee.employee_id if employee else None

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role.role_name,
        "username": user.username,
        "employee_id": emp_id
    }

@router.get("/me")
def get_me(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.user_id == current_user.user_id).first()
    return {
        "user_id": current_user.user_id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role.role_name,
        "employee_id": employee.employee_id if employee else None,
        "employee_name": f"{employee.first_name} {employee.last_name}" if employee else current_user.username
    }