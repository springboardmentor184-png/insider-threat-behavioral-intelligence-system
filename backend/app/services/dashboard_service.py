from sqlalchemy.orm import Session

from app.models.user import User
from app.models.employee import Employee
from app.models.audit_log import AuditLog


def get_dashboard_stats(db: Session):

    total_users = db.query(User).count()

    verified_users = db.query(User).filter(
        User.is_verified == True
    ).count()

    unverified_users = db.query(User).filter(
        User.is_verified == False
    ).count()

    total_employees = db.query(Employee).count()

    active_employees = db.query(Employee).filter(
        Employee.is_active == True
    ).count()

    inactive_employees = db.query(Employee).filter(
        Employee.is_active == False
    ).count()

    total_audit_logs = db.query(AuditLog).count()

    return {
        "total_users": total_users,
        "verified_users": verified_users,
        "unverified_users": unverified_users,
        "total_employees": total_employees,
        "active_employees": active_employees,
        "inactive_employees": inactive_employees,
        "total_audit_logs": total_audit_logs
    }