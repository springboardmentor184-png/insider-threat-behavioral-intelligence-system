"""
Behavioral Baseline Engine

Computes a 'normal behavior' baseline for every employee based on their
historical activity_logs (logon + device events), and stores it in the
behavioral_baselines table.

Usage:
    python baseline_engine.py
"""

import statistics
from collections import defaultdict

from database import SessionLocal
from models import ActivityLog, BehavioralBaseline


def compute_baselines(db):
    print("Fetching activity logs...")
    logs = db.query(ActivityLog).all()
    print(f"Total logs fetched: {len(logs)}")

    # Group data per employee
    logon_hours = defaultdict(list)          # employee_id -> [hour, hour, ...]
    daily_logon_counts = defaultdict(lambda: defaultdict(int))  # employee_id -> {date: count}
    device_daily_counts = defaultdict(lambda: defaultdict(int))  # employee_id -> {date: count}
    total_logon_events = defaultdict(int)
    total_device_events = defaultdict(int)

    for log in logs:
        emp = log.employee_id
        event_date = log.timestamp.date()

        if log.event_type == "logon":
            logon_hours[emp].append(log.timestamp.hour)
            daily_logon_counts[emp][event_date] += 1
            total_logon_events[emp] += 1

        elif log.event_type == "device_connect":
            device_daily_counts[emp][event_date] += 1
            total_device_events[emp] += 1

    all_employees = set(logon_hours.keys()) | set(device_daily_counts.keys())
    print(f"Computing baselines for {len(all_employees)} employees...")

    count_created = 0
    count_updated = 0

    for emp in all_employees:
        hours = logon_hours.get(emp, [])
        daily_logons = list(daily_logon_counts.get(emp, {}).values())
        daily_devices = list(device_daily_counts.get(emp, {}).values())

        avg_logon_hour = statistics.mean(hours) if hours else None
        std_logon_hour = statistics.stdev(hours) if len(hours) > 1 else 0.0

        avg_daily_logons = statistics.mean(daily_logons) if daily_logons else None
        avg_device_connects = statistics.mean(daily_devices) if daily_devices else None
        std_device_connects = statistics.stdev(daily_devices) if len(daily_devices) > 1 else 0.0

        # Upsert: update if baseline already exists, else create new
        baseline = db.query(BehavioralBaseline).filter(
            BehavioralBaseline.employee_id == emp
        ).first()

        if baseline is None:
            baseline = BehavioralBaseline(employee_id=emp)
            db.add(baseline)
            count_created += 1
        else:
            count_updated += 1

        baseline.avg_logon_hour = avg_logon_hour
        baseline.std_logon_hour = std_logon_hour
        baseline.avg_daily_logons = avg_daily_logons
        baseline.avg_device_connects = avg_device_connects
        baseline.std_device_connects = std_device_connects
        baseline.total_logon_events = total_logon_events.get(emp, 0)
        baseline.total_device_events = total_device_events.get(emp, 0)

    db.commit()
    print(f"Baselines created: {count_created}, updated: {count_updated}")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        compute_baselines(db)
        print("Baseline computation complete!")
    finally:
        db.close()