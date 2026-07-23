from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.dependencies import get_db, require_roles
from app.models.employee import Employee
from app.services.reports_service import (
    get_employee_report,
    get_department_report,
    get_recent_anomalies,
    get_high_risk_report,
    export_report,
)
from app.schemas.reports import (
    EmployeeReportResponse,
    DepartmentReportResponse,
    PaginatedRecentAnomaliesResponse,
    HighRiskReportItem,
    ReportExportResponse,
)

router = APIRouter()


@router.get(
    "/employee/{employee_id}",
    response_model=EmployeeReportResponse,
    summary="Get comprehensive employee report",
)
def get_employee_report_route(employee_id: UUID, db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    report = get_employee_report(db, employee_id)
    if not report:
        raise HTTPException(status_code=404, detail="Employee not found")
    return report


@router.get(
    "/department/{department_id}",
    response_model=DepartmentReportResponse,
    summary="Get department risk report",
)
def get_department_report_route(department_id: UUID, db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    report = get_department_report(db, department_id)
    if not report:
        raise HTTPException(status_code=404, detail="Department not found")
    return report


@router.get(
    "/recent-anomalies",
    response_model=PaginatedRecentAnomaliesResponse,
    summary="Get recent anomalies",
)
def get_recent_anomalies_route(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"])),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    return get_recent_anomalies(db, page=page, limit=limit)


@router.get(
    "/high-risk",
    response_model=list[HighRiskReportItem],
    summary="Get high risk employees",
)
def get_high_risk_report_route(db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    return get_high_risk_report(db)


@router.get(
    "/export",
    response_model=ReportExportResponse,
    summary="Export consolidated reports",
)
def export_report_route(db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    return export_report(db)
