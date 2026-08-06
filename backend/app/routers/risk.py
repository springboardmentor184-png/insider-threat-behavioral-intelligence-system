from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.database import get_db
from app.models.models import RiskScore, RiskHistory, Employee
from app.core.dependencies import get_current_user
from app.analytics.risk_engine import recalculate_all_employee_risk_scores, calculate_employee_risk
from app.analytics.ueba_engine import get_department_peer_group_comparison
from app.analytics.detector import run_behavioral_profiling_and_detection
from app.analytics.alert_engine import generate_security_alerts_from_risk

router = APIRouter(prefix="/risk", tags=["Insider Risk Scoring Engine"])

@router.post("/recalculate")
def recalculate_risk_scores(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Triggers dynamic anomaly scanning, risk score recalculation, email notifications, and alert generation."""
    # 1. Run dynamic behavioral anomaly detection & generate fresh anomaly events
    anom_res = run_behavioral_profiling_and_detection(db)
    
    # 2. Recalculate 35-25-20-10-10 weighted risk scores & email Administrator for Critical Risk (>= 75%)
    res = recalculate_all_employee_risk_scores(db)
    if isinstance(res, tuple):
        count, email_notified_count = res
    else:
        count, email_notified_count = res, 0

    # 3. Fire new security alerts on threshold breaches
    alerts_created = generate_security_alerts_from_risk(db)

    return {
        "status": "success", 
        "message": f"Full risk scan executed: {anom_res.get('anomalies_created', 0)} new anomalies detected, risk scores updated for {count} employees, {email_notified_count} Critical Risk (≥ 75%) email alerts dispatched to Administrator, {alerts_created} security alerts generated."
    }

@router.get("/scores")
def get_risk_scores(
    risk_level: Optional[str] = None,
    department_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Retrieves current employee risk scores with filtering support."""
    # Ensure scores exist
    if db.query(RiskScore).count() == 0:
        recalculate_all_employee_risk_scores(db)

    query = db.query(RiskScore).join(Employee)

    if risk_level:
        query = query.filter(RiskScore.risk_level == risk_level)
    if department_id:
        query = query.filter(Employee.department_id == department_id)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (Employee.name.ilike(search_fmt)) | 
            (Employee.email.ilike(search_fmt)) | 
            (Employee.employee_id.ilike(search_fmt))
        )

    records = query.order_by(RiskScore.risk_score.desc()).all()

    result = []
    for r in records:
        emp = r.employee
        result.append({
            "id": r.id,
            "employee_id": r.employee_id,
            "employee_code": emp.employee_id if emp else "EMP-N/A",
            "name": emp.name if emp else "Unknown",
            "email": emp.email if emp else "N/A",
            "department": emp.department.name if emp and emp.department else "General",
            "designation": emp.designation if emp else "Staff",
            "risk_score": r.risk_score,
            "risk_level": r.risk_level,
            "components": {
                "behavioral_anomaly_score": r.behavioral_anomaly_score,
                "privilege_misuse_score": r.privilege_misuse_score,
                "data_access_score": r.data_access_score,
                "access_pattern_score": r.access_pattern_score,
                "historical_event_score": r.historical_event_score
            },
            "explanation": r.explanation,
            "threat_prediction": r.threat_prediction,
            "updated_at": r.updated_at
        })

    return result

@router.get("/history/{employee_id}")
def get_employee_risk_history(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Retrieves time-series historical risk scores for a specific employee."""
    records = db.query(RiskHistory).filter(RiskHistory.employee_id == employee_id).order_by(RiskHistory.recorded_at.asc()).all()
    peer_comparison = get_department_peer_group_comparison(employee_id, db)
    return {
        "employee_id": employee_id,
        "history": [
            {
                "id": r.id,
                "risk_score": r.risk_score,
                "risk_level": r.risk_level,
                "recorded_at": r.recorded_at
            } for r in records
        ],
        "peer_comparison": peer_comparison
    }
