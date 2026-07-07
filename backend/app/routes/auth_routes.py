from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.models.user_model import User
from app.utils.security import get_password_hash, verify_password, generate_otp
from app.auth.jwt_handler import sign_jwt

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Temporary memory storage for our generated OTPs
otp_storage = {}

# --- Pydantic Data Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "Security Analyst"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp_code: str

# --- Authentication Routes ---
@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pw = get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_pw, role=user.role)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User registered successfully", "email": new_user.email}

@router.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    password_is_valid = verify_password(user.password, db_user.hashed_password)
    if not password_is_valid:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    return sign_jwt(db_user.email, db_user.role)

@router.post("/request-otp")
def request_otp(data: OTPRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == data.email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    secure_code = generate_otp()
    otp_storage[data.email] = secure_code
    
    print(f"\n--- SECURE SYSTEM ALERT ---")
    print(f"OTP for {data.email} is: {secure_code}")
    print(f"---------------------------\n")
    
    return {"message": "OTP has been generated and sent to the registered email."}

@router.post("/verify-otp")
def verify_otp(data: OTPVerify, db: Session = Depends(get_db)):
    saved_code = otp_storage.get(data.email)
    if not saved_code:
        raise HTTPException(status_code=400, detail="No OTP requested for this email.")
        
    if data.otp_code != saved_code:
        raise HTTPException(status_code=401, detail="Invalid OTP code.")
        
    db_user = db.query(User).filter(User.email == data.email).first()
    db_user.is_active = True
    db.commit()
    
    del otp_storage[data.email]
    
    return {"message": "OTP validated successfully. Account is now fully active."}