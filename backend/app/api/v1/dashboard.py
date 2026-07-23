from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.core.dependencies import get_db, require_roles
from app.schemas.dashboard import DashboardOverview, RiskOverviewResponse, RiskSummaryResponse, TopRiskEmployeeResponse, EmployeeRiskResponse, EmployeeExplanationResponse, CompanyRiskResponse, DepartmentRiskResponse, RiskTrendResponse, RecentAlertResponse, ActivitySummaryResponse, ChartDataResponse
from app.schemas.activity import ActivityResponse
from app.services import dashboard_service, activity_service
from app.models.employee import Employee

router = APIRouter()

@router.get("/overview", response_model=DashboardOverview, summary="Get Dashboard Overview")
def get_overview(db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    """Returns high-level platform statistics"""
    return dashboard_service.get_overview(db)

@router.get("/risk-overview", response_model=RiskOverviewResponse, summary="Get Risk Overview")
def get_risk_overview(db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    """Returns risk assessment overview statistics"""
    return dashboard_service.get_risk_overview(db)

@router.get("/employee-risk/{employee_id}", response_model=EmployeeRiskResponse, summary="Get Employee Risk")
def get_employee_risk(employee_id: UUID, db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    """Returns risk assessment details for a specific employee"""
    return dashboard_service.get_employee_risk(db, employee_id)

@router.get("/employee-explanation/{employee_id}", response_model=EmployeeExplanationResponse, summary="Get Employee Explanation")
def get_employee_explanation(employee_id: UUID, db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    """Returns AI explanation for a specific employee"""
    return dashboard_service.get_employee_explanation(db, employee_id)

@router.get("/company-risk", response_model=CompanyRiskResponse, summary="Get Company Risk")
def get_company_risk(db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    """Returns aggregated company risk metrics"""
    return dashboard_service.get_company_risk(db)

@router.get("/department-risk", response_model=List[DepartmentRiskResponse], summary="Get Department Risk")
def get_department_risk(db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    """Returns risk metrics aggregated by department"""
    return dashboard_service.get_department_risk(db)

@router.get("/risk-trend", response_model=List[RiskTrendResponse], summary="Get Risk Trend")
def get_risk_trend(db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    """Returns average daily risk score trend"""
    return dashboard_service.get_risk_trend(db)

@router.get("/recent-alerts", response_model=List[RecentAlertResponse], summary="Get Recent Alerts")
def get_recent_alerts(db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    """Returns the latest alerts for high/critical risk or anomalies"""
    return dashboard_service.get_recent_alerts(db)

@router.get("/top-risk-employees", response_model=List[TopRiskEmployeeResponse], summary="Get Top Risk Employees")
def get_top_risk_employees(db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    """Returns top 5 employees by risk score"""
    return dashboard_service.get_top_risk_employees(db)

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
