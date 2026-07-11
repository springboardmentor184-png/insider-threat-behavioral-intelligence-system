from fastapi import APIRouter, Depends, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, CurrentUser
from app.services import auth_service
from app.models.employee import Employee

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    auth_service.register_employee(db, req, request)
    return {"message": "Registration Success"}

@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    req = LoginRequest(email=form_data.username, password=form_data.password)
    return auth_service.login_employee(db, req, request)

@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(request: Request, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    return auth_service.logout_employee(db, current_user.id, request)

@router.get("/me", response_model=CurrentUser, status_code=status.HTTP_200_OK)
def get_me(current_user: Employee = Depends(get_current_user)):
    return current_user
