"""
Activity log routes: basic ingestion pipeline endpoints.
"""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.database import get_db
from backend.models.user import User
from backend.models.enums import UserRole
from backend.schemas.activity_log import ActivityLogCreate, ActivityLogResponse
from backend.routers.deps import get_current_user, require_role
from backend.services.activity_log_service import create_log, get_logs_by_user, get_all_logs

router = APIRouter(prefix="/api/logs", tags=["Activity Logs"])


@router.post("/", response_model=ActivityLogResponse)
async def create_activity_log(
    log_data: ActivityLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new activity log entry."""
    return await create_log(db, log_data)


@router.get("/me", response_model=list[ActivityLogResponse])
async def get_my_logs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the current user's activity logs."""
    return await get_logs_by_user(db, current_user.id)


@router.get("/", response_model=list[ActivityLogResponse])
async def list_all_logs(
    current_user: User = Depends(require_role(UserRole.ADMINISTRATOR)),
    db: AsyncSession = Depends(get_db),
):
    """Get all activity logs (Administrator only)."""
    return await get_all_logs(db)
