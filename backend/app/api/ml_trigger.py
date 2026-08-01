from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.roles import require_roles
from app.models.user import User
from app.services.telemetry_service import seed_telemetry_data
from app.services.anomaly_service import detect_anomalies
from app.services.risk_service import recalculate_risk_scores

router = APIRouter(
    prefix="/ml",
    tags=["Machine Learning & Seeding"]
)

@router.post("/seed-telemetry")
def trigger_seed_telemetry(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(["Administrator", "Security Manager", "SOC Engineer", "Security Analyst"])
    )
):
    try:
        result = seed_telemetry_data(db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to seed data: {str(e)}")

@router.post("/detect-anomalies")
def trigger_anomaly_detection(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(["Administrator", "Security Manager", "SOC Engineer", "Security Analyst"])
    )
):
    try:
        result = detect_anomalies(db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to run anomaly detection: {str(e)}")

@router.post("/recalculate-risk")
def trigger_risk_recalculation(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(["Administrator", "Security Manager", "SOC Engineer", "Security Analyst"])
    )
):
    try:
        result = recalculate_risk_scores(db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to recalculate risk scores: {str(e)}")
