"""
Unit and Integration Tests for Milestone 2: Week 3 & 4 - Behavioral Analytics & Anomaly Detection
"""

import pytest
import json
from datetime import datetime, timezone, timedelta
from httpx import AsyncClient
from sqlalchemy import select
from backend.models.dataset import Employee, LogonEvent, DeviceEvent, FileEvent, EmailEvent, HttpEvent, EmployeeBaseline, BehavioralAnomaly, AnomalyReport
from backend.services.behavioral_profiler import BehavioralProfilerService
from backend.services.anomaly_detector import AnomalyDetectorService
from backend.services.report_generator import ReportGeneratorService


@pytest.mark.asyncio
async def test_baseline_computation_and_anomaly_detection(db_session):
    """Test profiler computes baseline metrics and detector flags logical anomalies."""
    # Seed an employee
    emp_id = "TES0002"
    emp = Employee(
        employee_id=emp_id,
        full_name="Bob Miller",
        email="bob@test.com",
        role="Programmer",
        department="Development",
        designation="Programmer",
        risk_score=30
    )
    db_session.add(emp)
    await db_session.commit()

    # Seed 5 normal logon events (during standard working hours 9 AM - 5 PM)
    for i in range(5):
        log = LogonEvent(
            event_id=f"{{NORM-LOG-{i}}}",
            timestamp=datetime(2026, 7, i + 1, 10, 0, 0, tzinfo=timezone.utc),
            employee_id=emp_id,
            pc="PC-1234",
            activity="Logon"
        )
        db_session.add(log)

    await db_session.commit()

    # Compute baseline
    baseline = await BehavioralProfilerService.compute_employee_baseline(db_session, emp_id)
    assert baseline.avg_daily_logons == 1.0
    assert baseline.after_hours_logon_ratio == 0.0
    assert baseline.common_pcs == "PC-1234"

    # Add anomalous logon event (at 11:30 PM after hours on another PC)
    anom_log = LogonEvent(
        event_id="{ANOM-LOG-1}",
        timestamp=datetime(2026, 7, 10, 23, 30, 0, tzinfo=timezone.utc),
        employee_id=emp_id,
        pc="PC-5555",
        activity="Logon"
    )
    db_session.add(anom_log)
    await db_session.commit()

    # Run detector
    new_anom_count = await AnomalyDetectorService.analyze_employee(db_session, emp_id)
    assert new_anom_count > 0

    # Query database to confirm
    stmt = select(BehavioralAnomaly).where(BehavioralAnomaly.employee_id == emp_id)
    anomalies = (await db_session.execute(stmt)).scalars().all()
    assert len(anomalies) >= 1
    categories = [a.category for a in anomalies]
    assert "Unusual Login Time" in categories or "Unauthorized Access Attempts" in categories


@pytest.mark.asyncio
async def test_dashboard_anomaly_and_reports_api(test_client: AsyncClient, seed_user, db_session):
    """Test Week 3 & 4 dashboard endpoints with mock authorization."""
    # Seed employee and anomaly
    emp = Employee(
        employee_id="TES0003",
        full_name="Alice Smith",
        email="alice@test.com",
        role="Programmer",
        department="Development",
        designation="Programmer",
        risk_score=10
    )
    anom = BehavioralAnomaly(
        employee_id="TES0003",
        timestamp=datetime.now(timezone.utc),
        category="Suspicious Device Usage",
        severity="High",
        description="USB connection at midnight",
        status="Open",
        pc="PC-8888"
    )
    db_session.add(emp)
    db_session.add(anom)
    await db_session.commit()

    # Login
    login_res = await test_client.post(
        "/api/auth/login",
        json={"email": seed_user.email, "password": "password123"}
    )
    assert login_res.status_code == 200
    access_token = login_res.cookies.get("access_token")
    test_client.cookies.set("access_token", access_token)

    # 1. Test get anomalies
    res = await test_client.get("/api/dashboard/anomalies")
    assert res.status_code == 200
    data = res.json()
    assert data["total_records"] >= 1
    assert data["data"][0]["employee_id"] == "TES0003"
    assert data["data"][0]["severity"] == "High"

    # 2. Test status patch
    anomaly_id = data["data"][0]["id"]
    patch_res = await test_client.patch(
        f"/api/dashboard/anomalies/{anomaly_id}",
        json={"status": "Under Investigation"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["new_status"] == "Under Investigation"

    # 3. Test baselines endpoint
    base_res = await test_client.get("/api/dashboard/baselines/TES0003")
    assert base_res.status_code == 200
    base_data = base_res.json()
    assert base_data["employee_id"] == "TES0003"
    assert "baseline" in base_data
    assert "actual" in base_data

    # 4. Test run detection endpoint
    run_res = await test_client.post("/api/dashboard/run-detection")
    assert run_res.status_code == 200
    run_data = run_res.json()
    assert run_data["status"] == "success"

    # 5. Test reports endpoint
    rep_res = await test_client.get("/api/dashboard/reports")
    assert rep_res.status_code == 200
    rep_data = rep_res.json()
    assert len(rep_data) >= 1
    assert "Automated Scan Threat Report" in rep_data[0]["title"]
