from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, case
from datetime import date, datetime, timezone, timedelta
from typing import Dict, Any, List
from app.models.employee import Employee
from app.models.activity import ActivityLog, ActivityType
from app.models.risk import RiskAssessment
from app.models.department import Department
from app.schemas.dashboard import DashboardOverview, RiskOverviewResponse, RiskSummaryResponse, TopRiskEmployeeResponse, EmployeeRiskResponse, EmployeeExplanationResponse, CompanyRiskResponse, DepartmentRiskResponse, RiskTrendResponse, RecentAlertResponse, ActivitySummaryResponse, ChartDataResponse
from app.services.explanation_service import get_employee_explanation as fetch_employee_explanation

def get_overview(db: Session) -> DashboardOverview:
    employees = db.query(Employee).count()
    activities = db.query(ActivityLog).count()
    
    # Average Risk Score
    avg_risk = db.query(func.avg(RiskAssessment.risk_score)).scalar() or 0.0
    
    departments = db.query(Department).count()
    
    return DashboardOverview(
        employees=employees,
        activities=activities,
        risk=round(avg_risk, 2),
        departments=departments
    )

def get_risk_overview(db: Session) -> RiskOverviewResponse:
    total_assessments = db.query(RiskAssessment).count()
    avg_risk = db.query(func.avg(RiskAssessment.risk_score)).scalar() or 0.0
    low = db.query(RiskAssessment).filter(RiskAssessment.risk_level == "Low").count()
    medium = db.query(RiskAssessment).filter(RiskAssessment.risk_level == "Medium").count()
    high = db.query(RiskAssessment).filter(RiskAssessment.risk_level == "High").count()
    critical = db.query(RiskAssessment).filter(RiskAssessment.risk_level == "Critical").count()

    return RiskOverviewResponse(
        total_assessments=total_assessments,
        average_risk_score=round(avg_risk, 2),
        low=low,
        medium=medium,
        high=high,
        critical=critical
    )

def get_top_risk_employees(db: Session) -> List[TopRiskEmployeeResponse]:
    top_risk_rows = (
        db.query(RiskAssessment, Employee)
        .join(Employee, RiskAssessment.employee_id == Employee.id)
        .order_by(desc(RiskAssessment.risk_score))
        .limit(5)
        .all()
    )

    return [
        TopRiskEmployeeResponse(
            employee_id=str(risk.employee_id),
            full_name=f"{employee.first_name} {employee.last_name}",
            risk_score=round(risk.risk_score, 2),
            risk_level=risk.risk_level,
        )
        for risk, employee in top_risk_rows
    ]

def get_employee_explanation(db: Session, employee_id: UUID) -> EmployeeExplanationResponse:
    record = (
        db.query(RiskAssessment, Employee)
        .join(Employee, RiskAssessment.employee_id == Employee.id)
        .filter(RiskAssessment.employee_id == employee_id)
        .first()
    )
    if not record:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Explanation not found for employee")

    risk, employee = record
    explanation_text = fetch_employee_explanation(db, employee_id)

    return EmployeeExplanationResponse(
        employee_id=str(risk.employee_id),
        employee_name=f"{employee.first_name} {employee.last_name}",
        risk_level=risk.risk_level,
        risk_score=round(risk.risk_score, 2),
        explanation=explanation_text,
        recommendation=risk.recommendation,
    )

def get_company_risk(db: Session) -> CompanyRiskResponse:
    total_employees = db.query(Employee).count()
    assessed_employees = db.query(func.count(RiskAssessment.employee_id.distinct())).scalar() or 0
    average_risk_score = db.query(func.avg(RiskAssessment.risk_score)).scalar() or 0.0
    high_risk_count = db.query(RiskAssessment).filter(RiskAssessment.risk_level == "High").count()
    critical_risk_count = db.query(RiskAssessment).filter(RiskAssessment.risk_level == "Critical").count()
    anomaly_count = db.query(RiskAssessment).filter(RiskAssessment.anomaly_detected == True).count()

    return CompanyRiskResponse(
        total_employees=total_employees,
        assessed_employees=assessed_employees,
        average_risk_score=round(average_risk_score, 2),
        high_risk_count=high_risk_count,
        critical_risk_count=critical_risk_count,
        anomaly_count=anomaly_count,
    )

def get_department_risk(db: Session) -> List[DepartmentRiskResponse]:
    dept_rows = (
        db.query(
            Department.department_name,
            func.count(Employee.id).label("employee_count"),
            func.coalesce(func.avg(RiskAssessment.risk_score), 0.0).label("average_risk_score"),
            func.count(case((RiskAssessment.risk_level == "High", 1))).label("high_risk_count"),
            func.count(case((RiskAssessment.risk_level == "Critical", 1))).label("critical_risk_count"),
        )
        .outerjoin(Employee, Employee.department_id == Department.id)
        .outerjoin(RiskAssessment, RiskAssessment.employee_id == Employee.id)
        .group_by(Department.department_name)
        .all()
    )

    return [
        DepartmentRiskResponse(
            department_name=row.department_name,
            employee_count=row.employee_count,
            average_risk_score=round(row.average_risk_score or 0.0, 2),
            high_risk_count=row.high_risk_count,
            critical_risk_count=row.critical_risk_count,
        )
        for row in dept_rows
    ]

def get_risk_trend(db: Session) -> List[RiskTrendResponse]:
    trend_rows = (
        db.query(
            func.date(RiskAssessment.last_analyzed).label("date"),
            func.avg(RiskAssessment.risk_score).label("average_risk_score"),
        )
        .filter(RiskAssessment.last_analyzed != None)
        .group_by(func.date(RiskAssessment.last_analyzed))
        .order_by(func.date(RiskAssessment.last_analyzed))
        .all()
    )

    return [
        RiskTrendResponse(
            date=row.date,
            average_risk_score=round(row.average_risk_score or 0.0, 2),
        )
        for row in trend_rows
    ]

def get_recent_alerts(db: Session) -> List[RecentAlertResponse]:
    alert_rows = (
        db.query(RiskAssessment, Employee)
        .join(Employee, RiskAssessment.employee_id == Employee.id)
        .filter(
            (RiskAssessment.risk_level.in_(["High", "Critical"])) |
            (RiskAssessment.anomaly_detected == True)
        )
        .order_by(desc(RiskAssessment.last_analyzed))
        .limit(10)
        .all()
    )

    return [
        RecentAlertResponse(
            employee_id=str(risk.employee_id),
            employee_name=f"{employee.first_name} {employee.last_name}",
            risk_level=risk.risk_level,
            risk_score=round(risk.risk_score, 2),
            anomaly_detected=risk.anomaly_detected,
            risk_reason=risk.risk_reason,
            last_analyzed=risk.last_analyzed,
        )
        for risk, employee in alert_rows
    ]

def get_employee_risk(db: Session, employee_id: UUID) -> EmployeeRiskResponse:
    record = (
        db.query(RiskAssessment, Employee)
        .join(Employee, RiskAssessment.employee_id == Employee.id)
        .filter(RiskAssessment.employee_id == employee_id)
        .first()
    )
    if not record:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk assessment not found for employee")

    risk, employee = record
    return EmployeeRiskResponse(
        employee_id=str(risk.employee_id),
        employee_name=f"{employee.first_name} {employee.last_name}",
        risk_score=round(risk.risk_score, 2),
        risk_level=risk.risk_level,
        anomaly_detected=risk.anomaly_detected,
        risk_reason=risk.risk_reason,
        confidence_score=risk.confidence_score,
        recommendation=risk.recommendation,
        last_analyzed=risk.last_analyzed,
    )

def get_risk_summary(db: Session) -> RiskSummaryResponse:
    # Counts
    low = db.query(RiskAssessment).filter(RiskAssessment.risk_level == "Low").count()
    medium = db.query(RiskAssessment).filter(RiskAssessment.risk_level == "Medium").count()
    high = db.query(RiskAssessment).filter(RiskAssessment.risk_level == "High").count()
    critical = db.query(RiskAssessment).filter(RiskAssessment.risk_level == "Critical").count()
    
    avg_risk = db.query(func.avg(RiskAssessment.risk_score)).scalar() or 0.0
    
    highest_risk = db.query(RiskAssessment).order_by(desc(RiskAssessment.risk_score)).first()
    highest_risk_employee = None
    if highest_risk and highest_risk.employee:
        highest_risk_employee = {
            "employee_id": str(highest_risk.employee.id),
            "name": f"{highest_risk.employee.first_name} {highest_risk.employee.last_name}",
            "score": highest_risk.risk_score
        }
        
    return RiskSummaryResponse(
        low=low,
        medium=medium,
        high=high,
        critical=critical,
        average_risk_score=round(avg_risk, 2),
        highest_risk_employee=highest_risk_employee
    )

def get_activity_summary(db: Session) -> ActivitySummaryResponse:
    now = datetime.now(timezone.utc)
    today = now.date()
    
    today_activity = db.query(ActivityLog).filter(func.date(ActivityLog.timestamp) == today).count()
    last_7_days = db.query(ActivityLog).filter(ActivityLog.timestamp >= (now - timedelta(days=7))).count()
    last_30_days = db.query(ActivityLog).filter(ActivityLog.timestamp >= (now - timedelta(days=30))).count()
    
    most_common = db.query(ActivityLog.activity_type, func.count(ActivityLog.id)).group_by(ActivityLog.activity_type).order_by(desc(func.count(ActivityLog.id))).first()
    most_common_activity = most_common[0].value if most_common else None
    
    # Peak login hour (extract hour)
    logins = db.query(func.extract('hour', ActivityLog.timestamp).label('h'), func.count(ActivityLog.id)).filter(ActivityLog.activity_type == ActivityType.LOGIN).group_by('h').order_by(desc(func.count(ActivityLog.id))).first()
    peak_login_hour = f"{int(logins[0]):02d}:00" if logins else None
    
    return ActivitySummaryResponse(
        today_activity=today_activity,
        last_7_days=last_7_days,
        last_30_days=last_30_days,
        most_common_activity=most_common_activity,
        peak_login_hour=peak_login_hour
    )

def get_charts(db: Session) -> ChartDataResponse:
    now = datetime.now(timezone.utc)
    
    # Weekly Activity Data (Last 7 days)
    weekly_activity = []
    for i in range(6, -1, -1):
        target_date = (now - timedelta(days=i)).date()
        count = db.query(ActivityLog).filter(func.date(ActivityLog.timestamp) == target_date).count()
        weekly_activity.append({
            "name": target_date.strftime("%a"),
            "Activities": count
        })
        
    # Department Distribution
    dept_dist = db.query(Department.department_name, func.count(Employee.id)).outerjoin(Employee).group_by(Department.department_name).all()
    department_distribution = [{"name": dept, "value": count} for dept, count in dept_dist]
    
    # Risk Distribution
    risk_dist = db.query(RiskAssessment.risk_level, func.count(RiskAssessment.id)).group_by(RiskAssessment.risk_level).all()
    risk_distribution = [{"name": level.value, "value": count} for level, count in risk_dist]
    
    # Dummy login trend and monthly activity for now to fulfill structure
    monthly_activity = [{"name": f"Week {i}", "Activities": 0} for i in range(1, 5)]
    login_trend = [{"time": f"{i:02d}:00", "logins": 0} for i in range(0, 24, 4)]
    
    return ChartDataResponse(
        weekly_activity=weekly_activity,
        monthly_activity=monthly_activity,
        risk_distribution=risk_distribution,
        department_distribution=department_distribution,
        login_trend=login_trend
    )
