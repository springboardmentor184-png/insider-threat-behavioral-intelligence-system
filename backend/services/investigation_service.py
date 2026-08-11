import statistics
from sqlalchemy.orm import Session
from database.models.employee import Employee
from database.models.activity_log import ActivityLog
from database.models.investigation import Investigation
from services.baseline_service import get_risk_category


def generate_investigations(db: Session) -> dict:
    """Auto-opens an investigation case for any High/Critical risk employee
    who doesn't already have an open case, and links their flagged activity
    as the case timeline."""
    employees = db.query(Employee).filter(Employee.risk_score >= 50).all()
    created = 0

    for emp in employees:
        existing = (
            db.query(Investigation)
            .filter(Investigation.employee_id == emp.id, Investigation.status == "open")
            .first()
        )
        if existing:
            continue

        flagged_logs = (
            db.query(ActivityLog)
            .filter(ActivityLog.employee_id == emp.id, ActivityLog.is_flagged == 1)
            .order_by(ActivityLog.timestamp.asc())
            .all()
        )
        if not flagged_logs:
            continue

        case = Investigation(
            employee_id=emp.id,
            severity=get_risk_category(emp.risk_score),
            status="open",
            summary=f"{len(flagged_logs)} anomalous activity event(s) detected for {emp.full_name} "
                    f"(employee_code={emp.employee_code}, risk_score={emp.risk_score}).",
            linked_log_ids=",".join(str(l.id) for l in flagged_logs),
        )
        db.add(case)
        created += 1

    db.commit()
    return {"investigations_created": created}


def get_investigation_timeline(db: Session, investigation_id: int) -> dict | None:
    case = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not case:
        return None

    log_ids = [int(x) for x in case.linked_log_ids.split(",") if x]
    logs = db.query(ActivityLog).filter(ActivityLog.id.in_(log_ids)).order_by(ActivityLog.timestamp.asc()).all()

    return {
        "id": case.id,
        "employee_id": case.employee_id,
        "severity": case.severity,
        "status": case.status,
        "summary": case.summary,
        "created_at": case.created_at,
        "timeline": [
            {
                "id": l.id,
                "activity_type": l.activity_type,
                "resource": l.resource,
                "device": l.device,
                "data_volume_mb": l.data_volume_mb,
                "timestamp": l.timestamp,
            }
            for l in logs
        ],
    }


def compute_peer_comparison(db: Session) -> dict:
    """UEBA: compares each employee's flagged-event count against the
    overall population average, flagging those significantly above their
    peers (not just above their own baseline — a different, complementary
    signal to individual anomaly detection)."""
    employees = db.query(Employee).all()
    counts = {}
    for emp in employees:
        c = db.query(ActivityLog).filter(ActivityLog.employee_id == emp.id, ActivityLog.is_flagged == 1).count()
        counts[emp.id] = c

    values = list(counts.values())
    if not values:
        return {"peer_outliers": 0}

    avg = statistics.mean(values)
    stdev = statistics.pstdev(values) if len(values) > 1 else 0

    outliers = 0
    for emp in employees:
        emp_count = counts[emp.id]
        is_outlier = stdev > 0 and (emp_count - avg) > (2 * stdev)  # >2 std devs above peer average
        if is_outlier:
            outliers += 1
            if emp.risk_score < 60:
                emp.risk_score = min(emp.risk_score + 15, 100)  # UEBA bump on top of individual score

    db.commit()
    return {
        "employees_compared": len(employees),
        "peer_average_flagged_events": round(avg, 2),
        "peer_outliers": outliers,
    }