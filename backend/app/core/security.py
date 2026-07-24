# backend/app/core/security.py
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from jose import JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models import models
from typing import List
# OAuth2 scheme (token extraction)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")  # matches your login endpoint

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user
# 1. Tool to "scramble" passwords so hackers can't read them
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 2. Secret keys for our "ID Badges" (JWT)
SECRET_KEY = "SUPER_SECRET_KEY_CHANGE_THIS_LATER"
ALGORITHM = "HS256"

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    # Badge expires in 30 minutes
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
def require_roles(allowed_roles: List[str]):
    def role_checker(current_user: models.User = Depends(get_current_user)):
        if current_user.role.role_name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden. Required roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker