from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import BehaviorLog, Employee, User
from typing import List
from app.schemas import AlertResponse, AlertListResponse
from app.security import get_current_user

router = APIRouter(
    prefix="/alerts",
    tags=["Threat Detection"]
)


def calculate_risk_score(behavior: BehaviorLog):
    score = 0

    if behavior.failed_logins >= 5:
        score += 20

    if behavior.usb_used:
        score += 25

    if behavior.after_hours_login:
        score += 20

    if behavior.files_downloaded >= 100:
        score += 25

    if behavior.emails_sent >= 50:
        score += 10

    return min(score, 100)


def risk_level(score: int):
    if score >= 70:
        return "High"

    if score >= 40:
        return "Medium"

    return "Low"
@router.get("", response_model=List[AlertListResponse])
def get_all_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employees = db.query(Employee).all()

    alerts = []

    for employee in employees:

        behavior = (
            db.query(BehaviorLog)
            .filter(BehaviorLog.employee_id == employee.id)
            .order_by(BehaviorLog.created_at.desc())
            .first()
        )

        if not behavior:
            continue

        score = calculate_risk_score(behavior)

        employee.risk_score = score

        alerts.append({
            "employee_id": employee.id,
            "full_name": employee.full_name,
            "risk_score": score,
            "risk_level": risk_level(score),
            "message": f"{employee.full_name} is classified as {risk_level(score)} Risk"
        })

    db.commit()

    return alerts

@router.get("/{employee_id}", response_model=AlertResponse)
def analyze_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
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

    behavior = (
        db.query(BehaviorLog)
        .filter(BehaviorLog.employee_id == employee_id)
        .order_by(BehaviorLog.created_at.desc())
        .first()
    )

    if not behavior:
        raise HTTPException(
            status_code=404,
            detail="No behavior logs found"
        )

    score = calculate_risk_score(behavior)

    employee.risk_score = score
    db.commit()

    level = risk_level(score)

    return {
        "employee_id": employee.id,
        "risk_score": score,
        "risk_level": level,
        "message": f"{employee.full_name} is classified as {level} Risk"
    }