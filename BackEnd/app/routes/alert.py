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
                ["High", "Critical"]
            )
        )
        .order_by(
            Employee.risk_score.desc()
        )
        .all()
    )

    alerts = []

    for employee in employees:

        if employee.risk_level == "Critical":
            severity = "Critical"
        else:
            severity = "High"

        alerts.append(
            {
                "id": employee.id,
                "employee_id": employee.id,
                "user": employee.user,
                "title": "High Insider Threat Risk",
                "description": (
                    f"Employee {employee.user} "
                    f"has a risk score of "
                    f"{employee.risk_score}"
                ),
                "severity": severity,
                "risk_score": employee.risk_score,
                "risk_level": employee.risk_level,
                "anomaly_score": employee.anomaly_score,
                "status": "Open"
            }
        )

    return alerts