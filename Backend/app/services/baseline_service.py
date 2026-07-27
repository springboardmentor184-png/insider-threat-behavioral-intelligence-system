from sqlalchemy import func, Integer
from sqlalchemy.orm import Session

from app.models import BehaviorLog, BehaviorBaseline


def generate_baselines(db: Session):

    # Get average behavior for each employee
    results = (
        db.query(
            BehaviorLog.employee_id,
            func.avg(BehaviorLog.failed_logins),
            func.avg(BehaviorLog.files_downloaded),
            func.avg(BehaviorLog.emails_sent),
            func.avg(BehaviorLog.login_hour),
            func.avg(BehaviorLog.usb_used.cast(Integer)),
            func.avg(BehaviorLog.after_hours_login.cast(Integer))
        )
        .group_by(BehaviorLog.employee_id)
        .all()
    )

    baselines_created = 0

    for row in results:

        employee_id = row[0]

        # Skip if baseline already exists
        existing = (
            db.query(BehaviorBaseline)
            .filter(BehaviorBaseline.employee_id == employee_id)
            .first()
        )

        if existing:
            continue

        baseline = BehaviorBaseline(
            employee_id=employee_id,
            avg_failed_logins=round(row[1]),
            avg_files_downloaded=round(row[2]),
            avg_emails_sent=round(row[3]),
            avg_login_hour=round(row[4]),
            usb_usage_rate=round(row[5] * 100),
            after_hours_rate=round(row[6] * 100)
        )

        db.add(baseline)
        baselines_created += 1

    db.commit()

    return {
        "status": "success",
        "baselines_created": baselines_created
    }


# ==========================
# GET BASELINE OF EMPLOYEE
# ==========================

def get_baseline(employee_id: int, db: Session):

    baseline = (
        db.query(BehaviorBaseline)
        .filter(BehaviorBaseline.employee_id == employee_id)
        .first()
    )

    return baseline