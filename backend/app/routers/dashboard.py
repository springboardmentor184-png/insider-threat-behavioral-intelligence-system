from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func as sqlfunc

from app.database import get_db
from ..dependencies import get_current_user, require_role
from ..models import (
    User,
    UserProfile,
    Incident,
    Alert,
    ActivityLog,
    RiskScoreHistory,
    Notification,
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


ANALYST_ROLES = (
    "Administrator",
    "Security Manager",
    "SOC Engineer",
    "Security Analyst"
)


# ======================================================
# SECURITY ANALYST DASHBOARD
# ======================================================

@router.get("/analyst-summary")
def analyst_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(*ANALYST_ROLES)
    ),
):
    total_employees = (
        db.query(UserProfile).count()
    )

    risk_counts = {
        "Low": (
            db.query(UserProfile)
            .filter(UserProfile.risk_score < 25)
            .count()
        ),
        "Medium": (
            db.query(UserProfile)
            .filter(
                UserProfile.risk_score >= 25,
                UserProfile.risk_score < 50
            )
            .count()
        ),
        "High": (
            db.query(UserProfile)
            .filter(
                UserProfile.risk_score >= 50,
                UserProfile.risk_score < 75
            )
            .count()
        ),
        "Critical": (
            db.query(UserProfile)
            .filter(UserProfile.risk_score >= 75)
            .count()
        ),
    }

    open_incidents = (
        db.query(Incident)
        .filter(Incident.status == "Open")
        .count()
    )

    total_incidents = (
        db.query(Incident).count()
    )

    recent_incidents = (
        db.query(Incident)
        .order_by(Incident.created_at.desc())
        .limit(10)
        .all()
    )

    total_alerts = (
        db.query(Alert).count()
    )

    top_risk_employees = (
        db.query(UserProfile)
        .order_by(UserProfile.risk_score.desc())
        .limit(10)
        .all()
    )

    return {
        "total_employees_monitored": total_employees,
        "risk_distribution": risk_counts,
        "investigation_queue": {
            "open_incidents": open_incidents,
            "total_incidents": total_incidents,
        },
        "total_alerts": total_alerts,
        "recent_incidents": [
            {
                "id": incident.id,
                "employee_id": incident.employee_id,
                "risk_category": incident.risk_category,
                "status": incident.status,
                "created_at": incident.created_at,
            }
            for incident in recent_incidents
        ],
        "top_risk_employees": [
            {
                "employee_id": employee.employee_id,
                "department": employee.department,
                "risk_score": employee.risk_score,
            }
            for employee in top_risk_employees
        ],
    }


# ======================================================
# SOC DASHBOARD
# ======================================================

@router.get("/soc-summary")
def soc_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(*ANALYST_ROLES)
    ),
):
    total_events = (
        db.query(ActivityLog).count()
    )

    recent_events = (
        db.query(ActivityLog)
        .order_by(ActivityLog.timestamp.desc())
        .limit(20)
        .all()
    )

    anomalous_employees = (
        db.query(UserProfile)
        .filter(UserProfile.risk_score >= 50)
        .count()
    )

    active_investigations = (
        db.query(Incident)
        .filter(
            Incident.status.in_(
                ["Open", "Investigating"]
            )
        )
        .count()
    )

    active_investigation_list = (
        db.query(Incident)
        .filter(
            Incident.status.in_(
                ["Open", "Investigating"]
            )
        )
        .order_by(Incident.created_at.desc())
        .limit(10)
        .all()
    )

    return {
        "total_security_events": total_events,
        "recent_events": [
            {
                "employee": event.employee,
                "activity": event.activity,
                "device": event.device,
                "timestamp": event.timestamp,
            }
            for event in recent_events
        ],
        "behavioral_anomalies_flagged": anomalous_employees,
        "active_investigations": {
            "count": active_investigations,
            "items": [
                {
                    "id": incident.id,
                    "employee_id": incident.employee_id,
                    "risk_category": incident.risk_category,
                    "status": incident.status,
                    "created_at": incident.created_at,
                }
                for incident in active_investigation_list
            ],
        },
    }


# ======================================================
# SECURITY MANAGER DASHBOARD
# ======================================================

@router.get("/manager-summary")
def manager_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(
            "Administrator",
            "Security Manager"
        )
    ),
):
    total_employees = (
        db.query(UserProfile).count()
    )

    avg_org_risk = (
        db.query(
            sqlfunc.avg(UserProfile.risk_score)
        ).scalar()
        or 0
    )

    risk_distribution = {
        "Low": (
            db.query(UserProfile)
            .filter(UserProfile.risk_score < 25)
            .count()
        ),
        "Medium": (
            db.query(UserProfile)
            .filter(
                UserProfile.risk_score >= 25,
                UserProfile.risk_score < 50
            )
            .count()
        ),
        "High": (
            db.query(UserProfile)
            .filter(
                UserProfile.risk_score >= 50,
                UserProfile.risk_score < 75
            )
            .count()
        ),
        "Critical": (
            db.query(UserProfile)
            .filter(UserProfile.risk_score >= 75)
            .count()
        ),
    }

    department_risk = (
        db.query(
            UserProfile.department,
            sqlfunc.avg(
                UserProfile.risk_score
            ).label("avg_risk"),
            sqlfunc.count(
                UserProfile.id
            ).label("employee_count"),
        )
        .group_by(UserProfile.department)
        .all()
    )

    total_incidents = (
        db.query(Incident).count()
    )

    open_incidents = (
        db.query(Incident)
        .filter(
            Incident.status.in_(
                ["Open", "Investigating"]
            )
        )
        .count()
    )

    resolved_incidents = (
        db.query(Incident)
        .filter(
            Incident.status == "Closed"
        )
        .count()
    )

    return {
        "total_employees": total_employees,
        "organizational_avg_risk_score": round(
            avg_org_risk,
            2
        ),
        "risk_distribution": risk_distribution,
        "department_risk_breakdown": [
            {
                "department": department.department,
                "avg_risk_score": (
                    round(
                        department.avg_risk,
                        2
                    )
                    if department.avg_risk is not None
                    else 0
                ),
                "employee_count": department.employee_count,
            }
            for department in department_risk
        ],
        "compliance_metrics": {
            "total_incidents": total_incidents,
            "open_incidents": open_incidents,
            "resolved_incidents": resolved_incidents,
            "resolution_rate_percent": (
                round(
                    (
                        resolved_incidents
                        / total_incidents
                        * 100
                    ),
                    2
                )
                if total_incidents > 0
                else 0
            ),
        },
    }


# ======================================================
# ADMIN DASHBOARD
# ======================================================

@router.get("/admin-summary")
def admin_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("Administrator")
    ),
):
    total_users = (
        db.query(User).count()
    )

    active_users = (
        db.query(User)
        .filter(User.is_active == True)
        .count()
    )

    role_breakdown = (
        db.query(
            User.role,
            sqlfunc.count(User.id).label("count")
        )
        .group_by(User.role)
        .all()
    )

    total_profiles = (
        db.query(UserProfile).count()
    )

    total_activity_logs = (
        db.query(ActivityLog).count()
    )

    total_alerts = (
        db.query(Alert).count()
    )

    total_incidents = (
        db.query(Incident).count()
    )

    total_risk_history_records = (
        db.query(RiskScoreHistory).count()
    )

    recent_alerts = (
        db.query(Alert)
        .order_by(Alert.created_at.desc())
        .limit(5)
        .all()
    )

    recent_incidents = (
        db.query(Incident)
        .order_by(Incident.created_at.desc())
        .limit(5)
        .all()
    )

    recent_notifications = (
        db.query(Notification)
        .order_by(Notification.created_at.desc())
        .limit(5)
        .all()
    )

    high_risk_employees = (
        db.query(UserProfile)
        .order_by(UserProfile.risk_score.desc())
        .limit(5)
        .all()
    )

    return {
        "user_management": {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": (
                total_users - active_users
            ),
            "role_breakdown": [
                {
                    "role": role.role,
                    "count": role.count
                }
                for role in role_breakdown
            ],
        },

        "platform_analytics": {
            "total_employee_profiles": total_profiles,
            "total_activity_logs_ingested": (
                total_activity_logs
            ),
            "total_alerts_generated": total_alerts,
            "total_incidents_generated": (
                total_incidents
            ),
            "total_risk_score_recalculations": (
                total_risk_history_records
            ),
        },

        "system_monitoring": {
            "database_status": "connected",
            "api_status": "operational",
        },

        "recent_alerts": [
            {
                "id": alert.id,
                "employee": alert.employee,
                "severity": alert.severity,
                "status": alert.status,
            }
            for alert in recent_alerts
        ],

        "recent_incidents": [
            {
                "id": incident.id,
                "employee_id": incident.employee_id,
                "risk_category": incident.risk_category,
                "status": incident.status,
            }
            for incident in recent_incidents
        ],

        "recent_notifications": [
            {
                "id": notification.id,
                "title": notification.title,
                "severity": notification.severity,
                "is_read": notification.is_read,
            }
            for notification in recent_notifications
        ],

        "high_risk_employees": [
            {
                "employee_id": employee.employee_id,
                "department": employee.department,
                "risk_score": employee.risk_score,
            }
            for employee in high_risk_employees
        ],
    }