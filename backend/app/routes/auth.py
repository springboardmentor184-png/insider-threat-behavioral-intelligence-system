from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.schemas.employee import EmployeeResponse
from app.services.auth_service import register_employee, login_employee

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=EmployeeResponse
)
def register(
    employee: RegisterRequest,
    db: Session = Depends(get_db)
):

    new_employee = register_employee(db, employee)

    if new_employee is None:
        raise HTTPException(
            status_code=400,
            detail="Email already exists."
        )

    return new_employee


@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):

    token = login_employee(
        db,
        request.email,
        request.password
    )

    if token is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    return token