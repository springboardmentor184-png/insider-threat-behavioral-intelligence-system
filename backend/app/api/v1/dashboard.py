from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db, require_roles
from app.schemas.dashboard import DashboardOverview, RiskSummaryResponse, ActivitySummaryResponse, ChartDataResponse
from app.schemas.activity import ActivityResponse
from app.services import dashboard_service, activity_service
from app.models.employee import Employee

router = APIRouter()

@router.get("/overview", response_model=DashboardOverview, summary="Get Dashboard Overview")
def get_overview(db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    """Returns high-level platform statistics"""
    return dashboard_service.get_overview(db)

@router.get("/risk-summary", response_model=RiskSummaryResponse, summary="Get Risk Summary")
def get_risk_summary(db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    """Returns aggregation of current risk assessments"""
    return dashboard_service.get_risk_summary(db)

@router.get("/activity-summary", response_model=ActivitySummaryResponse, summary="Get Activity Summary")
def get_activity_summary(db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    """Returns activity metrics over time"""
    return dashboard_service.get_activity_summary(db)

@router.get("/recent-activities", response_model=List[ActivityResponse], summary="Get Recent Dashboard Activities")
def get_recent_activities(db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    """Returns latest activities for the dashboard live feed"""
    return activity_service.get_recent_activities(db)

@router.get("/charts", response_model=ChartDataResponse, summary="Get Dashboard Chart Data")
def get_charts(db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    """Returns pre-formatted chart data for Recharts"""
    return dashboard_service.get_charts(db)
