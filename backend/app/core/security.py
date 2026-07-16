# backend/app/core/security.py
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt

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
