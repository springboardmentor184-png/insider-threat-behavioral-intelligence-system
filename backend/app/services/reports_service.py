import math
from datetime import datetime, timezone, timedelta
from typing import Optional
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.activity import ActivityLog, ActivityType, Severity
from app.models.department import Department
from app.models.employee import Employee
from app.models.risk import RiskAssessment


def _coerce_uuid(value: str | UUID) -> UUID:
    return value if isinstance(value, UUID) else UUID(str(value))


def get_employee_report(db: Session, employee_id: str | UUID):
    employee_id = _coerce_uuid(employee_id)

    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .options()
        .first()
    )

    if not employee:
        return None

    latest_risk = (
        db.query(RiskAssessment)
        .filter(RiskAssessment.employee_id == employee_id)
        .order_by(RiskAssessment.last_analyzed.desc())
        .first()
    )

    activities_count = (
        db.query(func.count(ActivityLog.id))
        .filter(ActivityLog.employee_id == employee_id)
        .scalar() or 0
    )

    login_anomalies_count = (
        db.query(func.count(ActivityLog.id))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type == ActivityType.FAILED_LOGIN,
        )
        .scalar() or 0
    )

    file_access_anomalies_count = (
        db.query(func.count(ActivityLog.id))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type == ActivityType.FILE_ACCESS,
            ActivityLog.severity.in_([Severity.HIGH, Severity.CRITICAL]),
        )
        .scalar() or 0
    )

    device_anomalies_count = (
        db.query(func.count(ActivityLog.id))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type.in_(
                [
                    ActivityType.USB_CONNECTED,
                    ActivityType.USB_REMOVED,
                    ActivityType.EXTERNAL_DEVICE_CONNECTED,
                ]
            ),
            ActivityLog.severity.in_([Severity.HIGH, Severity.CRITICAL]),
        )
        .scalar() or 0
    )

    privilege_abuse_anomalies_count = (
        db.query(func.count(ActivityLog.id))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type.in_(
                [
                    ActivityType.PRIVILEGE_ESCALATION,
                    ActivityType.SECURITY_ALERT,
                    ActivityType.POLICY_VIOLATION,
                ]
            ),
        )
        .scalar() or 0
    )

    data_exfiltration_anomalies_count = (
        db.query(func.count(ActivityLog.id))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type.in_(
                [
                    ActivityType.FILE_DOWNLOAD,
                    ActivityType.CLOUD_UPLOAD,
                    ActivityType.CLOUD_DOWNLOAD,
                    ActivityType.DATA_TRANSFER,
                    ActivityType.EMAIL_ACTIVITY,
                ]
            ),
            ActivityLog.severity.in_([Severity.MEDIUM, Severity.HIGH, Severity.CRITICAL]),
        )
        .scalar() or 0
    )

    return {
        "employee": {
            "employee_id": employee.id,
            "employee_name": f"{employee.first_name} {employee.last_name}",
            "email": employee.email,
            "department_name": employee.department.department_name if employee.department else None,
            "job_title": employee.job_title,
        },
        "risk_score": latest_risk.risk_score if latest_risk else 0.0,
        "risk_level": latest_risk.risk_level if latest_risk else "Low",
        "threat_level": latest_risk.risk_level if latest_risk else "Low",
        "explanation": latest_risk.risk_reason if latest_risk else None,
        "activities_count": activities_count,
        "login_anomalies_count": login_anomalies_count,
        "file_access_anomalies_count": file_access_anomalies_count,
        "device_anomalies_count": device_anomalies_count,
        "privilege_abuse_anomalies_count": privilege_abuse_anomalies_count,
        "data_exfiltration_anomalies_count": data_exfiltration_anomalies_count,
        "recommendation": latest_risk.recommendation if latest_risk else None,
        "last_analyzed": latest_risk.last_analyzed if latest_risk else None,
    }


def get_department_report(db: Session, department_id: str | UUID):
    department_id = _coerce_uuid(department_id)

    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        return None

    employees = db.query(Employee).filter(Employee.department_id == department_id).all()
    total_employees = len(employees)

    risk_scores = [
        r.risk_score for e in employees for r in e.risk_assessments if r.last_analyzed is not None
    ]

    high_risk_count = sum(1 for e in employees for r in e.risk_assessments if r.risk_level == "High")
    medium_risk_count = sum(1 for e in employees for r in e.risk_assessments if r.risk_level == "Medium")
    low_risk_count = sum(1 for e in employees for r in e.risk_assessments if r.risk_level == "Low")

    average_risk_score = round(sum(risk_scores) / len(risk_scores), 2) if risk_scores else 0.0

    if high_risk_count > 0:
        department_risk_level = "High"
    elif medium_risk_count > 0:
        department_risk_level = "Medium"
    else:
        department_risk_level = "Low"

    recent_threat_count = (
        db.query(func.count(RiskAssessment.id))
        .join(Employee, Employee.id == RiskAssessment.employee_id)
        .filter(
            Employee.department_id == department_id,
            RiskAssessment.last_analyzed >= datetime.now(timezone.utc) - timedelta(days=30),
        )
        .scalar() or 0
    )

    return {
        "department_name": department.department_name,
        "total_employees": total_employees,
        "average_risk_score": average_risk_score,
        "high_risk_employees": high_risk_count,
        "medium_risk_employees": medium_risk_count,
        "low_risk_employees": low_risk_count,
        "department_risk_level": department_risk_level,
        "recent_threat_count": recent_threat_count,
    }


def get_recent_anomalies(db: Session, page: int = 1, limit: int = 20):
    query = db.query(ActivityLog).filter(ActivityLog.severity.in_([Severity.MEDIUM, Severity.HIGH, Severity.CRITICAL]))

    total = query.count()
    total_pages = math.ceil(total / limit) if limit > 0 else 1

    items = (
        query.order_by(ActivityLog.timestamp.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    anomalies = []
    for item in items:
        anomalies.append({
            "employee_id": item.employee_id,
            "employee_name": f"{item.employee.first_name} {item.employee.last_name}" if item.employee else "Unknown",
            "anomaly_type": item.activity_type.value,
            "severity": item.severity.value,
            "description": item.description or "",
            "timestamp": item.timestamp,
        })

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "items": anomalies,
    }


def get_high_risk_report(db: Session):
    assessments = (
        db.query(RiskAssessment)
        .filter(RiskAssessment.risk_level.in_(["High", "Critical"]))
        .order_by(RiskAssessment.last_analyzed.desc())
        .all()
    )

    results = []
    for assessment in assessments:
        employee = assessment.employee
        results.append({
            "employee_id": assessment.employee_id,
            "employee_name": f"{employee.first_name} {employee.last_name}" if employee else "Unknown",
            "department": employee.department.department_name if employee and employee.department else None,
            "risk_score": assessment.risk_score,
            "risk_level": assessment.risk_level,
            "threat_score": assessment.risk_score,
            "recommendation": assessment.recommendation,
            "last_analyzed": assessment.last_analyzed,
        })

    return results


def export_report(db: Session):
    total_employees = db.query(Employee).count()
    assessed_employees = db.query(RiskAssessment.employee_id.distinct()).count()
    average_risk_score = db.query(func.avg(RiskAssessment.risk_score)).scalar() or 0.0
    low_risk_count = db.query(RiskAssessment).filter(RiskAssessment.risk_level == "Low").count()
    medium_risk_count = db.query(RiskAssessment).filter(RiskAssessment.risk_level == "Medium").count()
    high_risk_count = db.query(RiskAssessment).filter(RiskAssessment.risk_level == "High").count()
    critical_risk_count = db.query(RiskAssessment).filter(RiskAssessment.risk_level == "Critical").count()

    high_risk_employees = get_high_risk_report(db)
    recent_anomalies = get_recent_anomalies(db, page=1, limit=20)["items"]

    department_summary = []
    departments = db.query(Department).all()
    for department in departments:
        department_summary.append(get_department_report(db, department.id))

    return {
        "company_summary": {
            "total_employees": total_employees,
            "assessed_employees": assessed_employees,
            "average_risk_score": round(average_risk_score, 2),
            "low_risk_count": low_risk_count,
            "medium_risk_count": medium_risk_count,
            "high_risk_count": high_risk_count,
            "critical_risk_count": critical_risk_count,
        },
        "high_risk_employees": high_risk_employees,
        "recent_threats": high_risk_employees,
        "recent_anomalies": recent_anomalies,
        "department_summary": department_summary,
    }
