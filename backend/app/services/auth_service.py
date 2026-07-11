from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.schemas.auth import RegisterRequest
from app.core.security import hash_password, verify_password, create_access_token


def register_employee(db: Session, employee: RegisterRequest):

    existing_employee = (
        db.query(Employee)
        .filter(Employee.email == employee.email)
        .first()
    )

    if existing_employee:
        return None

    db_employee = Employee(
        full_name=employee.full_name,
        email=employee.email,
        password=hash_password(employee.password),
        role=employee.role
    )

    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)

    return db_employee


def login_employee(db: Session, email: str, password: str):

    employee = (
        db.query(Employee)
        .filter(Employee.email == email)
        .first()
    )

    if employee is None:
        return None

    if not verify_password(password, employee.password):
        return None

    token = create_access_token(
        {
            "sub": employee.email,
            "role": employee.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }