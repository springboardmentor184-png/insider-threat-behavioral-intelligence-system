from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from . import models, schemas, auth
from .database import get_db

router = APIRouter()


@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=auth.hash_password(user.password),
        role=user.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserOut)
def read_current_user(current_user: models.User = Depends(auth.get_current_user)):
    return current_user
@router.get("/users", response_model=list[schemas.UserOut])
def list_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["administrator"]))
):
    return db.query(models.User).all()