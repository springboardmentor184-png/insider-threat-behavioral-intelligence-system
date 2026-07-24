from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.models.models import (
    Employee,
    LoginActivity,
    FileAccess
)

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


@router.get("/summary")
def report_summary(
    db: Session = Depends(get_db)
):
    total_employees = (
        db.query(Employee)
        .count()
    )

    total_logins = (
        db.query(LoginActivity)
        .count()
    )

    total_file_access = (
        db.query(FileAccess)
        .count()
    )

    average_risk = (
        db.query(
            func.avg(
                Employee.risk_score
            )
        )
        .scalar()
    )

    highest_risk = (
        db.query(
            func.max(
                Employee.risk_score
            )
        )
        .scalar()
    )

    critical = (
        db.query(Employee)
        .filter(
            Employee.risk_level
            == "Critical"
        )
        .count()
    )

    high = (
        db.query(Employee)
        .filter(
            Employee.risk_level
            == "High"
        )
        .count()
    )

    medium = (
        db.query(Employee)
        .filter(
            Employee.risk_level
            == "Medium"
        )
        .count()
    )

    low = (
        db.query(Employee)
        .filter(
            Employee.risk_level
            == "Low"
        )
        .count()
    )

    return {
        "generated": True,
        "summary": {
            "totalEmployees": total_employees,
            "totalLogins": total_logins,
            "totalFileAccess": total_file_access,
            "averageRiskScore": round(
                float(
                    average_risk
                    or 0
                ),
                2
            ),
            "highestRiskScore": round(
                float(
                    highest_risk
                    or 0
                ),
                2
            )
        },
        "riskDistribution": {
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low
        }
    }


@router.get("/risk")
def risk_report(
    db: Session = Depends(get_db)
):
    employees = (
        db.query(Employee)
        .order_by(
            Employee.risk_score.desc()
        )
        .all()
    )

    return [
        {
            "user": employee.user,
            "name": (
                employee.name
                or employee.user
            ),
            "riskScore": (
                employee.risk_score
                or 0
            ),
            "riskLevel": (
                employee.risk_level
                or "Low"
            ),
            "anomalyScore": (
                employee.anomaly_score
                or 0
            )
        }
        for employee in employees
    ]