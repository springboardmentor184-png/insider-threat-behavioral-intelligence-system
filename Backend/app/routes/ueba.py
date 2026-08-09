from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Employee, BehaviorBaseline
from app.ml.predict import predict_behavior
from app.services.ueba_service import generate_ueba_intelligence
from app.schemas import UEBAResponse

router = APIRouter(
    prefix="/ueba",
    tags=["UEBA Intelligence"]
)


@router.get(
    "/{employee_id}",
    response_model=UEBAResponse
)
def get_ueba_intelligence(
    employee_id: int,
    db: Session = Depends(get_db)
):
    """
    Generate UEBA Intelligence for a selected employee.
    """

    # ----------------------------------
    # Employee
    # ----------------------------------
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

    # ----------------------------------
    # Behaviour Baseline
    # ----------------------------------
    baseline = (
        db.query(BehaviorBaseline)
        .filter(
            BehaviorBaseline.employee_id == employee_id
        )
        .first()
    )

    if not baseline:
        raise HTTPException(
            status_code=404,
            detail="Behaviour baseline not found"
        )

    # ----------------------------------
    # AI Prediction
    # ----------------------------------
    prediction = predict_behavior({
        "avg_failed_logins": baseline.avg_failed_logins,
        "avg_files_downloaded": baseline.avg_files_downloaded,
        "avg_emails_sent": baseline.avg_emails_sent,
        "avg_login_hour": baseline.avg_login_hour,
        "usb_usage_rate": baseline.usb_usage_rate,
        "after_hours_rate": baseline.after_hours_rate,
    })

    # ----------------------------------
    # UEBA Intelligence
    # ----------------------------------
    return generate_ueba_intelligence(
        employee,
        prediction
    )