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
