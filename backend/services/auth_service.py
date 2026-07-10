from sqlalchemy.orm import Session
from database.models.user import User
from utils.security import hash_password, verify_password, create_access_token

def register_user(db: Session, full_name: str, email: str, password: str, role: str) -> User:
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise ValueError("A user with this email already exists")

    new_user = User(
        full_name=full_name,
        email=email,
        hashed_password=hash_password(password),
        role=role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)   # pulls the auto-generated id back from the DB
    return new_user

def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def login_user(db: Session, email: str, password: str) -> str | None:
    user = authenticate_user(db, email, password)
    if not user:
        return None
    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return token