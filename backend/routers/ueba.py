"""
API Router for UEBA Intelligence Engine (Module 8).
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.database import get_db
from backend.models.user import User
from backend.routers.deps import get_current_user
from backend.services.ueba_engine import UEBAEngineService

router = APIRouter(prefix="/api/ueba", tags=["UEBA Intelligence"])


@router.get("/peer-comparison/{employee_id}")
async def get_peer_comparison(
    employee_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get peer group comparison metrics for an employee vs their department."""
    try:
        return await UEBAEngineService.get_peer_group_comparison(db, employee_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/department-stats")
async def get_department_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get aggregated departmental behavior averages."""
    return await UEBAEngineService.get_department_peer_baselines(db)


@router.get("/predictions")
async def get_threat_predictions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get behavioral trend analysis and 30-day insider threat predictions."""
    return await UEBAEngineService.predict_threat_trends(db)
