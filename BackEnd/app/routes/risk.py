from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.models.models import Employee

router = APIRouter(
    prefix="/risk",
    tags=["Risk Analysis"]
)


@router.get("/summary")
def risk_summary(
    db: Session = Depends(get_db)
):
    critical = (
        db.query(Employee)
        .filter(Employee.risk_level == "Critical")
        .count()
    )

    high = (
        db.query(Employee)
        .filter(Employee.risk_level == "High")
        .count()
    )

    medium = (
        db.query(Employee)
        .filter(Employee.risk_level == "Medium")
        .count()
    )

    low = (
        db.query(Employee)
        .filter(Employee.risk_level == "Low")
        .count()
    )

    average_score = (
        db.query(
            func.avg(Employee.risk_score)
        )
        .scalar()
    )

    highest_score = (
        db.query(
            func.max(Employee.risk_score)
        )
        .scalar()
    )

    return {
        "riskDistribution": {
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low
        },
        "averageRiskScore": round(
            float(average_score or 0),
            2
        ),
        "highestRiskScore": round(
            float(highest_score or 0),
            2
        ),
        "totalEmployees": (
            critical
            + high
            + medium
            + low
        )
    }


@router.get("/top")
def top_risk_employees(
    db: Session = Depends(get_db)
):
    employees = (
        db.query(Employee)
        .order_by(
            Employee.risk_score.desc()
        )
        .limit(20)
        .all()
    )

    return [
        {
            "id": employee.id,
            "user": employee.user,
            "name": employee.name or employee.user,
            "riskScore": employee.risk_score or 0,
            "riskLevel": employee.risk_level or "Low",
            "anomalyScore": employee.anomaly_score or 0
        }
        for employee in employees
    ]