"""
Notification & Escalation System (Module 11)
Manages threat notifications, analyst alerts, and escalation tracking.
"""

from datetime import datetime, timezone
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from backend.models.dataset import Notification
from backend.models.user import User
from backend.models.enums import UserRole
from backend.services.email_service import EmailService


class NotificationService:
    @classmethod
    async def create_notification(
        cls,
        db: AsyncSession,
        user_email: str,
        title: str,
        message: str,
        category: str = "Threat Alert"
    ) -> Notification:
        """
        Create a new notification entry and dispatch email alert to recipient(s).
        """
        notif = Notification(
            user_email=user_email,
            title=title,
            message=message,
            category=category,
            is_read=False,
            created_at=datetime.now(timezone.utc)
        )
        db.add(notif)
        await db.commit()
        await db.refresh(notif)

        # Dispatch email notification to recipient or all admins & managers
        recipients = []
        if user_email == "all":
            # Query administrators and security managers
            user_stmt = select(User.email).where(
                User.role.in_([UserRole.ADMINISTRATOR, UserRole.SECURITY_MANAGER])
            )
            recipients = list((await db.execute(user_stmt)).scalars().all())
            if not recipients:
                recipients = ["admin@itbis.com", "manager@itbis.com"]
        else:
            recipients = [user_email]

        await EmailService.send_email(
            recipient_emails=recipients,
            subject=f"[ITBIS {category.upper()}] {title}",
            body_text=f"{title}\n\n{message}\n\nAccess Platform: http://localhost:8000/dashboard"
        )

        return notif

    @classmethod
    async def get_user_notifications(cls, db: AsyncSession, user_email: str, limit: int = 20) -> List[Notification]:
        """
        Get notifications for a user or global broadcasts ('all').
        """
        stmt = (
            select(Notification)
            .where((Notification.user_email == user_email) | (Notification.user_email == "all"))
            .order_by(desc(Notification.created_at))
            .limit(limit)
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    @classmethod
    async def mark_read(cls, db: AsyncSession, notification_id: int) -> Notification:
        """
        Mark a notification as read.
        """
        stmt = select(Notification).where(Notification.id == notification_id)
        notif = (await db.execute(stmt)).scalar_one_or_none()
        if notif:
            notif.is_read = True
            await db.commit()
            await db.refresh(notif)
        return notif
