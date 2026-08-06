from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Employee, Department, BehavioralBaseline, ActivityLog, Anomaly, RiskScore

def get_department_peer_group_comparison(emp_id: int, db: Session):
    """
    Compares an employee's behavioral metrics against their department peer group averages.
    """
    emp = db.query(Employee).filter(Employee.id == emp_id).first()
    if not emp:
        return None

    emp_baseline = db.query(BehavioralBaseline).filter(BehavioralBaseline.employee_id == emp_id).first()
    emp_risk = db.query(RiskScore).filter(RiskScore.employee_id == emp_id).first()

    # Get department peers
    dept_peers = db.query(Employee).filter(Employee.department_id == emp.department_id).all()
    peer_ids = [p.id for p in dept_peers]

    # Department averages
    dept_baselines = db.query(BehavioralBaseline).filter(BehavioralBaseline.employee_id.in_(peer_ids)).all()
    
    if dept_baselines:
        avg_logins = sum(b.avg_daily_logins for b in dept_baselines) / len(dept_baselines)
        avg_downloads = sum(b.avg_daily_downloads for b in dept_baselines) / len(dept_baselines)
        avg_uploads = sum(b.avg_daily_uploads for b in dept_baselines) / len(dept_baselines)
        avg_off_hours = sum(b.after_hours_ratio for b in dept_baselines) / len(dept_baselines)
    else:
        avg_logins = 8.0
        avg_downloads = 10.0
        avg_uploads = 3.0
        avg_off_hours = 0.10

    dept_name = emp.department.name if emp.department else "General"

    emp_metrics = {
        "daily_logins": emp_baseline.avg_daily_logins if emp_baseline else 10.0,
        "daily_downloads_mb": emp_baseline.avg_daily_downloads if emp_baseline else 12.0,
        "daily_uploads_mb": emp_baseline.avg_daily_uploads if emp_baseline else 4.0,
        "after_hours_ratio": emp_baseline.after_hours_ratio if emp_baseline else 0.15,
        "usb_mounts": emp_baseline.usb_usage_count if emp_baseline else 0
    }

    dept_averages = {
        "daily_logins": round(avg_logins, 1),
        "daily_downloads_mb": round(avg_downloads, 1),
        "daily_uploads_mb": round(avg_uploads, 1),
        "after_hours_ratio": round(avg_off_hours, 2),
        "usb_mounts": 0.2
    }

    # Variance Calculation
    download_variance = round(((emp_metrics["daily_downloads_mb"] - avg_downloads) / max(1.0, avg_downloads)) * 100.0, 1)
    upload_variance = round(((emp_metrics["daily_uploads_mb"] - avg_uploads) / max(1.0, avg_uploads)) * 100.0, 1)

    return {
        "employee_id": emp_id,
        "employee_name": emp.name,
        "department_name": dept_name,
        "peer_count": len(peer_ids),
        "employee_metrics": emp_metrics,
        "department_averages": dept_averages,
        "variance": {
            "download_variance_percent": download_variance,
            "upload_variance_percent": upload_variance
        },
        "risk_summary": {
            "score": emp_risk.risk_score if emp_risk else 15.0,
            "level": emp_risk.risk_level if emp_risk else "Low Risk",
            "prediction": emp_risk.threat_prediction if emp_risk else {}
        }
    }
