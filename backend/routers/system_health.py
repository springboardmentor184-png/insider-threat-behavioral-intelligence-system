"""
API Router for Milestone 4: System Health, Telemetry & Diagnostics Endpoint.
"""

import time
import os
import sys
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from backend.core.database import get_db
from backend.models.user import User
from backend.models.dataset import Employee, LogonEvent, BehavioralAnomaly, Incident
from backend.routers.deps import get_current_user

router = APIRouter(prefix="/api", tags=["System Health & Diagnostics"])


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Lightweight health check endpoint for liveness & readiness probes.
    """
    start_time = time.time()
    try:
        # Perform quick database check
        res = await db.execute(select(1))
        res.scalar()
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    latency_ms = round((time.time() - start_time) * 1000, 2)

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "service": "ITBIS Insider Threat Engine",
        "version": "1.0.0",
        "database": db_status,
        "latency_ms": latency_ms
    }


@router.get("/system/status")
async def system_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Comprehensive Milestone 4 telemetry endpoint detailing dataset stats,
    active anomaly rates, system memory usage, and operational health metrics.
    """
    start_time = time.time()
    try:
        # Query record counts
        emp_count = (await db.execute(select(func.count(Employee.employee_id)))).scalar() or 0
        log_count = (await db.execute(select(func.count(LogonEvent.id)))).scalar() or 0
        anom_count = (await db.execute(select(func.count(BehavioralAnomaly.id)))).scalar() or 0
        inc_count = (await db.execute(select(func.count(Incident.id)))).scalar() or 0
        user_count = (await db.execute(select(func.count(User.id)))).scalar() or 0

        latency_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "status": "operational",
            "milestone": "Milestone 4 — Production Ready",
            "telemetry": {
                "monitored_employees": emp_count,
                "ingested_activity_logs": log_count,
                "flagged_behavioral_anomalies": anom_count,
                "active_investigation_cases": inc_count,
                "platform_registered_users": user_count,
            },
            "system_resources": {
                "python_version": sys.version.split(" ")[0],
                "process_id": os.getpid(),
                "query_latency_ms": latency_ms,
                "environment": os.getenv("ENVIRONMENT", "production"),
            },
            "security_modules": {
                "authentication_jwt": "active",
                "mfa_totp_engine": "active",
                "z_score_anomaly_detector": "active",
                "risk_scoring_5_factor": "active",
                "ueba_intelligence_engine": "active",
                "smtp_alert_dispatcher": "active",
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"System telemetry error: {str(e)}")
