"""
Feature extraction module – computes per-user behavioral features from the
activity_logs table in PostgreSQL.  Used by the risk scoring API endpoint.
"""

from collections import defaultdict
from sqlalchemy.orm import Session
from sqlalchemy import func, case, distinct

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import ActivityLog


def compute_user_features_from_db(db: Session, employee_id: str = None) -> list[dict]:
    """
    Compute the same features the ML model was trained on, but from
    the activity_logs table instead of raw CSVs.

    If employee_id is given, compute only for that user.
    Returns a list of dicts (one per user), each containing all feature columns.
    """
    query = db.query(ActivityLog)
    if employee_id:
        query = query.filter(ActivityLog.employee_id == employee_id)

    logs = query.all()
    if not logs:
        return []

    # Group by user
    user_logons = defaultdict(list)
    user_logoffs = defaultdict(list)
    user_device_connects = defaultdict(list)
    user_device_disconnects = defaultdict(list)

    for log in logs:
        emp = log.employee_id
        ts = log.timestamp
        if log.event_type == "logon":
            user_logons[emp].append(ts)
        elif log.event_type == "logoff":
            user_logoffs[emp].append(ts)
        elif log.event_type == "device_connect":
            user_device_connects[emp].append(ts)
        elif log.event_type == "device_disconnect":
            user_device_disconnects[emp].append(ts)

    all_users = set()
    all_users.update(user_logons.keys())
    all_users.update(user_device_connects.keys())

    results = []
    for user in all_users:
        logon_times = user_logons.get(user, [])
        logoff_times = user_logoffs.get(user, [])
        dev_conn = user_device_connects.get(user, [])
        dev_disconn = user_device_disconnects.get(user, [])

        # Logon features
        total_logons = len(logon_times)
        logon_hours = [t.hour for t in logon_times]
        after_hours_logons = sum(1 for h in logon_hours if h < 6 or h >= 20)
        weekend_logons = sum(1 for t in logon_times if t.weekday() in (5, 6))
        logon_pcs = set()
        logon_days = set()
        for log in logs:
            if log.employee_id == user and log.event_type == "logon":
                logon_pcs.add(log.pc)
                logon_days.add(log.timestamp.date())

        total_logoffs = len(logoff_times)

        # Device features
        total_device_connects = len(dev_conn)
        total_device_disconnects = len(dev_disconn)
        device_hours = [t.hour for t in dev_conn]
        after_hours_device = sum(1 for h in device_hours if h < 6 or h >= 20)
        weekend_device = sum(1 for t in dev_conn if t.weekday() in (5, 6))
        device_pcs = set()
        device_days = set()
        for log in logs:
            if log.employee_id == user and log.event_type == "device_connect":
                device_pcs.add(log.pc)
                device_days.add(log.timestamp.date())

        import statistics

        mean_logon_hour = statistics.mean(logon_hours) if logon_hours else 0.0
        std_logon_hour = statistics.stdev(logon_hours) if len(logon_hours) > 1 else 0.0
        mean_device_hour = statistics.mean(device_hours) if device_hours else 0.0
        std_device_hour = statistics.stdev(device_hours) if len(device_hours) > 1 else 0.0

        num_logon_days = len(logon_days) or 1
        num_device_days = len(device_days) or 1

        feat = {
            "user": user,
            "total_logons": total_logons,
            "mean_logon_hour": mean_logon_hour,
            "std_logon_hour": std_logon_hour,
            "after_hours_logons": after_hours_logons,
            "weekend_logons": weekend_logons,
            "unique_pcs_logon": len(logon_pcs),
            "num_logon_days": num_logon_days,
            "total_logoffs": total_logoffs,
            "total_device_connects": total_device_connects,
            "after_hours_device": after_hours_device,
            "weekend_device": weekend_device,
            "unique_pcs_device": len(device_pcs),
            "mean_device_hour": mean_device_hour,
            "std_device_hour": std_device_hour,
            "num_device_days": num_device_days,
            "total_device_disconnects": total_device_disconnects,
            # Derived ratios
            "after_hours_logon_ratio": after_hours_logons / max(total_logons, 1),
            "weekend_logon_ratio": weekend_logons / max(total_logons, 1),
            "logons_per_day": total_logons / num_logon_days,
            "device_connects_per_day": total_device_connects / num_device_days,
            "after_hours_device_ratio": after_hours_device / max(total_device_connects, 1),
            "weekend_device_ratio": weekend_device / max(total_device_connects, 1),
            "logon_logoff_ratio": total_logons / max(total_logoffs, 1),
            "pc_variety_score": len(logon_pcs) + len(device_pcs),
            # Session features (simplified - set to 0 if not computed)
            "mean_session_min": 0.0,
            "std_session_min": 0.0,
            "max_session_min": 0.0,
        }
        results.append(feat)

    return results
