from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import Employee


router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


@router.get("/")
def get_alerts(
    db: Session = Depends(get_db)
):
    employees = (
        db.query(Employee)
        .filter(
            Employee.risk_level.in_(
                [
                    "Critical",
                    "High",
                    "Medium"
                ]
            )
        )
        .order_by(
            Employee.risk_score.desc()
        )
        .all()
    )

    alerts = []

    for employee in employees:

        risk_level = str(
            employee.risk_level or ""
        ).strip().lower()

        if risk_level == "critical":
            severity = "Critical"
            title = (
                "Critical Insider Threat Risk"
            )

        elif risk_level == "high":
            severity = "High"
            title = (
                "High Insider Threat Risk"
            )

        elif risk_level == "medium":
            severity = "Medium"
            title = (
                "Medium Insider Threat Risk"
            )

        else:
            continue

        alerts.append(
            {
                "id": employee.id,

                "employee_id": (
                    employee.id
                ),

                "user": (
                    employee.user
                    or "Unknown"
                ),

                "title": title,

                "description": (
                    f"Employee "
                    f"{employee.user or 'Unknown'} "
                    f"has a "
                    f"{severity.lower()} "
                    f"risk score of "
                    f"{employee.risk_score or 0}"
                ),

                "alert_type": (
                    "Insider Threat"
                ),

                "severity": severity,

                "risk_score": (
                    employee.risk_score
                    or 0
                ),

                "risk_level": (
                    employee.risk_level
                    or severity
                ),

                "anomaly_score": (
                    employee.anomaly_score
                    or 0
                ),

                "status": "Open",

                "created_at": None,

                "resolved_at": None
            }
        )

    return alerts