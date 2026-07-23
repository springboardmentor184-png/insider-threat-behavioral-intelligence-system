"""
Dashboard data integration and query API tests.
"""

import pytest
from httpx import AsyncClient
from backend.models.dataset import Employee, LogonEvent, BehavioralAnomaly
from datetime import datetime, timezone


@pytest.mark.asyncio
async def test_dashboard_route_protection(test_client: AsyncClient):
    """Test dashboard stats endpoint is protected (returns 401)."""
    response = await test_client.get("/api/dashboard/stats")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_dashboard_stats_and_charts(test_client: AsyncClient, seed_user, db_session):
    """Test retrieving dynamic KPI metrics and charts with proper cookie auth."""
    # Seed sample employees, logs, and an anomaly
    emp = Employee(
        employee_id="TES0001",
        full_name="Test Employee",
        email="employee@test.com",
        role="Programmer",
        department="Development",
        designation="Programmer",
        risk_score=45
    )
    log = LogonEvent(
        event_id="{TEST-EVENT}",
        timestamp=datetime.now(timezone.utc),
        employee_id="TES0001",
        pc="PC-9999",
        activity="Logon"
    )
    anomaly = BehavioralAnomaly(
        employee_id="TES0001",
        category="Logon Hours",
        severity="High",
        timestamp=datetime.now(timezone.utc),
        description="Midnight logon event detected",
        status="Open",
        pc="PC-9999"
    )
    db_session.add(emp)
    db_session.add(log)
    db_session.add(anomaly)
    await db_session.commit()

    # Login to get cookies
    login_res = await test_client.post(
        "/api/auth/login",
        json={"email": seed_user.email, "password": "password123"}
    )
    assert login_res.status_code == 200
    access_token = login_res.cookies.get("access_token")

    # Set access token cookie
    test_client.cookies.set("access_token", access_token)

    # 1. Test /stats
    stats_res = await test_client.get("/api/dashboard/stats")
    assert stats_res.status_code == 200
    data = stats_res.json()
    assert data["total_employees"] == 1
    assert data["total_logs"] == 1
    assert "high_risk_employees" in data

    # 2. Test /charts
    charts_res = await test_client.get("/api/dashboard/charts")
    assert charts_res.status_code == 200
    charts_data = charts_res.json()
    assert "categories" in charts_data
    assert "risk_users" in charts_data
    assert len(charts_data["risk_users"]) == 1
    assert charts_data["risk_users"][0]["employee_id"] == "TES0001"


@pytest.mark.asyncio
async def test_logs_pagination_and_filtering(test_client: AsyncClient, seed_user, db_session):
    """Test that combined logs supports search, filtering, and page navigation."""
    # Seed two logs
    emp = Employee(
        employee_id="TES0001",
        full_name="Test Employee",
        email="employee@test.com",
        role="Programmer",
        department="Development",
        designation="Programmer",
        risk_score=45
    )
    log1 = LogonEvent(
        event_id="{TEST-EVENT-1}",
        timestamp=datetime.now(timezone.utc),
        employee_id="TES0001",
        pc="PC-1000",
        activity="Logon"
    )
    log2 = LogonEvent(
        event_id="{TEST-EVENT-2}",
        timestamp=datetime.now(timezone.utc),
        employee_id="TES0001",
        pc="PC-2000",
        activity="Logoff"
    )
    db_session.add(emp)
    db_session.add(log1)
    db_session.add(log2)
    await db_session.commit()

    # Login to get cookies
    login_res = await test_client.post(
        "/api/auth/login",
        json={"email": seed_user.email, "password": "password123"}
    )
    access_token = login_res.cookies.get("access_token")
    test_client.cookies.set("access_token", access_token)

    # Fetch all logs
    res = await test_client.get("/api/dashboard/logs?limit=25")
    assert res.status_code == 200
    res_data = res.json()
    assert len(res_data["data"]) == 2

    # Filter by search
    res_search = await test_client.get("/api/dashboard/logs?search=PC-1000")
    assert res_search.status_code == 200
    assert len(res_search.json()["data"]) == 1
    assert res_search.json()["data"][0]["pc"] == "PC-1000"

    # Paginate (offset out of bounds)
    res_page = await test_client.get("/api/dashboard/logs?page=2&limit=2")
    assert res_page.status_code == 200
    assert len(res_page.json()["data"]) == 0
