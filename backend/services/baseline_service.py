import statistics
import numpy as np
from sklearn.ensemble import IsolationForest
from database.models.behavior_baseline import BehaviorBaseline
from sqlalchemy.orm import Session
from database.models.activity_log import ActivityLog
from database.models.behavior_baseline import BehaviorBaseline
from database.models.employee import Employee


def compute_baseline_for_employee(db: Session, employee_id: int) -> BehaviorBaseline | None:
    logs = db.query(ActivityLog).filter(ActivityLog.employee_id == employee_id).all()
    if len(logs) < 3:
        return None

    volumes = [l.data_volume_mb for l in logs if l.data_volume_mb is not None]
    hours = [l.timestamp.hour for l in logs if l.timestamp is not None]
    devices = {l.device for l in logs if l.device}

    avg_volume = statistics.mean(volumes) if volumes else 0.0
    std_volume = statistics.pstdev(volumes) if len(volumes) > 1 else 0.0
    start_hour = min(hours) if hours else 9
    end_hour = max(hours) if hours else 18

    baseline = db.query(BehaviorBaseline).filter(BehaviorBaseline.employee_id == employee_id).first()
    if not baseline:
        baseline = BehaviorBaseline(employee_id=employee_id)
        db.add(baseline)

    baseline.avg_data_volume_mb = round(avg_volume, 4)
    baseline.std_data_volume_mb = round(std_volume, 4)
    baseline.typical_start_hour = start_hour
    baseline.typical_end_hour = end_hour
    baseline.common_devices = ",".join(sorted(devices))
    baseline.total_events_seen = len(logs)

    db.commit()
    db.refresh(baseline)
    return baseline


def compute_all_baselines(db: Session) -> dict:
    employees = db.query(Employee).all()
    computed, skipped = 0, 0
    for emp in employees:
        result = compute_baseline_for_employee(db, emp.id)
        if result:
            computed += 1
        else:
            skipped += 1
    return {"baselines_computed": computed, "skipped_insufficient_history": skipped}


def detect_anomalies(db: Session) -> dict:
    """Runs Isolation Forest across every employee's activity logs,
    using their personal baseline as context, and flags outlier events."""
    employees = db.query(Employee).all()
    flagged_total = 0
    checked_total = 0

    for emp in employees:
        logs = db.query(ActivityLog).filter(ActivityLog.employee_id == emp.id).all()
        if len(logs) < 5:
            continue  # not enough data to model this employee meaningfully

        # Features per event: data volume, hour of day, and how far the
        # volume deviates from this employee's own average (z-score-like)
        baseline = db.query(BehaviorBaseline).filter(BehaviorBaseline.employee_id == emp.id).first()
        avg_vol = baseline.avg_data_volume_mb if baseline else 0.0

        features = []
        for log in logs:
            hour = log.timestamp.hour if log.timestamp else 12
            volume = log.data_volume_mb or 0.0
            deviation = volume - avg_vol
            features.append([volume, hour, deviation])

        X = np.array(features)
        model = IsolationForest(contamination=0.1, random_state=42)
        predictions = model.fit_predict(X)  # -1 = anomaly, 1 = normal

        for log, pred in zip(logs, predictions):
            is_flagged = 1 if pred == -1 else 0
            if log.is_flagged != is_flagged:
                log.is_flagged = is_flagged
            if is_flagged:
                flagged_total += 1
            checked_total += 1

        db.commit()

    return {"employees_analyzed": len(employees), "events_checked": checked_total, "anomalies_flagged": flagged_total}
def compute_risk_scores(db: Session) -> dict:
    """First-version Insider Risk Score: combines each employee's flagged
    anomaly count with their access privilege level into a 0-100 score,
    then classifies into Low/Medium/High/Critical risk categories."""
    employees = db.query(Employee).all()
    updated = 0

    access_weight = {"standard": 0, "elevated": 15, "privileged": 30}

    for emp in employees:
        flagged_count = (
            db.query(ActivityLog)
            .filter(ActivityLog.employee_id == emp.id, ActivityLog.is_flagged == 1)
            .count()
        )
        # Behavioral anomalies component (capped contribution)
        anomaly_component = min(flagged_count * 10, 70)
        privilege_component = access_weight.get(emp.access_level, 0)

        score = min(anomaly_component + privilege_component, 100)
        emp.risk_score = score
        updated += 1

    db.commit()
    return {"employees_scored": updated}


def get_risk_category(score: int) -> str:
    if score >= 75:
        return "Critical"
    elif score >= 50:
        return "High"
    elif score >= 25:
        return "Medium"
    return "Low"