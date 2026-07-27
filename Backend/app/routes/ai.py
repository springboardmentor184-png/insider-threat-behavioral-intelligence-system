from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Employee, BehaviorBaseline
from app.schemas import AIPredictRequest, AIPredictResponse
from app.ml.predict import predict_behavior
from app.utils.report_generator import generate_report

router = APIRouter(
    prefix="/ai",
    tags=["AI Prediction"]
)


# ==========================
# AI Prediction
# ==========================
@router.post("/predict", response_model=AIPredictResponse)
def predict(data: AIPredictRequest):
    return predict_behavior(data.model_dump())


# ==========================
# Download AI Report
# ==========================
@router.get("/report/{employee_id}")
def download_report(
    employee_id: int,
    db: Session = Depends(get_db)
):

    # -------------------------
    # Employee
    # -------------------------
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

    # -------------------------
    # Baseline
    # -------------------------
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
            detail="Baseline not found"
        )

    # -------------------------
    # AI Prediction
    # -------------------------
    prediction = predict_behavior({
        "avg_failed_logins": baseline.avg_failed_logins,
        "avg_files_downloaded": baseline.avg_files_downloaded,
        "avg_emails_sent": baseline.avg_emails_sent,
        "avg_login_hour": baseline.avg_login_hour,
        "usb_usage_rate": baseline.usb_usage_rate,
        "after_hours_rate": baseline.after_hours_rate,
    })

    # -------------------------
    # Generate PDF
    # -------------------------
    pdf_path = generate_report(
        employee,
        baseline,
        prediction
    )

    return FileResponse(
        path=pdf_path,
        filename=f"{employee.employee_id}_Anomaly_Report.pdf",
        media_type="application/pdf"
    )