from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from app.models.employee import Employee
from app.models.activity import ActivityLog, ActivityType
from app.models.risk import RiskAssessment
from app.models.department import Department
from app.schemas.dashboard import DashboardOverview, RiskSummaryResponse, ActivitySummaryResponse, ChartDataResponse

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
