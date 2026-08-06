"""
API Router for Notification & Escalation System (Module 11).
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.database import get_db
from backend.models.user import User
from backend.routers.deps import get_current_user
from backend.services.notification_service import NotificationService

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("/")
async def get_my_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetch recent notifications for current user."""
    notifs = await NotificationService.get_user_notifications(db, current_user.email)
    results = [
        {
            "id": n.id,
            "user_email": n.user_email,
            "title": n.title,
            "message": n.message,
            "category": n.category,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat()
        }
        for n in notifs
    ]
    unread_count = sum(1 for n in notifs if not n.is_read)
    return {"unread_count": unread_count, "data": results}


@router.patch("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark notification as read."""
    notif = await NotificationService.mark_read(db, notification_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "success", "id": notification_id}


@router.get("/verify-smtp")
async def verify_smtp_status(
    current_user: User = Depends(get_current_user)
):
    """Check current SMTP server connection and credentials status."""
    from backend.services.email_service import EmailService
    return await EmailService.verify_smtp_connection()


@router.post("/test-email")
async def send_test_email(
    target_email: str,
    current_user: User = Depends(get_current_user)
):
    """Send a test email notification to verify SMTP setup."""
    from backend.services.email_service import EmailService
    sent = await EmailService.send_email(
        recipient_emails=[target_email],
        subject="[ITBIS TEST EMAIL] SMTP Configuration Verification",
        body_text=f"Hello,\n\nThis is a test notification email sent from ITBIS to verify SMTP delivery for {target_email}.\n\nTimestamp: {datetime.now(timezone.utc)}"
    )
    if not sent:
        raise HTTPException(status_code=500, detail="Failed to dispatch test email. Check server logs.")
    return {"status": "success", "message": f"Test email dispatched to {target_email}."}
