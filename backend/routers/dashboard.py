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
from backend.models.dataset import (
    Employee, LogonEvent, DeviceEvent, FileEvent, EmailEvent, HttpEvent,
    EmployeeBaseline, BehavioralAnomaly, AnomalyReport
)
from backend.routers.deps import get_current_user
from backend.services.behavioral_profiler import BehavioralProfilerService
from backend.services.anomaly_detector import AnomalyDetectorService
from backend.services.report_generator import ReportGeneratorService
import json

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

    # 4. Open Anomalies / Alerts (calculated from real behavioral anomalies in the DB)
    alerts_res = await db.execute(
        select(func.count(BehavioralAnomaly.id)).where(
            or_(
                BehavioralAnomaly.status == "Open",
                BehavioralAnomaly.status == "Under Investigation"
            )
        )
    )
    alerts_count = alerts_res.scalar() or 0

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

    # 2. High Risk Users List (only show employees with actual detected anomalies)
    stmt = (
        select(Employee, func.count(BehavioralAnomaly.id).label("anomaly_count"))
        .join(BehavioralAnomaly, Employee.employee_id == BehavioralAnomaly.employee_id)
        .group_by(Employee.employee_id, Employee.full_name, Employee.department, Employee.risk_score)
        .order_by(desc("anomaly_count"))
        .limit(5)
    )
    risk_res = await db.execute(stmt)
    risk_users = []
    for emp, anom_count in risk_res.all():
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


@router.post("/run-detection")
async def run_detection(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Trigger profiling baseline computations and anomaly scan."""
    baselines_computed = await BehavioralProfilerService.compute_all_baselines(db)
    anomalies_detected = await AnomalyDetectorService.analyze_all_employees(db)
    # Generate threat report
    await ReportGeneratorService.generate_report(db, title="Automated Scan Threat Report")
    return {
        "status": "success",
        "baselines_computed": baselines_computed,
        "anomalies_detected": anomalies_detected
    }


@router.get("/anomalies")
async def get_anomalies(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    severity: Optional[str] = None,
    category: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve filterable, sorted, and paginated anomalies."""
    offset = (page - 1) * limit
    stmt = select(BehavioralAnomaly).order_by(desc(BehavioralAnomaly.timestamp))

    if severity:
        stmt = stmt.where(BehavioralAnomaly.severity == severity)
    if category:
        stmt = stmt.where(BehavioralAnomaly.category == category)
    if status_filter:
        stmt = stmt.where(BehavioralAnomaly.status == status_filter)
    if search:
        stmt = stmt.where(
            or_(
                BehavioralAnomaly.employee_id.ilike(f"%{search}%"),
                BehavioralAnomaly.pc.ilike(f"%{search}%"),
                BehavioralAnomaly.description.ilike(f"%{search}%")
            )
        )

    # Get total count
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_records = (await db.execute(count_stmt)).scalar() or 0

    # Get paginated results
    res = await db.execute(stmt.offset(offset).limit(limit))
    anomalies = res.scalars().all()

    data = []
    for a in anomalies:
        data.append({
            "id": a.id,
            "employee_id": a.employee_id,
            "timestamp": a.timestamp,
            "category": a.category,
            "severity": a.severity,
            "description": a.description,
            "details": json.loads(a.details) if a.details else {},
            "status": a.status,
            "pc": a.pc,
            "created_at": a.created_at
        })

    return {
        "page": page,
        "limit": limit,
        "total_records": total_records,
        "data": data
    }


@router.get("/baselines/{employee_id}")
async def get_employee_baseline(
    employee_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get dynamic profile comparison metrics for baseline vs actual."""
    baseline_stmt = select(EmployeeBaseline).where(EmployeeBaseline.employee_id == employee_id)
    baseline = (await db.execute(baseline_stmt)).scalar_one_or_none()

    if not baseline:
        # Compute on-the-fly if missing
        baseline = await BehavioralProfilerService.compute_employee_baseline(db, employee_id)

    # Fetch employee info
    emp = (await db.execute(select(Employee).where(Employee.employee_id == employee_id))).scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Fetch daily event counts to compare actual stats
    num_logons = (await db.execute(select(func.count(LogonEvent.id)).where(LogonEvent.employee_id == employee_id))).scalar() or 0
    num_usbs = (await db.execute(select(func.count(DeviceEvent.id)).where(DeviceEvent.employee_id == employee_id))).scalar() or 0
    num_files = (await db.execute(select(func.count(FileEvent.id)).where(FileEvent.employee_id == employee_id))).scalar() or 0
    num_emails = (await db.execute(select(func.count(EmailEvent.id)).where(EmailEvent.employee_id == employee_id))).scalar() or 0
    num_https = (await db.execute(select(func.count(HttpEvent.id)).where(HttpEvent.employee_id == employee_id))).scalar() or 0

    return {
        "employee_id": employee_id,
        "name": emp.full_name,
        "department": emp.department,
        "risk_score": emp.risk_score,
        "baseline": {
            "avg_daily_logons": baseline.avg_daily_logons,
            "after_hours_logon_ratio": baseline.after_hours_logon_ratio,
            "weekend_logon_ratio": baseline.weekend_logon_ratio,
            "avg_daily_usb_connects": baseline.avg_daily_usb_connects,
            "avg_daily_file_accesses": baseline.avg_daily_file_accesses,
            "avg_daily_emails_sent": baseline.avg_daily_emails_sent,
            "avg_email_attachment_count": baseline.avg_email_attachment_count,
            "avg_email_size": baseline.avg_email_size,
            "avg_daily_web_browses": baseline.avg_daily_web_browses,
            "job_search_ratio": baseline.job_search_ratio,
            "cloud_upload_ratio": baseline.cloud_upload_ratio,
            "common_pcs": baseline.common_pcs
        },
        "actual": {
            "total_logons": num_logons,
            "total_usb_connects": num_usbs,
            "total_file_accesses": num_files,
            "total_emails_sent": num_emails,
            "total_web_browses": num_https
        }
    }


@router.get("/reports")
async def get_reports(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all cached executive anomaly reports."""
    stmt = select(AnomalyReport).order_by(desc(AnomalyReport.created_at))
    res = await db.execute(stmt)
    reports = res.scalars().all()
    
    data = []
    for r in reports:
        data.append({
            "id": r.id,
            "title": r.title,
            "summary": r.summary,
            "total_anomalies_detected": r.total_anomalies_detected,
            "critical_threat_count": r.critical_threat_count,
            "created_at": r.created_at,
            "data": json.loads(r.data) if r.data else {}
        })
    return data


@router.get("/reports/{report_id}")
async def get_report_detail(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve detail data for a single anomaly report."""
    stmt = select(AnomalyReport).where(AnomalyReport.id == report_id)
    report = (await db.execute(stmt)).scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    return {
        "id": report.id,
        "title": report.title,
        "summary": report.summary,
        "total_anomalies_detected": report.total_anomalies_detected,
        "critical_threat_count": report.critical_threat_count,
        "created_at": report.created_at,
        "data": json.loads(report.data) if report.data else {}
    }


@router.patch("/anomalies/{anomaly_id}")
async def update_anomaly_status(
    anomaly_id: int,
    status_update: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update behavioral anomaly status (Open, Under Investigation, Resolved, Dismissed)."""
    stmt = select(BehavioralAnomaly).where(BehavioralAnomaly.id == anomaly_id)
    anomaly = (await db.execute(stmt)).scalar_one_or_none()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
        
    new_status = status_update.get("status")
    if new_status not in ("Open", "Under Investigation", "Resolved", "Dismissed"):
        raise HTTPException(status_code=400, detail="Invalid status value")
        
    anomaly.status = new_status
    await db.commit()
    return {"status": "success", "anomaly_id": anomaly_id, "new_status": new_status}
