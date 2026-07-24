from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import Employee, LoginActivity, FileAccess

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/summary")
def dashboard_summary(db: Session = Depends(get_db)):
    total_employees = db.query(Employee).count()
    login_activities = db.query(LoginActivity).count()
    file_access_events = db.query(FileAccess).count()

    critical_risk = (
        db.query(Employee)
        .filter(Employee.risk_level == "Critical")
        .count()
    )

    high_risk = (
        db.query(Employee)
        .filter(Employee.risk_level == "High")
        .count()
    )

    medium_risk = (
        db.query(Employee)
        .filter(Employee.risk_level == "Medium")
        .count()
    )

    low_risk = (
        db.query(Employee)
        .filter(Employee.risk_level == "Low")
        .count()
    )

    total_anomalies = (
        db.query(Employee)
        .filter(Employee.anomaly == 1)
        .count()
    )

    top_risk_users = (
        db.query(Employee)
        .order_by(Employee.risk_score.desc())
        .limit(10)
        .all()
    )

    return {
        "stats": {
            "totalEmployees": total_employees,
            "loginActivities": login_activities,
            "fileAccessEvents": file_access_events,
            "deviceActivities": 0,
            "emailActivities": 0,
            "totalAnomalies": total_anomalies,
            "criticalRisk": critical_risk,
            "highRisk": high_risk,
            "mediumRisk": medium_risk,
            "lowRisk": low_risk
        },
        "riskDistribution": {
            "critical": critical_risk,
            "high": high_risk,
            "medium": medium_risk,
            "low": low_risk
        },
        "topRiskUsers": [
            {
                "id": employee.id,
                "user": employee.user,
                "riskScore": employee.risk_score,
                "riskLevel": employee.risk_level,
                "anomalyScore": employee.anomaly_score
            }
            for employee in top_risk_users
        ]
    }


@router.get("/top-risk")
def top_risk_users(db: Session = Depends(get_db)):
    employees = (
        db.query(Employee)
        .order_by(Employee.risk_score.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "id": employee.id,
            "user": employee.user,
            "riskScore": employee.risk_score,
            "riskLevel": employee.risk_level,
            "anomalyScore": employee.anomaly_score
        }
        for employee in employees
    ]