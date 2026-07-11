from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.employee import Employee
from app.models.activity import ActivityLog

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def dashboard(db: Session = Depends(get_db)):

    total_employees = db.query(Employee).count()

    total_activities = db.query(ActivityLog).count()

    total_admins = (
        db.query(Employee)
        .filter(Employee.role == "admin")
        .count()
    )

    total_users = (
        db.query(Employee)
        .filter(Employee.role == "employee")
        .count()
    )

    return {
        "total_employees": total_employees,
        "total_activities": total_activities,
        "admins": total_admins,
        "employees": total_users
    }