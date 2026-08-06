"""
API Router for Insider Risk Scoring Engine (Module 6).
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional, List

from backend.core.database import get_db
from backend.models.user import User
from backend.models.dataset import Employee, EmployeeRiskHistory
from backend.routers.deps import get_current_user
from backend.services.risk_scorer import RiskScorerService

router = APIRouter(prefix="/api/risk", tags=["Risk Scoring"])


@router.post("/recalculate")
async def recalculate_risk_scores(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Trigger re-computation of weighted risk scores across all employees."""
    count = await RiskScorerService.compute_all_risk_scores(db)
    return {"status": "success", "employees_updated": count}


@router.get("/scores")
async def get_risk_scores(
    category: Optional[str] = None,
    department: Optional[str] = None,
    min_score: Optional[int] = Query(None, ge=0, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get list of employees with computed risk scores and risk categories."""
    stmt = select(Employee).order_by(desc(Employee.risk_score))
    if department:
        stmt = stmt.where(Employee.department == department)
    if min_score is not None:
        stmt = stmt.where(Employee.risk_score >= min_score)

    res = await db.execute(stmt)
    employees = res.scalars().all()

    results = []
    for emp in employees:
        cat = RiskScorerService.categorize_risk(emp.risk_score)
        if category and cat.lower() != category.lower():
            continue
        results.append({
            "employee_id": emp.employee_id,
            "name": emp.full_name,
            "department": emp.department,
            "designation": emp.designation,
            "risk_score": emp.risk_score,
            "risk_category": cat,
            "anomalies_count": len(emp.anomalies) if emp.anomalies else 0
        })

    return {"total_records": len(results), "data": results}


@router.get("/trends/{employee_id}")
async def get_employee_risk_trends(
    employee_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed component score breakdown and historical progression for an employee."""
    risk_detail = await RiskScorerService.compute_employee_risk(db, employee_id)

    history_stmt = (
        select(EmployeeRiskHistory)
        .where(EmployeeRiskHistory.employee_id == employee_id)
        .order_by(desc(EmployeeRiskHistory.timestamp))
        .limit(15)
    )
    history_res = await db.execute(history_stmt)
    history_records = history_res.scalars().all()

    timeline = [
        {
            "timestamp": h.timestamp.isoformat(),
            "risk_score": h.risk_score,
            "risk_category": h.risk_category,
            "behavioral": h.behavioral_score,
            "privilege": h.privilege_score,
            "data_access": h.data_access_score,
            "access_pattern": h.access_pattern_score,
            "history": h.historical_events_score
        }
        for h in history_records
    ]

    risk_detail["timeline"] = timeline
    return risk_detail
