from io import BytesIO

from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional

from database import get_db
from models import ActivityLog, BehavioralBaseline, Anomaly, ThreatDetection, User, UserRole, RiskScore, Alert, Investigation, EmployeeProfile, NotificationRead
from auth import require_role
from risk_scoring import calculate_risk_score, latest_risk_scores, refresh_risk_categories, serialize_risk_score
from schemas import AlertStatusUpdate, UserRoleUpdate, InvestigationStatusUpdate
from employee_profile_seed import ensure_employee_profiles

router = APIRouter(prefix="/analytics", tags=["Analytics"])

READ_ROLES = (
    UserRole.SECURITY_ANALYST, UserRole.SOC_ENGINEER,
    UserRole.SECURITY_MANAGER, UserRole.ADMINISTRATOR,
)


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
    # CERT timestamps are historical. Anchor the selected window to the most
    # recent detected event rather than wall-clock time so charts stay useful.
    latest_event = db.query(func.max(Anomaly.event_timestamp)).scalar()
    if latest_event is None:
        return []
    cutoff = latest_event - timedelta(days=days - 1)
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


@router.patch("/admin/users/{user_id}/role")
def update_user_role(
    user_id: int,
    update: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRole.ADMINISTRATOR)),
):
    """Administrator-only role maintenance; the backend remains authoritative."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = update.role.value
    db.commit()
    db.refresh(user)
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role, "created_at": user.created_at}


@router.get("/admin/employees")
def list_employee_profiles(
    department: Optional[str] = Query(None),
    search: Optional[str] = Query(None, max_length=100),
    db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRole.ADMINISTRATOR)),
):
    """Administrator-only CERT employee directory using clearly synthetic demo HR data."""
    ensure_employee_profiles(db)
    query = db.query(EmployeeProfile).filter(EmployeeProfile.employee_id.isnot(None))
    if department:
        query = query.filter(EmployeeProfile.department == department)
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            EmployeeProfile.employee_id.ilike(term) |
            EmployeeProfile.department.ilike(term) |
            EmployeeProfile.designation.ilike(term) |
            EmployeeProfile.manager.ilike(term)
        )
    profiles = query.order_by(EmployeeProfile.employee_id).all()
    departments = [row[0] for row in db.query(EmployeeProfile.department).filter(EmployeeProfile.employee_id.isnot(None)).distinct().order_by(EmployeeProfile.department).all()]
    return {
        "employees": [{
            "employee_id": profile.employee_id,
            "department": profile.department,
            "designation": profile.designation,
            "manager": profile.manager,
            "device_information": profile.device_information,
            "access_privileges": profile.access_privileges,
            "data_source": "synthetic_demo",
        } for profile in profiles],
        "departments": departments,
    }


# ---------- Risk scores, activity summaries, and alert queue ----------

@router.post("/risk-scores/{employee_id}")
def compute_risk_score(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRole.SECURITY_ANALYST, UserRole.SOC_ENGINEER, UserRole.ADMINISTRATOR)),
):
    return serialize_risk_score(calculate_risk_score(db, employee_id))


@router.get("/risk-scores")
def list_risk_scores(
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db), current_user=Depends(require_role(*READ_ROLES)),
):
    records = refresh_risk_categories(db)
    return [serialize_risk_score(record) for record in sorted(records, key=lambda record: record.risk_score, reverse=True)[:limit]]


@router.get("/risk-scores/{employee_id}")
def get_risk_score(employee_id: str, db: Session = Depends(get_db), current_user=Depends(require_role(*READ_ROLES))):
    record = db.query(RiskScore).filter(RiskScore.employee_id == employee_id).order_by(RiskScore.computed_at.desc(), RiskScore.id.desc()).first()
    if record is None:
        record = calculate_risk_score(db, employee_id)
    else:
        refresh_risk_categories(db)
        db.refresh(record)
    return serialize_risk_score(record)


@router.get("/activity-summary")
def get_activity_summary(
    employee_id: Optional[str] = None, days: int = Query(14, ge=1, le=90),
    db: Session = Depends(get_db), current_user=Depends(require_role(*READ_ROLES)),
):
    base_query = db.query(ActivityLog)
    if employee_id:
        base_query = base_query.filter(ActivityLog.employee_id == employee_id)
    latest_event = base_query.with_entities(func.max(ActivityLog.timestamp)).scalar()
    if latest_event is None:
        return []
    cutoff = latest_event - timedelta(days=days - 1)
    query = base_query.filter(ActivityLog.timestamp >= cutoff)
    buckets = {}
    for row in query.all():
        key = str(row.timestamp.date())
        day = buckets.setdefault(key, {"date": key, "events": 0, "logons": 0, "device_connects": 0, "after_hours": 0})
        day["events"] += 1
        day["logons"] += int(row.event_type == "logon")
        day["device_connects"] += int(row.event_type == "device_connect")
        day["after_hours"] += int(row.timestamp.hour < 6 or row.timestamp.hour >= 20)
    return [buckets[key] for key in sorted(buckets)]


# ---------- Threat investigations ----------

def _investigation_payload(employee_id: str, db: Session):
    """Build a real-data investigation view without synthesizing history."""
    investigation = db.query(Investigation).filter(Investigation.employee_id == employee_id).first()
    ensure_employee_profiles(db)
    profile = db.query(EmployeeProfile).filter(EmployeeProfile.employee_id == employee_id).first()
    all_activities = db.query(ActivityLog).filter(ActivityLog.employee_id == employee_id).all()
    activities = sorted(all_activities, key=lambda row: row.timestamp, reverse=True)[:250]
    risk_history = (db.query(RiskScore).filter(RiskScore.employee_id == employee_id)
                    .order_by(RiskScore.computed_at.asc(), RiskScore.id.asc()).all())
    # Starting an investigation establishes the first honest risk snapshot for
    # a flagged employee when the scoring workflow has not already done so.
    if not risk_history:
        calculate_risk_score(db, employee_id)
        risk_history = (db.query(RiskScore).filter(RiskScore.employee_id == employee_id)
                        .order_by(RiskScore.computed_at.asc(), RiskScore.id.asc()).all())
    anomalies = db.query(Anomaly).filter(Anomaly.employee_id == employee_id).all()
    after_hours_logons = sum(row.event_type == "logon" and (row.timestamp.hour < 6 or row.timestamp.hour >= 20) for row in all_activities)
    device_events = sum(row.event_type in {"device_connect", "device_disconnect"} for row in all_activities)
    device_anomaly = any("device" in (row.anomaly_type or "").lower() for row in anomalies)
    indicators = []
    if after_hours_logons:
        indicators.append(f"{after_hours_logons} after-hours logon{'s' if after_hours_logons != 1 else ''}")
    if device_anomaly:
        indicators.append("unusual device-use anomaly")
    elif device_events:
        indicators.append(f"{device_events} removable-device event{'s' if device_events != 1 else ''}")
    correlated = after_hours_logons > 0 and (device_anomaly or device_events > 0)
    summary = ("Multiple behavioral indicators are present: " + " and ".join(indicators[:2]) + "."
               if correlated else ("Observed indicator: " + indicators[0] + "." if indicators else
                                  "No correlated anomaly indicators are present in the ingested activity."))
    return {
        "employee_id": employee_id,
        "profile": ({
            "employee_id": profile.employee_id,
            "department": profile.department,
            "designation": profile.designation,
            "manager": profile.manager,
            "device_information": profile.device_information,
            "access_privileges": profile.access_privileges,
            "data_source": "synthetic_demo",
        } if profile else None),
        "status": investigation.status if investigation else "Open",
        "timeline": [{"id": row.id, "timestamp": row.timestamp, "event_type": row.event_type, "pc": row.pc} for row in activities],
        "risk_history": [serialize_risk_score(row) for row in risk_history],
        "risk_history_note": "Historical risk tracking starts now; only the current persisted score is available." if len(risk_history) <= 1 else None,
        "correlation": {"correlated": correlated, "summary": summary, "indicators": indicators},
    }


@router.get("/investigations/{employee_id}")
def get_investigation(employee_id: str, db: Session = Depends(get_db), current_user=Depends(require_role(*READ_ROLES))):
    return _investigation_payload(employee_id, db)


@router.patch("/investigations/{employee_id}")
def update_investigation_status(
    employee_id: str, update: InvestigationStatusUpdate, db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRole.SECURITY_ANALYST, UserRole.SOC_ENGINEER, UserRole.ADMINISTRATOR)),
):
    if update.status not in {"Open", "In Progress", "Resolved"}:
        raise HTTPException(status_code=422, detail="Status must be Open, In Progress, or Resolved")
    investigation = db.query(Investigation).filter(Investigation.employee_id == employee_id).first()
    if investigation is None:
        investigation = Investigation(employee_id=employee_id, status=update.status)
        db.add(investigation)
    else:
        investigation.status = update.status
    db.commit()
    return _investigation_payload(employee_id, db)


@router.get("/alerts")
def list_alerts(
    status: Optional[str] = None, severity: Optional[str] = None, limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db), current_user=Depends(require_role(*READ_ROLES)),
):
    query = db.query(Alert)
    if status: query = query.filter(Alert.status == status)
    if severity: query = query.filter(Alert.severity == severity)
    return query.order_by(Alert.created_at.desc()).limit(limit).all()


@router.patch("/alerts/{alert_id}")
def update_alert(
    alert_id: int, update: AlertStatusUpdate, db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRole.SECURITY_ANALYST, UserRole.SOC_ENGINEER, UserRole.ADMINISTRATOR)),
):
    if update.status not in {"new", "acknowledged", "investigating", "resolved", "dismissed"}:
        return {"error": "Invalid alert status"}
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert: return {"error": "Alert not found"}
    alert.status = update.status
    db.commit(); db.refresh(alert)
    return alert


# ---------- In-app notifications ----------

def _notification_payload(db: Session, current_user: User):
    """Build notifications exclusively from persisted alerts and investigations."""
    notifications = []
    high_alerts = db.query(Alert).filter(Alert.severity.in_(["high", "critical"])).all()
    for alert in high_alerts:
        notifications.append({
            "key": f"alert:{alert.id}", "kind": "alert", "title": alert.title,
            "message": alert.description or f"{alert.severity.title()} security alert for {alert.employee_id}.",
            "severity": alert.severity, "employee_id": alert.employee_id, "created_at": alert.created_at,
            "href": "/alerts",
        })
    assigned = db.query(Alert).filter(Alert.assigned_to == current_user.id).all()
    for alert in assigned:
        notifications.append({
            "key": f"assignment:{alert.id}", "kind": "assignment", "title": "Investigation assigned",
            "message": f"{alert.title} has been assigned to you.", "severity": alert.severity,
            "employee_id": alert.employee_id, "created_at": alert.updated_at or alert.created_at,
            "href": f"/investigations/{alert.employee_id}",
        })
    # An investigation status is an actual system event, not a synthetic notification.
    for investigation in db.query(Investigation).order_by(Investigation.updated_at.desc()).all():
        notifications.append({
            "key": f"investigation:{investigation.id}", "kind": "investigation",
            "title": f"Investigation {investigation.status}",
            "message": f"{investigation.employee_id} investigation is {investigation.status.lower()}.",
            "severity": "medium", "employee_id": investigation.employee_id,
            "created_at": investigation.updated_at or investigation.created_at,
            "href": f"/investigations/{investigation.employee_id}",
        })
    notifications.sort(key=lambda item: item["created_at"] or datetime.min, reverse=True)
    notifications = notifications[:10]
    keys = [item["key"] for item in notifications]
    read_keys = {row.notification_key for row in db.query(NotificationRead).filter(
        NotificationRead.user_id == current_user.id, NotificationRead.notification_key.in_(keys)
    ).all()} if keys else set()
    for item in notifications:
        item["read"] = item["key"] in read_keys
    return notifications


@router.get("/notifications")
def list_notifications(db: Session = Depends(get_db), current_user: User = Depends(require_role(*READ_ROLES))):
    notifications = _notification_payload(db, current_user)
    return {"notifications": notifications, "unread_count": sum(not item["read"] for item in notifications)}


@router.patch("/notifications/{notification_key:path}/read")
def mark_notification_read(notification_key: str, db: Session = Depends(get_db), current_user: User = Depends(require_role(*READ_ROLES))):
    # Only mark keys currently derived from data the user can see.
    if notification_key not in {item["key"] for item in _notification_payload(db, current_user)}:
        raise HTTPException(status_code=404, detail="Notification not found")
    existing = db.query(NotificationRead).filter(
        NotificationRead.user_id == current_user.id, NotificationRead.notification_key == notification_key
    ).first()
    if not existing:
        db.add(NotificationRead(user_id=current_user.id, notification_key=notification_key))
        db.commit()
    return {"key": notification_key, "read": True}


@router.get("/reports/overview")
def get_report_overview(db: Session = Depends(get_db), current_user=Depends(require_role(*READ_ROLES))):
    scores = refresh_risk_categories(db)
    top_flagged_users = sorted(scores, key=lambda record: record.risk_score, reverse=True)[:8]
    return {
        "open_anomalies": db.query(Anomaly).filter(Anomaly.status == "open").count(),
        "active_alerts": db.query(Alert).filter(Alert.status.in_(["new", "acknowledged", "investigating"])).count(),
        "active_threats": db.query(ThreatDetection).filter(ThreatDetection.status != "closed").count(),
        "risk_levels": {level: sum(record.risk_level == level for record in scores) for level in ("low", "medium", "high", "critical")},
        "top_flagged_users": [serialize_risk_score(record) for record in top_flagged_users],
    }


@router.get("/reports/export.pdf")
def export_report_pdf(detail: str = Query("summary", pattern="^(summary|detailed)$"), db: Session = Depends(get_db), current_user=Depends(require_role(*READ_ROLES))):
    """Generate a summary or detailed analyst-ready PDF from persisted risk data."""
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter, landscape
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Spacer, Paragraph, Table, TableStyle

    scores = refresh_risk_categories(db)
    risk_levels = {level: sum(record.risk_level == level for record in scores) for level in ("low", "medium", "high", "critical")}
    top_users = sorted(scores, key=lambda record: record.risk_score, reverse=True)[:8]
    summary = {
        "Open anomalies": db.query(Anomaly).filter(Anomaly.status == "open").count(),
        "Active alerts": db.query(Alert).filter(Alert.status.in_(["new", "acknowledged", "investigating"])).count(),
        "Active threats": db.query(ThreatDetection).filter(ThreatDetection.status != "closed").count(),
    }

    output = BytesIO()
    page_size = landscape(letter) if detail == "detailed" else letter
    document = SimpleDocTemplate(output, pagesize=page_size, rightMargin=0.65 * inch, leftMargin=0.65 * inch)
    styles = getSampleStyleSheet()
    report_label = "Detailed" if detail == "detailed" else "Summary"
    story = [Paragraph(f"Aegis {report_label} Risk Report", styles["Title"]), Spacer(1, 0.18 * inch)]
    story.append(Paragraph("Current security and behavioral-risk summary", styles["Normal"]))
    story.append(Spacer(1, 0.15 * inch))
    story.append(Table([[label, str(value)] for label, value in summary.items()], colWidths=[3.2 * inch, 2.2 * inch], style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F1F3F6")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
        ("PADDING", (0, 0), (-1, -1), 7),
    ])))
    story.extend([Spacer(1, 0.22 * inch), Paragraph("Risk categories", styles["Heading2"])])
    story.append(Table([["Low", "Medium", "High", "Critical"], [str(risk_levels["low"]), str(risk_levels["medium"]), str(risk_levels["high"]), str(risk_levels["critical"])]], style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EAF0F8")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("PADDING", (0, 0), (-1, -1), 7),
    ])))
    story.extend([Spacer(1, 0.22 * inch), Paragraph("Top flagged users", styles["Heading2"])])
    rows = [["Employee", "Risk category", "Risk score"]] + [[record.employee_id, record.risk_level.title(), f"{record.risk_score:.1f}"] for record in top_users]
    story.append(Table(rows, colWidths=[2.4 * inch, 1.7 * inch, 1.3 * inch], style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#3E5C8A")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
        ("PADDING", (0, 0), (-1, -1), 7),
    ])))
    if detail == "detailed":
        def detailed_table(title, rows, widths):
            story.extend([Spacer(1, 0.22 * inch), Paragraph(title, styles["Heading2"])])
            story.append(Table(rows, colWidths=widths, repeatRows=1, style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#3E5C8A")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#D1D5DB")),
                ("PADDING", (0, 0), (-1, -1), 5), ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ])))

        alerts = db.query(Alert).order_by(Alert.created_at.desc()).all()
        detailed_table("Full alert list", [["ID", "Employee", "Severity", "Status", "Alert"]] + [
            [str(alert.id), alert.employee_id, alert.severity.title(), alert.status, alert.title]
            for alert in alerts
        ], [0.42 * inch, 0.8 * inch, 0.72 * inch, 0.92 * inch, 3.25 * inch])
        component_rows = [["Employee", "Risk", "Behavior", "Privilege", "Data access", "Access pattern", "History"]] + [
            [score.employee_id, f"{score.risk_score:.1f}", f"{score.behavioral_anomaly_score:.1f}",
             f"{score.privilege_misuse_score:.1f}", f"{score.data_access_score:.1f}",
             f"{score.access_pattern_score:.1f}", f"{score.historical_events_score:.1f}"]
            for score in sorted(scores, key=lambda record: record.employee_id)
        ]
        detailed_table("Risk-category breakdown by employee", component_rows,
                       [1.18 * inch, 0.72 * inch, 1.08 * inch, 1.08 * inch, 1.1 * inch, 1.22 * inch, 0.85 * inch])
        investigation_counts = {status: db.query(Investigation).filter(Investigation.status == status).count()
                                for status in ("Open", "In Progress", "Resolved")}
        detailed_table("Investigation status counts", [["Open", "In Progress", "Resolved"],
                       [[str(investigation_counts["Open"]), str(investigation_counts["In Progress"]), str(investigation_counts["Resolved"])]][0]],
                       [1.8 * inch, 1.8 * inch, 1.8 * inch])
    document.build(story)
    output.seek(0)
    return StreamingResponse(output, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=aegis-{detail}-risk-report.pdf"})
