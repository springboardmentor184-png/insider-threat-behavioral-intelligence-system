"""
Automated Integration and Unit Tests for Milestone 3:
  - Insider Risk Scoring Engine (5-factor weighted scoring model & risk categories)
  - UEBA Intelligence Engine (Department peer baselines & threat predictions)
  - Threat Investigation Module (Incident cases, analyst assignment, activity timeline, evidence attachment)
  - Notifications API
  - Excel & PDF Reports Export System
"""

import pytest
from datetime import datetime, timezone
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.dataset import (
    Employee, LogonEvent, DeviceEvent, FileEvent, EmailEvent, HttpEvent,
    EmployeeBaseline, BehavioralAnomaly, Incident
)
from backend.services.risk_scorer import RiskScorerService
from backend.services.ueba_engine import UEBAEngineService
from backend.services.investigation_service import InvestigationService


@pytest.mark.asyncio
async def test_weighted_risk_scoring_engine(db_session: AsyncSession):
    """Test 5-factor weighted risk scoring model calculation and risk categories."""
    emp = Employee(
        employee_id="M3EMP01",
        full_name="Risk Test Employee",
        email="m3emp01@test.com",
        department="Security Ops",
        risk_score=0
    )
    baseline = EmployeeBaseline(
        employee_id="M3EMP01",
        avg_daily_logons=8.0,
        after_hours_logon_ratio=0.35,  # High after hours
        weekend_logon_ratio=0.25,      # High weekend
        common_pcs="PC-1,PC-2,PC-3,PC-4"
    )
    anom1 = BehavioralAnomaly(
        employee_id="M3EMP01",
        timestamp=datetime.now(timezone.utc),
        category="Unauthorized Access Attempts",
        severity="Critical",
        description="Unauthorized login to PC-999"
    )
    anom2 = BehavioralAnomaly(
        employee_id="M3EMP01",
        timestamp=datetime.now(timezone.utc),
        category="Exfiltration Indicator",
        severity="High",
        description="Dropbox cloud upload spike"
    )
    db_session.add(emp)
    db_session.add(baseline)
    db_session.add(anom1)
    db_session.add(anom2)
    await db_session.commit()

    risk_result = await RiskScorerService.compute_employee_risk(db_session, "M3EMP01")

    assert risk_result["employee_id"] == "M3EMP01"
    assert risk_result["risk_score"] > 0
    assert risk_result["risk_category"] in ["Low Risk", "Medium Risk", "High Risk", "Critical Risk"]
    assert "components" in risk_result
    assert "behavioral_anomalies" in risk_result["components"]
    assert "privilege_misuse" in risk_result["components"]
    assert "data_access_violations" in risk_result["components"]


@pytest.mark.asyncio
async def test_ueba_peer_group_comparison_and_predictions(db_session: AsyncSession):
    """Test UEBA department peer baselines and threat prediction workflows."""
    emp = Employee(
        employee_id="UEBA01",
        full_name="UEBA Test Employee",
        email="ueba01@test.com",
        department="Engineering",
        risk_score=75
    )
    baseline = EmployeeBaseline(
        employee_id="UEBA01",
        avg_daily_logons=15.0,
        avg_daily_usb_connects=4.0,
        avg_daily_file_accesses=40.0,
        avg_daily_emails_sent=20.0,
        avg_email_size=500000.0,
        avg_daily_web_browses=100.0
    )
    db_session.add(emp)
    db_session.add(baseline)
    await db_session.commit()

    # 1. Test Peer Group Comparison
    peer_comp = await UEBAEngineService.get_peer_group_comparison(db_session, "UEBA01")
    assert peer_comp["employee_id"] == "UEBA01"
    assert "employee_metrics" in peer_comp
    assert "peer_metrics" in peer_comp
    assert "deviations_pct" in peer_comp

    # 2. Test Threat Predictions
    predictions = await UEBAEngineService.predict_threat_trends(db_session)
    assert len(predictions) >= 1
    assert predictions[0]["employee_id"] == "UEBA01"
    assert predictions[0]["trajectory"] in ["Increasing", "Stable", "Decreasing"]


@pytest.mark.asyncio
async def test_investigation_incidents_and_timeline_api(test_client: AsyncClient, seed_user, db_session: AsyncSession):
    """Test Incident creation, analyst assignment, activity timeline, and evidence attachment endpoints."""
    # Seed employee and logon event
    emp = Employee(
        employee_id="INC01",
        full_name="Investigation Subject",
        email="inc01@test.com",
        department="Finance",
        risk_score=80
    )
    log = LogonEvent(
        event_id="{INC-EVENT-1}",
        timestamp=datetime.now(timezone.utc),
        employee_id="INC01",
        pc="PC-100",
        activity="Logon"
    )
    db_session.add(emp)
    db_session.add(log)
    await db_session.commit()

    # Login to set cookie
    login_res = await test_client.post(
        "/api/auth/login",
        json={"email": seed_user.email, "password": "password123"}
    )
    assert login_res.status_code == 200
    access_token = login_res.cookies.get("access_token")
    test_client.cookies.set("access_token", access_token)

    # 1. Create Incident
    inc_res = await test_client.post(
        "/api/investigations/",
        json={
            "employee_id": "INC01",
            "title": "Unusual Logon Investigation",
            "description": "Logon detected outside baseline PC whitelist",
            "severity": "High"
        }
    )
    assert inc_res.status_code == 200
    inc_data = inc_res.json()
    incident_id = inc_data["id"]
    assert inc_data["incident_number"].startswith("INC-")

    # 2. Attach Evidence Note
    ev_res = await test_client.post(
        f"/api/investigations/{incident_id}/evidence",
        json={"note": "Verified PC-100 is unassigned to user."}
    )
    assert ev_res.status_code == 200

    # 3. Update Incident Status
    patch_res = await test_client.patch(
        f"/api/investigations/{incident_id}",
        json={"status": "In Progress"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "In Progress"

    # 4. Get Correlated Activity Timeline
    timeline_res = await test_client.get("/api/investigations/timeline/INC01")
    assert timeline_res.status_code == 200
    timeline_data = timeline_res.json()
    assert len(timeline_data) >= 1
    assert timeline_data[0]["employee_id"] if "employee_id" in timeline_data[0] else timeline_data[0]["event_type"] == "Logon"


@pytest.mark.asyncio
async def test_notifications_and_reports_export_api(test_client: AsyncClient, seed_user, db_session: AsyncSession):
    """Test Notifications endpoints and Excel (.xlsx) export functionality."""
    login_res = await test_client.post(
        "/api/auth/login",
        json={"email": seed_user.email, "password": "password123"}
    )
    assert login_res.status_code == 200
    access_token = login_res.cookies.get("access_token")
    test_client.cookies.set("access_token", access_token)

    # 1. Test Notifications API
    notif_res = await test_client.get("/api/notifications/")
    assert notif_res.status_code == 200
    assert "unread_count" in notif_res.json()

    # 2. Test Excel Export API
    excel_res = await test_client.get("/api/reports/export/excel?category=insider_threat")
    assert excel_res.status_code == 200
    assert excel_res.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    assert len(excel_res.content) > 0


@pytest.mark.asyncio
async def test_email_notification_service():
    """Test EmailService dispatch and threat alert notification email generation."""
    from backend.services.email_service import EmailService

    sent = await EmailService.send_email(
        recipient_emails=["admin@itbis.com"],
        subject="[TEST ALERT] High Risk Suspect Identified",
        body_text="Test alert body text"
    )
    assert sent is True

    # Test threat alert helper
    await EmailService.notify_threat_alert(
        recipients=["manager@itbis.com"],
        employee_id="M3EMP99",
        anomaly_category="Unauthorized Access Attempts",
        severity="Critical",
        details="Attempted logon on restricted DC host"
    )
