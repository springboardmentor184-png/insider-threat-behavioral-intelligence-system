from sqlalchemy.orm import Session

from app.models import Notification


# ==========================================
# Create Notification
# ==========================================

def create_notification(
    db: Session,
    employee_id: int | None,
    notification_type: str,
    title: str,
    message: str,
    severity: str = "Informational"
):

    notification = Notification(
        employee_id=employee_id,
        notification_type=notification_type,
        title=title,
        message=message,
        severity=severity,
        is_read=False
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    print("========================================")
    print("🔔 NOTIFICATION CREATED")
    print("Notification ID:", notification.id)
    print("Employee ID:", employee_id)
    print("Type:", notification_type)
    print("Severity:", severity)
    print("========================================")

    return notification


# ==========================================
# Get Notifications
# ==========================================

def get_notifications(
    db: Session,
    limit: int = 50
):

    return (
        db.query(Notification)
        .order_by(
            Notification.created_at.desc()
        )
        .limit(limit)
        .all()
    )


# ==========================================
# Get Unread Count
# ==========================================

def get_unread_count(
    db: Session
):

    return (
        db.query(Notification)
        .filter(
            Notification.is_read == False
        )
        .count()
    )


# ==========================================
# Mark Notification as Read
# ==========================================

def mark_notification_read(
    db: Session,
    notification_id: int
):

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id
        )
        .first()
    )

    if not notification:
        return None

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return notification


# ==========================================
# Mark All Notifications as Read
# ==========================================

def mark_all_notifications_read(
    db: Session
):

    notifications = (
        db.query(Notification)
        .filter(
            Notification.is_read == False
        )
        .all()
    )

    for notification in notifications:
        notification.is_read = True

    db.commit()

    return len(notifications)