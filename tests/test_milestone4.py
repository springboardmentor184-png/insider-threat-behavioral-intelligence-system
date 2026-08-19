"""
Automated Pytest Suite for Milestone 4:
  - System Health & Telemetry API Verification
  - End-to-End Threat Pipeline Validation
  - Production Readiness Diagnostics
"""

import pytest
from httpx import AsyncClient
from backend.main import app
from backend.models.user import User
from backend.models.enums import UserRole
from backend.core.security import hash_password


@pytest.mark.asyncio
async def test_health_check_endpoint(test_client: AsyncClient):
    """Verify lightweight /api/health probe returns healthy status."""
    res = await test_client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "latency_ms" in data
    assert data["service"] == "ITBIS Insider Threat Engine"


@pytest.mark.asyncio
async def test_system_status_telemetry_protected(test_client: AsyncClient):
    """Verify /api/system/status requires authentication."""
    res = await test_client.get("/api/system/status")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_system_status_telemetry_authenticated(test_client: AsyncClient, db_session):
    """Verify authenticated admin can retrieve full telemetry & system diagnostics."""
    # Create test admin
    admin = User(
        email="m4_admin@itbis.com",
        username="m4_admin",
        hashed_password=hash_password("Admin123!"),
        full_name="Milestone4 Admin",
        role=UserRole.ADMINISTRATOR,
        is_active=True,
        approval_status="approved"
    )
    db_session.add(admin)
    await db_session.commit()

    # Login to obtain session cookie
    login_res = await test_client.post(
        "/api/auth/login",
        data={"username": "m4_admin@itbis.com", "password": "Admin123!"}
    )
    assert login_res.status_code == 200

    # Query telemetry endpoint
    res = await test_client.get("/api/system/status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "operational"
    assert "telemetry" in data
    assert "system_resources" in data
    assert "security_modules" in data
    assert data["security_modules"]["ueba_intelligence_engine"] == "active"
    assert data["security_modules"]["risk_scoring_5_factor"] == "active"


@pytest.mark.asyncio
async def test_milestone4_end_to_end_pipeline_integration(test_client: AsyncClient, db_session):
    """
    End-to-End Milestone 4 Integration Test:
    Verifies that all core components (Auth, Dashboard, Risk Scorer, UEBA, Investigations, Reports)
    work harmoniously in a complete operational workflow.
    """
    # 1. Login as Analyst
    analyst = User(
        email="m4_analyst@itbis.com",
        username="m4_analyst",
        hashed_password=hash_password("Analyst123!"),
        full_name="Milestone4 Analyst",
        role=UserRole.SECURITY_ANALYST,
        is_active=True,
        approval_status="approved"
    )
    db_session.add(analyst)
    await db_session.commit()

    login_res = await test_client.post(
        "/api/auth/login",
        data={"username": "m4_analyst@itbis.com", "password": "Analyst123!"}
    )
    assert login_res.status_code == 200

    # 2. Check Dashboard Stats API
    dash_res = await test_client.get("/api/dashboard/stats")
    assert dash_res.status_code == 200

    # 3. Check Risk Suspects Ranking API
    risk_res = await test_client.get("/api/risk/suspects")
    assert risk_res.status_code == 200

    # 4. Check UEBA Predictions API
    ueba_res = await test_client.get("/api/ueba/predictions")
    assert ueba_res.status_code == 200

    # 5. Check Investigations Incidents API
    inc_res = await test_client.get("/api/investigations/")
    assert inc_res.status_code == 200

    # 6. Check Reports Export Endpoint
    export_res = await test_client.get("/api/reports/export/excel/insider_threat")
    assert export_res.status_code == 200
    assert export_res.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
