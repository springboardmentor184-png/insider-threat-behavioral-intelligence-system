"""
Activity log service: basic log ingestion operations.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.activity_log import ActivityLog
from backend.schemas.activity_log import ActivityLogCreate


async def create_log(db: AsyncSession, log_data: ActivityLogCreate) -> ActivityLog:
    """Insert a new activity log entry."""
    log_entry = ActivityLog(
        user_id=log_data.user_id,
        action=log_data.action,
        details=log_data.details,
        ip_address=log_data.ip_address,
    )
    db.add(log_entry)
    await db.flush()
    await db.refresh(log_entry)
    return log_entry


async def get_logs_by_user(db: AsyncSession, user_id: int) -> list[ActivityLog]:
    """Get all activity logs for a specific user."""
    result = await db.execute(
        select(ActivityLog)
        .where(ActivityLog.user_id == user_id)
        .order_by(ActivityLog.timestamp.desc())
    )
    return list(result.scalars().all())


async def get_all_logs(db: AsyncSession) -> list[ActivityLog]:
    """Get all activity logs (admin use)."""
    result = await db.execute(
        select(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(500)
    )
    return list(result.scalars().all())
