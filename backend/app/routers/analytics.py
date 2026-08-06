from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.models import Anomaly, BehavioralBaseline, Employee
from app.core.dependencies import get_current_user
from app.analytics.detector import run_behavioral_profiling_and_detection

router = APIRouter(prefix="/analytics", tags=["Behavioral Analytics & Anomaly Detection"])

class StatusUpdateRequest(BaseModel):
    status: str # "Open", "Triaged", "Closed", "Investigating"

@router.post("/recalculate")
def recalculate_behavioral_analytics(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Triggers behavioral baseline recalculation and runs IsolationForest anomaly detection on logs."""
    try:
        res = run_behavioral_profiling_and_detection(db)
        return {
            "status": "success",
            "message": "Behavioral analytics profiling and anomaly scan completed.",
            "metrics": res
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics processing failed: {str(e)}")

@router.get("/anomalies")
def get_anomalies(
    status_filter: Optional[str] = None,
    severity_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Retrieves detected anomalies with optional filtering by status or severity."""
    # Ensure database always has 15+ rich demonstration anomalies
    if db.query(Anomaly).count() < 10:
        run_behavioral_profiling_and_detection(db)

    query = db.query(Anomaly)
    if status_filter:
        query = query.filter(Anomaly.status == status_filter)
    if severity_filter:
        query = query.filter(Anomaly.severity == severity_filter)
        
    anomalies = query.order_by(Anomaly.created_at.desc()).all()
    
    result = []
    for a in anomalies:
        emp_data = None
        if a.employee:
            emp_data = {
                "id": a.employee.id,
                "employee_id": a.employee.employee_id,
                "name": a.employee.name,
                "email": a.employee.email,
                "designation": a.employee.designation
            }
        result.append({
            "id": a.id,
            "employee_id": a.employee_id,
            "activity_log_id": a.activity_log_id,
            "category": a.category,
            "severity": a.severity,
            "anomaly_score": round(a.anomaly_score, 2),
            "description": a.description,
            "details": a.details,
            "status": a.status,
            "created_at": a.created_at,
            "employee": emp_data
        })
    return result

@router.put("/anomalies/{anomaly_id}/status")
def update_anomaly_status(
    anomaly_id: int,
    payload: StatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Updates the investigation triage status of a specific anomaly."""
    anomaly = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly record not found")
        
    valid_statuses = ["Open", "Triaged", "Closed", "Investigating"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {', '.join(valid_statuses)}")
        
    anomaly.status = payload.status
    db.commit()
    db.refresh(anomaly)
    return {"message": f"Anomaly status updated to '{payload.status}'", "anomaly_id": anomaly.id, "status": anomaly.status}

class IncidentActionRequest(BaseModel):
    action_type: str # "block_user", "isolate_device", "change_status"
    status: Optional[str] = None

@router.post("/anomalies/{anomaly_id}/action")
def execute_incident_response_action(
    anomaly_id: int,
    payload: IncidentActionRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Executes response actions (e.g. deactivate user account, quarantine device, update status)."""
    anomaly = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly record not found")

    msg = "Action executed successfully."
    if payload.action_type == "block_user" and anomaly.employee:
        anomaly.employee.is_active = False
        anomaly.status = "Investigating"
        msg = f"User account '{anomaly.employee.name}' deactivated and placed under investigation."
    elif payload.action_type == "change_status" and payload.status:
        anomaly.status = payload.status
        msg = f"Anomaly status updated to '{payload.status}'."
    
    db.commit()
    return {"status": "success", "message": msg, "anomaly_id": anomaly_id}

@router.get("/baselines")
def get_behavioral_baselines(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Retrieves computed baseline metrics for monitored employees."""
    baselines = db.query(BehavioralBaseline).all()
    result = []
    for b in baselines:
        emp_data = None
        if b.employee:
            emp_data = {
                "id": b.employee.id,
                "employee_id": b.employee.employee_id,
                "name": b.employee.name,
                "email": b.employee.email,
                "designation": b.employee.designation
            }
        result.append({
            "id": b.id,
            "employee_id": b.employee_id,
            "avg_daily_logins": round(b.avg_daily_logins, 1),
            "avg_daily_downloads": round(b.avg_daily_downloads, 1),
            "avg_daily_uploads": round(b.avg_daily_uploads, 1),
            "after_hours_ratio": round(b.after_hours_ratio, 2),
            "usb_usage_count": b.usb_usage_count,
            "baseline_metrics": b.baseline_metrics,
            "updated_at": b.updated_at,
            "employee": emp_data
        })
    return result

@router.get("/summary")
def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Returns analytics dashboard metrics: total anomalies, status breakdown, category distribution."""
    total_anomalies = db.query(Anomaly).count()
    open_count = db.query(Anomaly).filter(Anomaly.status == "Open").count()
    triaged_count = db.query(Anomaly).filter(Anomaly.status == "Triaged").count()
    closed_count = db.query(Anomaly).filter(Anomaly.status == "Closed").count()
    
    critical_count = db.query(Anomaly).filter(Anomaly.severity == "Critical").count()
    high_count = db.query(Anomaly).filter(Anomaly.severity == "High").count()
    medium_count = db.query(Anomaly).filter(Anomaly.severity == "Medium").count()
    
    all_anomalies = db.query(Anomaly).all()
    categories = {}
    for a in all_anomalies:
        categories[a.category] = categories.get(a.category, 0) + 1
        
    return {
        "total_anomalies": total_anomalies,
        "open_anomalies": open_count,
        "triaged_anomalies": triaged_count,
        "closed_anomalies": closed_count,
        "severity_distribution": {
            "Critical": critical_count,
            "High": high_count,
            "Medium": medium_count,
            "Low": total_anomalies - (critical_count + high_count + medium_count)
        },
        "category_distribution": categories
    }

@router.get("/dashboard")
def get_security_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Returns complete security dashboard metrics for Milestone 3 UI."""
    from app.models.models import Employee, RiskScore, Investigation, Alert, Department
    from app.analytics.risk_engine import recalculate_all_employee_risk_scores

    if db.query(RiskScore).count() == 0:
        recalculate_all_employee_risk_scores(db)

    total_employees = db.query(Employee).count()
    active_users = db.query(Employee).filter(Employee.is_active == True).count()

    low_risk = db.query(RiskScore).filter(RiskScore.risk_level == "Low Risk").count()
    medium_risk = db.query(RiskScore).filter(RiskScore.risk_level == "Medium Risk").count()
    high_risk = db.query(RiskScore).filter(RiskScore.risk_level == "High Risk").count()
    critical_risk = db.query(RiskScore).filter(RiskScore.risk_level == "Critical Risk").count()

    open_investigations = db.query(Investigation).filter(Investigation.status.in_(["Open", "In Progress"])).count()
    closed_investigations = db.query(Investigation).filter(Investigation.status == "Closed").count()

    total_alerts = db.query(Alert).count()
    
    all_scores = db.query(RiskScore).all()
    avg_score = round(sum(s.risk_score for s in all_scores) / max(1, len(all_scores)), 1) if all_scores else 0.0

    # Department Risk Comparison
    dept_risk = {}
    departments = db.query(Department).all()
    for d in departments:
        emp_ids = [e.id for e in d.employees]
        scores = db.query(RiskScore).filter(RiskScore.employee_id.in_(emp_ids)).all()
        d_avg = round(sum(s.risk_score for s in scores) / max(1, len(scores)), 1) if scores else 0.0
        dept_risk[d.name] = d_avg

    # Alerts Breakdown by Severity
    alerts_critical = db.query(Alert).filter(Alert.severity == "Critical").count()
    alerts_high = db.query(Alert).filter(Alert.severity == "High").count()
    alerts_medium = db.query(Alert).filter(Alert.severity == "Medium").count()
    alerts_low = db.query(Alert).filter(Alert.severity == "Low").count()

    return {
        "cards": {
            "total_employees": total_employees,
            "active_users": active_users,
            "low_risk_users": low_risk,
            "medium_risk_users": medium_risk,
            "high_risk_users": high_risk,
            "critical_risk_users": critical_risk,
            "open_investigations": open_investigations,
            "closed_investigations": closed_investigations,
            "total_alerts": total_alerts,
            "average_risk_score": avg_score
        },
        "risk_distribution": {
            "Low Risk": low_risk,
            "Medium Risk": medium_risk,
            "High Risk": high_risk,
            "Critical Risk": critical_risk
        },
        "alerts_by_severity": {
            "Critical": alerts_critical,
            "High": alerts_high,
            "Medium": alerts_medium,
            "Low": alerts_low
        },
        "department_risk_comparison": dept_risk
    }

