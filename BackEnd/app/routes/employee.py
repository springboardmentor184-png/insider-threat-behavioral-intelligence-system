from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import Employee

router = APIRouter(
    prefix="/employees",
    tags=["Employees"]
)


@router.get("/")
def get_employees(
    db: Session = Depends(get_db)
):
    employees = (
        db.query(Employee)
        .order_by(Employee.risk_score.desc())
        .all()
    )

    return [
        {
            "id": employee.id,
            "user": employee.user,
            "name": employee.name or employee.user,
            "employee_id": employee.user,
            "email": employee.email or "-",
            "department": employee.department or "-",
            "designation": employee.designation or "-",
            "manager": employee.manager or "-",
            "risk_score": employee.risk_score or 0,
            "risk_level": employee.risk_level or "Low",
            "anomaly_score": employee.anomaly_score or 0,
            "is_active": employee.is_active
        }
        for employee in employees
    ]


@router.get("/{employee_id}")
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db)
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return {
        "id": employee.id,
        "user": employee.user,
        "name": employee.name or employee.user,
        "employee_id": employee.user,
        "email": employee.email or "-",
        "department": employee.department or "-",
        "designation": employee.designation or "-",
        "manager": employee.manager or "-",
        "risk_score": employee.risk_score or 0,
        "risk_level": employee.risk_level or "Low",
        "anomaly_score": employee.anomaly_score or 0,
        "is_active": employee.is_active
    }