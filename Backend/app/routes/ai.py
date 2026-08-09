from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db

from app.models import (
    Employee,
    BehaviorBaseline
)

from app.schemas import (
    AIPredictRequest,
    AIPredictResponse
)

from app.ml.predict import predict_behavior

from app.utils.report_generator import (
    generate_report
)

from app.services.investigation_service import (
    generate_investigation
)

from app.services.alert_management_service import (
    generate_alert
)

from app.services.email_service import (
    send_threat_alert_email
)
from app.services.notification_service import (
    create_notification
)

router = APIRouter(
    prefix="/ai",
    tags=["AI Prediction"]
)


# =====================================================
# AI Prediction
# =====================================================

@router.post(
    "/predict",
    response_model=AIPredictResponse
)
def predict(
    data: AIPredictRequest,
    db: Session = Depends(get_db)
):

    # ---------------------------------
    # AI Prediction
    # ---------------------------------

    prediction = predict_behavior(
        data.model_dump()
    )

    # ---------------------------------
    # Automatic Alert & Investigation
    # ---------------------------------

    if prediction["risk_level"] in [
        "High",
        "Critical"
    ]:

        # ---------------------------------
        # Get Employee
        # ---------------------------------

        employee = (
            db.query(Employee)
            .filter(
                Employee.id == data.employee_id
            )
            .first()
        )

        if employee:

            # ---------------------------------
            # Generate Alert
            # ---------------------------------

            alert_result = generate_alert(
                db=db,
                employee_id=data.employee_id,
                prediction=prediction
            )

            alert = alert_result["alert"]
            alert_created = alert_result["created"]

            # ---------------------------------
            # Generate Investigation
            # ---------------------------------

            investigation = generate_investigation(
                db=db,
                employee_id=data.employee_id,
                prediction=prediction
            )

            # ---------------------------------
            # Send Email Only for New Alert
            # ---------------------------------

    if alert_created:

        # ---------------------------------
        # Create In-App Notification
        # ---------------------------------

        create_notification(
            db=db,
            employee_id=employee.id,
            notification_type="Threat Alert",
            title=(
                f"{prediction['risk_level']} "
                "Risk Threat Detected"
            ),
            message=(
                f"{employee.full_name} "
                f"({employee.employee_id}) "
                f"has been classified as "
                f"{prediction['risk_level']} Risk "
                f"with a risk score of "
                f"{prediction['risk_score']}."
            ),
            severity=prediction["risk_level"]
        )

        # ---------------------------------
        # Send Gmail Security Alert
        # ---------------------------------

        send_threat_alert_email(
            employee=employee,
            prediction=prediction,
            alert_id=(
                alert.id
                if alert
                else None
            ),
            investigation_id=(
                investigation.id
                if investigation
                else None
            )
        )

    else:

        print(
            "🔔 Notification skipped - "
            "active alert already exists."
        )

        print(
            "📧 Email skipped - "
            "active alert already exists."
        )
            

    return prediction


# =====================================================
# Download AI Report
# =====================================================

@router.get(
    "/report/{employee_id}"
)
def download_report(
    employee_id: int,
    db: Session = Depends(get_db)
):

    # ---------------------------------
    # Employee
    # ---------------------------------

    employee = (
        db.query(Employee)
        .filter(
            Employee.id == employee_id
        )
        .first()
    )

    if not employee:

        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    # ---------------------------------
    # Baseline
    # ---------------------------------

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

    # ---------------------------------
    # AI Prediction
    # ---------------------------------

    prediction = predict_behavior({

        "employee_id": employee.id,

        "avg_failed_logins":
            baseline.avg_failed_logins,

        "avg_files_downloaded":
            baseline.avg_files_downloaded,

        "avg_emails_sent":
            baseline.avg_emails_sent,

        "avg_login_hour":
            baseline.avg_login_hour,

        "usb_usage_rate":
            baseline.usb_usage_rate,

        "after_hours_rate":
            baseline.after_hours_rate

    })

    # ---------------------------------
    # Generate PDF
    # ---------------------------------

    pdf_path = generate_report(
        employee,
        baseline,
        prediction
    )

    return FileResponse(
        path=pdf_path,
        filename=(
            f"{employee.employee_id}"
            f"_Anomaly_Report.pdf"
        ),
        media_type="application/pdf"
    )