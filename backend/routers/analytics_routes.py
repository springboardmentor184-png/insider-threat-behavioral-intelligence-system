from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional

from database import get_db
from models import BehavioralBaseline, Anomaly, ThreatDetection, User, UserRole
from auth import require_role

router = APIRouter(prefix="/analytics", tags=["Analytics"])


# ---------- Baselines ----------

@router.get("/baselines")
def get_all_baselines(
    db: Session = Depends(get_db),
    current_user=Depends(require_role(
        UserRole.SECURITY_ANALYST, UserRole.SOC_ENGINEER,
        UserRole.SECURITY_MANAGER, UserRole.ADMINISTRATOR
    )),
):
    return db.query(BehavioralBaseline).all()


@router.get("/baselines/{employee_id}")
def get_employee_baseline(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(
        UserRole.SECURITY_ANALYST, UserRole.SOC_ENGINEER,
        UserRole.SECURITY_MANAGER, UserRole.ADMINISTRATOR
    )),
):
    return db.query(BehavioralBaseline).filter(BehavioralBaseline.employee_id == employee_id).first()


# ---------- Anomalies ----------

@router.get("/anomalies")
def get_anomalies(
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    employee_id: Optional[str] = Query(None),
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
    current_user=Depends(require_role(
        UserRole.SECURITY_ANALYST, UserRole.SOC_ENGINEER,
        UserRole.SECURITY_MANAGER, UserRole.ADMINISTRATOR
    )),
):
    query = db.query(Anomaly)
    if severity:
        query = query.filter(Anomaly.severity == severity)
    if status:
        query = query.filter(Anomaly.status == status)
    if employee_id:
        query = query.filter(Anomaly.employee_id == employee_id)
    return query.order_by(Anomaly.detected_at.desc()).limit(limit).all()


@router.get("/anomalies/summary")
def get_anomaly_summary(
    db: Session = Depends(get_db),
    current_user=Depends(require_role(
        UserRole.SECURITY_ANALYST, UserRole.SOC_ENGINEER,
        UserRole.SECURITY_MANAGER, UserRole.ADMINISTRATOR
    )),
):
    results = (
        db.query(Anomaly.severity, func.count(Anomaly.id))
        .filter(Anomaly.status == "open")
        .group_by(Anomaly.severity)
        .all()
    )
    summary = {severity: count for severity, count in results}
    for level in ["low", "medium", "high", "critical"]:
        summary.setdefault(level, 0)
    return {"by_severity": summary, "total_open": sum(summary.values())}


@router.get("/anomalies/trend")
def get_anomaly_trend(
    days: int = Query(14, le=90),
    db: Session = Depends(get_db),
    current_user=Depends(require_role(
        UserRole.SECURITY_ANALYST, UserRole.SOC_ENGINEER,
        UserRole.SECURITY_MANAGER, UserRole.ADMINISTRATOR
    )),
):
    """
    Returns anomaly counts grouped by date - powers the Manager dashboard trend chart.
    """
    cutoff = datetime.utcnow() - timedelta(days=days)
    results = (
        db.query(func.date(Anomaly.event_timestamp), func.count(Anomaly.id))
        .filter(Anomaly.event_timestamp >= cutoff)
        .group_by(func.date(Anomaly.event_timestamp))
        .order_by(func.date(Anomaly.event_timestamp))
        .all()
    )
    return [{"date": str(d), "count": c} for d, c in results]


@router.get("/anomalies/top-employees")
def get_top_risky_employees(
    limit: int = Query(10, le=50),
    db: Session = Depends(get_db),
    current_user=Depends(require_role(
        UserRole.SECURITY_ANALYST, UserRole.SOC_ENGINEER,
        UserRole.SECURITY_MANAGER, UserRole.ADMINISTRATOR
    )),
):
    """
    Returns employees ranked by open-anomaly count - powers the Manager dashboard ranking widget.
    """
    results = (
        db.query(Anomaly.employee_id, func.count(Anomaly.id).label("cnt"))
        .filter(Anomaly.status == "open")
        .group_by(Anomaly.employee_id)
        .order_by(func.count(Anomaly.id).desc())
        .limit(limit)
        .all()
    )
    return [{"employee_id": e, "anomaly_count": c} for e, c in results]


@router.patch("/anomalies/{anomaly_id}/status")
def update_anomaly_status(
    anomaly_id: int,
    new_status: str = Query(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_role(
        UserRole.SECURITY_ANALYST, UserRole.SOC_ENGINEER, UserRole.ADMINISTRATOR
    )),
):
    anomaly = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    if not anomaly:
        return {"error": "Anomaly not found"}
    anomaly.status = new_status
    db.commit()
    db.refresh(anomaly)
    return anomaly


# ---------- Threat Detections ----------

@router.post("/threats/from-anomaly/{anomaly_id}")
def escalate_anomaly_to_threat(
    anomaly_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(
        UserRole.SECURITY_ANALYST, UserRole.SOC_ENGINEER, UserRole.ADMINISTRATOR
    )),
):
    anomaly = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    if not anomaly:
        return {"error": "Anomaly not found"}

    threat = ThreatDetection(
        employee_id=anomaly.employee_id,
        anomaly_id=anomaly.id,
        title=f"{anomaly.anomaly_type.replace('_', ' ').title()} - {anomaly.employee_id}",
        description=anomaly.description,
        risk_level=anomaly.severity,
        status="open",
    )
    db.add(threat)
    db.commit()
    db.refresh(threat)
    return threat


@router.get("/threats")
def get_threats(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(require_role(
        UserRole.SECURITY_ANALYST, UserRole.SOC_ENGINEER,
        UserRole.SECURITY_MANAGER, UserRole.ADMINISTRATOR
    )),
):
    query = db.query(ThreatDetection)
    if status:
        query = query.filter(ThreatDetection.status == status)
    return query.order_by(ThreatDetection.created_at.desc()).all()


# ---------- Admin: User Management ----------

@router.get("/admin/users")
def list_all_users(
    db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRole.ADMINISTRATOR)),
):
    """
    Returns all registered console users - powers the Admin dashboard user table.
    """
    users = db.query(User).all()
    return [
        {"id": u.id, "name": u.name, "email": u.email, "role": u.role, "created_at": u.created_at}
        for u in users
    ]