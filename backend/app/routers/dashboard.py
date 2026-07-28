from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from pydantic import BaseModel

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/")
def get_dashboard(db: Session = Depends(get_db)):
    total_users = db.execute(text("SELECT COUNT(*) FROM user_behavior_features")).scalar()
    high_risk = db.execute(text("SELECT COUNT(*) FROM user_behavior_features WHERE risk_flag = 1")).scalar()
    low_risk = total_users - high_risk

    return {
        "total_users": total_users,
        "high_risk_users": high_risk,
        "low_risk_users": low_risk,
        "system_status": "Running"
    }


class EmployeeCreate(BaseModel):
    employee_id: str
    total_logons: int = 0
    after_hours_logons: int = 0
    unique_pcs_used: int = 0
    total_device_connects: int = 0
    risk_flag: bool = False

@router.post("/employees")
def add_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    db.execute(
        text("""
            INSERT INTO user_behavior_features
            (employee_id, total_logons, after_hours_logons, unique_pcs_used, total_device_connects, risk_flag)
            VALUES (:employee_id, :total_logons, :after_hours_logons, :unique_pcs_used, :total_device_connects, :risk_flag)
        """),
        employee.dict()
    )
    db.commit()
    return {
        "message": "Employee added successfully",
        "employee_id": employee.employee_id
    }