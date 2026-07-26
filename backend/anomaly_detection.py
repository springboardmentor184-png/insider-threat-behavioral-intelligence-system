"""
Anomaly Detection Engine

Compares each logon event against the employee's behavioral baseline.
If the deviation (z-score) crosses a threshold, an Anomaly record is created.

Usage:
    python anomaly_detection.py
"""

from database import SessionLocal
from models import ActivityLog, BehavioralBaseline, Anomaly

Z_SCORE_THRESHOLD = 2.0   # anything below this is considered "normal"
MIN_STD_DEV = 0.5         # avoid division by near-zero std dev (too-strict baselines)


def get_severity(z_score: float) -> str:
    z = abs(z_score)
    if z >= 4:
        return "critical"
    elif z >= 3:
        return "high"
    elif z >= 2:
        return "medium"
    return "low"


def run_anomaly_detection(db):
    print("Loading baselines...")
    baselines = {b.employee_id: b for b in db.query(BehavioralBaseline).all()}
    print(f"Loaded {len(baselines)} baselines.")

    print("Clearing previously auto-generated open anomalies (re-run safe)...")
    db.query(Anomaly).filter(Anomaly.status == "open").delete()
    db.commit()

    print("Scanning logon events for anomalies...")
    logon_logs = db.query(ActivityLog).filter(ActivityLog.event_type == "logon").all()
    print(f"Total logon events to scan: {len(logon_logs)}")

    anomalies_created = 0

    for log in logon_logs:
        baseline = baselines.get(log.employee_id)
        if baseline is None or baseline.avg_logon_hour is None:
            continue

        std = baseline.std_logon_hour or 0.0
        if std < MIN_STD_DEV:
            std = MIN_STD_DEV  # prevent tiny std devs from causing false-positive floods

        actual_hour = log.timestamp.hour
        z_score = (actual_hour - baseline.avg_logon_hour) / std

        if abs(z_score) >= Z_SCORE_THRESHOLD:
            anomaly = Anomaly(
                employee_id=log.employee_id,
                anomaly_type="unusual_login_time",
                severity=get_severity(z_score),
                description=(
                    f"Login at hour {actual_hour}:00 deviates from baseline "
                    f"avg {baseline.avg_logon_hour:.1f}:00 (z-score={z_score:.2f})"
                ),
                detected_value=actual_hour,
                baseline_value=baseline.avg_logon_hour,
                deviation_score=z_score,
                event_timestamp=log.timestamp,
                status="open",
            )
            db.add(anomaly)
            anomalies_created += 1

            # commit in batches to avoid huge single transactions
            if anomalies_created % 500 == 0:
                db.commit()
                print(f"  ...{anomalies_created} anomalies created so far")

    db.commit()
    print(f"Anomaly detection complete. Total anomalies created: {anomalies_created}")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        run_anomaly_detection(db)
    finally:
        db.close()