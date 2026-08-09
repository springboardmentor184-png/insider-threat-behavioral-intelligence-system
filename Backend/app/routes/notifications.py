from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas import (
    NotificationResponse,
    NotificationReadResponse
)

from app.services.notification_service import (
    get_notifications,
    get_unread_count,
    mark_notification_read,
    mark_all_notifications_read
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# ==========================================
# Get All Notifications
# ==========================================

@router.get(
    "",
    response_model=list[NotificationResponse]
)
def notifications(
    db: Session = Depends(get_db)
):

    return get_notifications(db)


# ==========================================
# Get Unread Notification Count
# ==========================================

@router.get(
    "/unread-count"
)
def unread_count(
    db: Session = Depends(get_db)
):

    count = get_unread_count(db)

    return {
        "unread_count": count
    }


# ==========================================
# Mark Notification as Read
# ==========================================

@router.put(
    "/{notification_id}/read",
    response_model=NotificationReadResponse
)
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db)
):

    notification = mark_notification_read(
        db,
        notification_id
    )

    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return {
        "message": "Notification marked as read",
        "notification_id": notification.id,
        "is_read": notification.is_read
    }


# ==========================================
# Mark All Notifications as Read
# ==========================================

@router.put(
    "/read-all"
)
def read_all(
    db: Session = Depends(get_db)
):

    count = mark_all_notifications_read(db)

    return {
        "message": "All notifications marked as read",
        "updated_count": count
    }