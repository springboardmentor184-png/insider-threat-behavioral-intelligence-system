from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import (
    Employee,
    LoginActivity,
    FileAccess
)

router = APIRouter(
    prefix="/investigations",
    tags=["Investigations"]
)


@router.get("/")
def get_investigations(
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

    investigations = []

    for employee in employees:

        login_count = (
            db.query(LoginActivity)
            .filter(
                LoginActivity.employee_id
                == employee.id
            )
            .count()
        )

        file_count = (
            db.query(FileAccess)
            .filter(
                FileAccess.employee_id
                == employee.id
            )
            .count()
        )

        if employee.risk_level == "Critical":
            status = "Critical"
        else:
            status = "Open"

        investigations.append(
            {
                "id": employee.id,
                "employee_id": employee.id,
                "user": employee.user,
                "name": (
                    employee.name
                    or employee.user
                ),
                "risk_score": (
                    employee.risk_score
                    or 0
                ),
                "risk_level": (
                    employee.risk_level
                    or "Low"
                ),
                "anomaly_score": (
                    employee.anomaly_score
                    or 0
                ),
                "login_activities": login_count,
                "file_access_events": file_count,
                "status": status,
                "priority": (
                    employee.risk_level
                ),
                "description": (
                    f"Behavioral investigation "
                    f"required for {employee.user}"
                )
            }
        )

    return investigations


@router.get("/{employee_id}")
def get_investigation(
    employee_id: int,
    db: Session = Depends(get_db)
):
    employee = (
        db.query(Employee)
        .filter(
            Employee.id == employee_id
        )
        .first()
    )

    if not employee:
        return {
            "error": "Employee not found"
        }

    login_activities = (
        db.query(LoginActivity)
        .filter(
            LoginActivity.employee_id
            == employee.id
        )
        .order_by(
            LoginActivity.login_time.desc()
        )
        .limit(100)
        .all()
    )

    file_access = (
        db.query(FileAccess)
        .filter(
            FileAccess.employee_id
            == employee.id
        )
        .order_by(
            FileAccess.access_time.desc()
        )
        .limit(100)
        .all()
    )

    return {
        "employee": {
            "id": employee.id,
            "user": employee.user,
            "name": (
                employee.name
                or employee.user
            ),
            "risk_score": (
                employee.risk_score
                or 0
            ),
            "risk_level": (
                employee.risk_level
                or "Low"
            ),
            "anomaly_score": (
                employee.anomaly_score
                or 0
            )
        },
        "login_activities": [
            {
                "id": activity.id,
                "activity": activity.activity,
                "pc": activity.pc,
                "timestamp": activity.login_time,
                "is_anomaly": activity.is_anomaly,
                "anomaly_score": activity.anomaly_score
            }
            for activity in login_activities
        ],
        "file_access": [
            {
                "id": access.id,
                "filename": access.filename,
                "pc": access.pc,
                "action": access.action,
                "timestamp": access.access_time,
                "is_anomaly": access.is_anomaly,
                "anomaly_score": access.anomaly_score
            }
            for access in file_access
        ]
    }