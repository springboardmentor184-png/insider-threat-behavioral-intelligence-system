from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import get_current_user
from ..models import User, UserProfile, Alert, Incident, Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.post("/generate-from-alerts")
def generate_notifications_from_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create notification records for open alerts that don't already have one."""
    alerts = db.query(Alert).filter(Alert.status == "Open").all()
    created = 0

    for alert in alerts:
        existing = (
            db.query(Notification)
            .filter(Notification.related_alert_id == alert.id)
            .first()
        )
        if existing:
            continue

        notification = Notification(
            notification_type="Insider Threat Alert",
            title=f"New {alert.severity} Alert: {alert.employee}",
            message=alert.description,
            severity=alert.severity,
            related_employee_id=alert.employee,
            related_alert_id=alert.id,
        )
        db.add(notification)
        created += 1

    db.commit()
    return {"message": f"Generated {created} alert notifications"}


@router.post("/generate-from-incidents")
def generate_notifications_from_incidents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create notification records for open/investigating incidents that don't already have one."""
    incidents = db.query(Incident).filter(Incident.status.in_(["Open", "Investigating"])).all()
    created = 0

    for incident in incidents:
        existing = (
            db.query(Notification)
            .filter(Notification.related_incident_id == incident.id)
            .first()
        )
        if existing:
            continue

        notification = Notification(
            notification_type="Investigation Notification",
            title=f"Incident Update: {incident.employee_id}",
            message=incident.description,
            severity=incident.risk_category,
            related_employee_id=incident.employee_id,
            related_incident_id=incident.id,
        )
        db.add(notification)
        created += 1

    db.commit()
    return {"message": f"Generated {created} incident notifications"}


@router.post("/escalation-alert/{alert_id}")
def create_escalation_notification(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manually create a notification when an alert is escalated."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    notification = Notification(
        notification_type="Escalation Alert",
        title=f"ESCALATED: {alert.employee}",
        message=f"Alert #{alert.id} escalated to {alert.severity} severity",
        severity=alert.severity,
        related_employee_id=alert.employee,
        related_alert_id=alert.id,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


@router.get("/")
def list_notifications(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Notification)
    if unread_only:
        query = query.filter(Notification.is_read == False)

    notifications = query.order_by(Notification.created_at.desc()).all()
    return notifications


@router.get("/{notification_id}")
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification


@router.put("/{notification_id}/mark-read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


@router.get("/summary/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = db.query(Notification).filter(Notification.is_read == False).count()
    return {"unread_count": count}