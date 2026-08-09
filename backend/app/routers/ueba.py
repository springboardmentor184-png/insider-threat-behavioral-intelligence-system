from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..dependencies import get_current_user
from ..models import (
    User,
    UserProfile,
    RiskScoreHistory,
    ActivityLog,
)

router = APIRouter(
    prefix="/ueba",
    tags=["UEBA Intelligence"]
)


# ======================================================
# UEBA SUMMARY
# ======================================================

@router.get("/summary")
def ueba_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    total_employees = db.query(UserProfile).count()

    avg_risk = (
        db.query(func.avg(UserProfile.risk_score)).scalar()
        or 0
    )

    high_risk = (
        db.query(UserProfile)
        .filter(UserProfile.risk_score >= 70)
        .count()
    )

    critical_risk = (
        db.query(UserProfile)
        .filter(UserProfile.risk_score >= 90)
        .count()
    )

    total_activity = db.query(ActivityLog).count()

    return {
        "total_employees": total_employees,
        "average_risk_score": round(avg_risk, 2),
        "high_risk_users": high_risk,
        "critical_users": critical_risk,
        "total_activity_logs": total_activity,
    }


# ======================================================
# RISK DISTRIBUTION
# ======================================================

@router.get("/risk-distribution")
def risk_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    low = (
        db.query(UserProfile)
        .filter(UserProfile.risk_score < 40)
        .count()
    )

    medium = (
        db.query(UserProfile)
        .filter(
            UserProfile.risk_score >= 40,
            UserProfile.risk_score < 70,
        )
        .count()
    )

    high = (
        db.query(UserProfile)
        .filter(
            UserProfile.risk_score >= 70,
            UserProfile.risk_score < 90,
        )
        .count()
    )

    critical = (
        db.query(UserProfile)
        .filter(UserProfile.risk_score >= 90)
        .count()
    )

    return {
        "Low": low,
        "Medium": medium,
        "High": high,
        "Critical": critical,
    }


# ======================================================
# HIGH RISK USERS
# ======================================================

@router.get("/high-risk-users")
def high_risk_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    users = (
        db.query(UserProfile)
        .filter(UserProfile.risk_score >= 70)
        .order_by(UserProfile.risk_score.desc())
        .all()
    )

    return [
        {
            "employee_id": u.employee_id,
            "department": u.department,
            "designation": u.designation,
            "risk_score": u.risk_score,
        }
        for u in users
    ]

# ======================================================
# RECENT ANOMALIES
# ======================================================

@router.get("/recent-anomalies")
def recent_anomalies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    history = (
        db.query(RiskScoreHistory)
        .order_by(RiskScoreHistory.recorded_at.desc())
        .limit(20)
        .all()
    )

    return [
        {
            "employee_id": h.employee_id,
            "risk_score": h.risk_score,
            "risk_category": h.risk_category,
            "recorded_at": h.recorded_at,
        }
        for h in history
    ]


# ======================================================
# PEER COMPARISON
# ======================================================

@router.get("/peer-comparison/{employee_id}")
def peer_comparison(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    profile = (
        db.query(UserProfile)
        .filter(UserProfile.employee_id == employee_id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    peer_avg = (
        db.query(func.avg(UserProfile.risk_score))
        .filter(UserProfile.department == profile.department)
        .scalar()
    ) or 0

    peer_count = (
        db.query(func.count(UserProfile.id))
        .filter(UserProfile.department == profile.department)
        .scalar()
    )

    deviation = round(
        profile.risk_score - peer_avg,
        2
    )

    return {
        "employee_id": employee_id,
        "department": profile.department,
        "employee_risk_score": profile.risk_score,
        "department_avg_risk_score": round(peer_avg, 2),
        "peer_count": peer_count,
        "deviation_from_peers": deviation,
        "above_peer_average": deviation > 0,
    }


# ======================================================
# RISK TREND
# ======================================================

@router.get("/trend/{employee_id}")
def risk_trend(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    history = (
        db.query(RiskScoreHistory)
        .filter(
            RiskScoreHistory.employee_id == employee_id
        )
        .order_by(
            RiskScoreHistory.recorded_at.asc()
        )
        .all()
    )

    if not history:
        raise HTTPException(
            status_code=404,
            detail="No history found for this employee"
        )

    points = [
        {
            "recorded_at": h.recorded_at,
            "risk_score": h.risk_score,
            "risk_category": h.risk_category,
        }
        for h in history
    ]

    trend_direction = "Stable"

    if len(points) >= 2:

        if points[-1]["risk_score"] > points[0]["risk_score"]:
            trend_direction = "Increasing"

        elif points[-1]["risk_score"] < points[0]["risk_score"]:
            trend_direction = "Decreasing"

    return {
        "employee_id": employee_id,
        "trend_direction": trend_direction,
        "history": points,
    }