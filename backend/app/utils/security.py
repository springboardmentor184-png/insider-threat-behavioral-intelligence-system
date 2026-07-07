import secrets
from passlib.context import CryptContext

# Set up the bcrypt hashing algorithm
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def generate_otp():
    # Generates a cryptographically secure 6-digit string
    return "".join(str(secrets.randbelow(10)) for _ in range(6))