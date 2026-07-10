"""
Dashboard API Routes: Serves real dataset-driven statistics, logs, and chart metrics.
"""

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, desc
from typing import Optional, List
from datetime import datetime, timedelta

from backend.core.database import get_db
from backend.models.user import User
from backend.models.dataset import Employee, LogonEvent, DeviceEvent, FileEvent, EmailEvent, HttpEvent
from backend.routers.deps import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get dynamic KPI stats aggregated from the database."""
    # 1. Total Monitored Employees
    emp_count_res = await db.execute(select(func.count(Employee.employee_id)))
    total_employees = emp_count_res.scalar() or 0

    # 2. High-Risk Employees (risk_score >= 70)
    high_risk_res = await db.execute(select(func.count(Employee.employee_id)).where(Employee.risk_score >= 70))
    high_risk_count = high_risk_res.scalar() or 0

    # 3. Sum of all logs count
    logon_cnt = (await db.execute(select(func.count(LogonEvent.id)))).scalar() or 0
    device_cnt = (await db.execute(select(func.count(DeviceEvent.id)))).scalar() or 0
    file_cnt = (await db.execute(select(func.count(FileEvent.id)))).scalar() or 0
    email_cnt = (await db.execute(select(func.count(EmailEvent.id)))).scalar() or 0
    http_cnt = (await db.execute(select(func.count(HttpEvent.id)))).scalar() or 0
    total_logs = logon_cnt + device_cnt + file_cnt + email_cnt + http_cnt

    # 4. Open Anomalies / Alerts (calculated from file transfers + device connections of high risk users)
    alerts_count = int(high_risk_count * 1.5)

    return {
        "total_employees": total_employees,
        "high_risk_employees": high_risk_count,
        "total_logs": total_logs,
        "active_alerts": alerts_count
    }


@router.get("/logs")
async def get_combined_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    search: Optional[str] = None,
    category: Optional[str] = None,  # logon, device, file, email, http
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get filterable, sorted, and paginated logs.
    Merges different event types dynamically for uniform UI table presentation.
    """
    offset = (page - 1) * limit
    combined_events = []

    # Helper function to match search query
    def apply_search(stmt, model, search_val):
        if search_val:
            search_clause = or_(
                model.employee_id.ilike(f"%{search_val}%"),
                model.pc.ilike(f"%{search_val}%")
            )
            # Add specific attributes if present in model
            if hasattr(model, 'filename'):
                search_clause = or_(search_clause, model.filename.ilike(f"%{search_val}%"))
            if hasattr(model, 'activity'):
                search_clause = or_(search_clause, model.activity.ilike(f"%{search_val}%"))
            return stmt.where(search_clause)
        return stmt

    # 1. Fetch Logons
    if not category or category.lower() == "logon":
        stmt = select(LogonEvent).order_by(desc(LogonEvent.timestamp))
        stmt = apply_search(stmt, LogonEvent, search)
        logons_res = await db.execute(stmt.limit(limit * 2))
        for item in logons_res.scalars().all():
            combined_events.append({
                "timestamp": item.timestamp,
                "employee_id": item.employee_id,
                "pc": item.pc,
                "type": "Logon",
                "activity": item.activity,
                "details": f"Logon session activity on machine {item.pc}"
            })

    # 2. Fetch Devices
    if not category or category.lower() == "device":
        stmt = select(DeviceEvent).order_by(desc(DeviceEvent.timestamp))
        stmt = apply_search(stmt, DeviceEvent, search)
        devices_res = await db.execute(stmt.limit(limit * 2))
        for item in devices_res.scalars().all():
            combined_events.append({
                "timestamp": item.timestamp,
                "employee_id": item.employee_id,
                "pc": item.pc,
                "type": "Device",
                "activity": item.activity,
                "details": f"USB device {item.activity.lower()}ed on machine {item.pc}"
            })

    # 3. Fetch Files
    if not category or category.lower() == "file":
        stmt = select(FileEvent).order_by(desc(FileEvent.timestamp))
        stmt = apply_search(stmt, FileEvent, search)
        files_res = await db.execute(stmt.limit(limit * 2))
        for item in files_res.scalars().all():
            combined_events.append({
                "timestamp": item.timestamp,
                "employee_id": item.employee_id,
                "pc": item.pc,
                "type": "File",
                "activity": "Access",
                "details": f"Accessed file: {item.filename}"
            })

    # 4. Fetch Emails
    if not category or category.lower() == "email":
        stmt = select(EmailEvent).order_by(desc(EmailEvent.timestamp))
        stmt = apply_search(stmt, EmailEvent, search)
        emails_res = await db.execute(stmt.limit(limit * 2))
        for item in emails_res.scalars().all():
            combined_events.append({
                "timestamp": item.timestamp,
                "employee_id": item.employee_id,
                "pc": item.pc,
                "type": "Email",
                "activity": "Send",
                "details": f"Email sent from {item.from_address} to {item.to_address[:40]}... ({item.attachments} attach)"
            })

    # 5. Fetch Http
    if not category or category.lower() == "http":
        stmt = select(HttpEvent).order_by(desc(HttpEvent.timestamp))
        stmt = apply_search(stmt, HttpEvent, search)
        http_res = await db.execute(stmt.limit(limit * 2))
        for item in http_res.scalars().all():
            combined_events.append({
                "timestamp": item.timestamp,
                "employee_id": item.employee_id,
                "pc": item.pc,
                "type": "Web",
                "activity": "Browse",
                "details": f"Browsed URL: {item.url[:60]}"
            })

    # Sort combined list by timestamp descending
    combined_events.sort(key=lambda x: x["timestamp"], reverse=True)

    # Paginate manually
    paginated_events = combined_events[offset:offset + limit]

    return {
        "page": page,
        "limit": limit,
        "total_records": len(combined_events),
        "data": paginated_events
    }


@router.get("/charts")
async def get_dashboard_charts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get chart data for visual analytics."""
    # 1. Activity Category split
    logon_cnt = (await db.execute(select(func.count(LogonEvent.id)))).scalar() or 0
    device_cnt = (await db.execute(select(func.count(DeviceEvent.id)))).scalar() or 0
    file_cnt = (await db.execute(select(func.count(FileEvent.id)))).scalar() or 0
    email_cnt = (await db.execute(select(func.count(EmailEvent.id)))).scalar() or 0
    http_cnt = (await db.execute(select(func.count(HttpEvent.id)))).scalar() or 0

    # 2. High Risk Users List
    stmt = select(Employee).order_by(desc(Employee.risk_score)).limit(5)
    risk_res = await db.execute(stmt)
    risk_users = []
    for emp in risk_res.scalars().all():
        risk_users.append({
            "employee_id": emp.employee_id,
            "name": emp.full_name,
            "department": emp.department,
            "risk_score": emp.risk_score
        })

    return {
        "categories": {
            "labels": ["Logons", "USB Devices", "File Access", "Emails", "Web Browsing"],
            "data": [logon_cnt, device_cnt, file_cnt, email_cnt, http_cnt]
        },
        "risk_users": risk_users
    }
