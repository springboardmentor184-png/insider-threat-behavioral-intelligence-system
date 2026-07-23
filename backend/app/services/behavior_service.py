"""
Behavior Profiling Service

This service calculates comprehensive behavioral baselines from activity logs.
It provides metrics for:
- Temporal patterns (login hours, daily/weekly activity)
- Device preferences (browser, device, OS, IP)
- Activity analysis (frequency, types, data transfers)
- Behavioral consistency
- Risk indicators

All calculations are dynamic based on actual ActivityLog data.
"""

from collections import Counter, defaultdict
from datetime import datetime, timedelta
from statistics import mean, stdev
from uuid import UUID
from typing import Dict, List, Optional, Any

from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.models.activity import ActivityLog, ActivityType
from app.models.behavior_profile import BehaviorProfile
from app.utils.behavior_utils import (
    TimeBasedClassification,
    BehavioralMetrics,
    DataAggregation,
    RiskFactorDetection
)


def _coerce_uuid(value: str | UUID) -> UUID:
    """Convert string to UUID if needed"""
    return value if isinstance(value, UUID) else UUID(str(value))


# ============================================================================
# TEMPORAL PATTERN CALCULATIONS
# ============================================================================

def calculate_average_login_hour(db: Session, employee_id: str | UUID) -> Optional[float]:
    """
    Calculate average login hour (decimal: 9.5 = 9:30 AM).
    
    Returns the mean hour employees typically log in.
    Helps detect if someone logs in at unusual times.
    """
    employee_id = _coerce_uuid(employee_id)

    logins = (
        db.query(ActivityLog.timestamp)
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type == ActivityType.LOGIN,
        )
        .all()
    )

    if not logins:
        return None

    timestamps = [log[0] for log in logins]
    return BehavioralMetrics.calculate_average_hour(timestamps)


def calculate_average_logout_hour(db: Session, employee_id: str | UUID) -> Optional[float]:
    """
    Calculate average logout hour (decimal format).
    
    Helps establish normal working hour patterns.
    """
    employee_id = _coerce_uuid(employee_id)

    logouts = (
        db.query(ActivityLog.timestamp)
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type == ActivityType.LOGOUT,
        )
        .all()
    )

    if not logouts:
        return None

    timestamps = [log[0] for log in logouts]
    return BehavioralMetrics.calculate_average_hour(timestamps)


def calculate_average_session_duration(db: Session, employee_id: str | UUID) -> Optional[float]:
    """
    Calculate average session duration in hours.
    
    Sessions with session_duration set (logout - login).
    """
    employee_id = _coerce_uuid(employee_id)

    sessions = (
        db.query(ActivityLog.session_duration)
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.session_duration > 0,
        )
        .all()
    )

    if not sessions:
        return None

    durations = [s[0] / 3600 for s in sessions]  # Convert seconds to hours
    return round(mean(durations), 2)


def get_login_pattern(db: Session, employee_id: str | UUID) -> dict:
    employee_id = _coerce_uuid(employee_id)

    logins = (
        db.query(ActivityLog.timestamp)
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type == ActivityType.LOGIN,
        )
        .all()
    )

    timestamps = [row[0] for row in logins]
    average_login_hour = BehavioralMetrics.calculate_average_hour(timestamps) if timestamps else None
    earliest_login = min(timestamps) if timestamps else None
    latest_login = max(timestamps) if timestamps else None

    weekday_counts = {day: 0 for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]}
    weekend_count = 0
    hour_counts: Dict[int, int] = {}

    for ts in timestamps:
        weekday = ts.strftime("%A")
        weekday_counts[weekday] += 1
        if ts.weekday() >= 5:
            weekend_count += 1
        hour_counts[ts.hour] = hour_counts.get(ts.hour, 0) + 1

    most_frequent_login_hour = max(hour_counts, key=hour_counts.get) if hour_counts else None

    return {
        "employee_id": employee_id,
        "average_login_hour": average_login_hour,
        "earliest_login": earliest_login,
        "latest_login": latest_login,
        "weekday_login_distribution": weekday_counts,
        "weekend_login_count": weekend_count,
        "most_frequent_login_hour": most_frequent_login_hour,
    }


def get_login_anomalies(db: Session, employee_id: str | UUID) -> list[dict]:
    employee_id = _coerce_uuid(employee_id)

    logins = (
        db.query(ActivityLog.timestamp)
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type == ActivityType.LOGIN,
        )
        .all()
    )
    timestamps = [row[0] for row in logins]

    average_login_hour = calculate_average_login_hour(db, employee_id)
    average_logout_hour = calculate_average_logout_hour(db, employee_id)

    daily_counts = (
        db.query(func.date(ActivityLog.timestamp).label("day"), func.count(ActivityLog.id).label("count"))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type == ActivityType.LOGIN,
        )
        .group_by(func.date(ActivityLog.timestamp))
        .all()
    )

    counts = [row.count for row in daily_counts]
    mean_count = mean(counts) if counts else 0.0
    std_count = stdev(counts) if len(counts) > 1 else 0.0

    anomalies: list[dict] = []

    for ts in timestamps:
        if ts.weekday() >= 5:
            anomalies.append({
                "employee_id": employee_id,
                "anomaly_type": "Weekend Login",
                "description": f"Login occurred on weekend {ts.strftime('%A')}",
                "severity": "medium",
                "detected_at": ts,
            })

        hour_decimal = ts.hour + ts.minute / 60.0
        if average_login_hour is not None and average_logout_hour is not None:
            baseline_start = max(0.0, average_login_hour - 2)
            baseline_end = min(23.99, average_logout_hour + 2)
            if hour_decimal < baseline_start or hour_decimal > baseline_end:
                anomalies.append({
                    "employee_id": employee_id,
                    "anomaly_type": "Login Outside Baseline Hours",
                    "description": f"Login at {hour_decimal:.2f}h outside baseline hours {baseline_start:.2f}-{baseline_end:.2f}",
                    "severity": "medium",
                    "detected_at": ts,
                })

        if average_login_hour is not None and abs(hour_decimal - average_login_hour) > 3.0:
            anomalies.append({
                "employee_id": employee_id,
                "anomaly_type": "Unusual Login Hour",
                "description": f"Login at {hour_decimal:.2f}h is unusually far from average login hour {average_login_hour:.2f}h",
                "severity": "low",
                "detected_at": ts,
            })

    if len(counts) > 1:
        for row in daily_counts:
            if row.count > mean_count + max(2.0, std_count * 2):
                day_val = datetime.strptime(row.day, "%Y-%m-%d").date() if isinstance(row.day, str) else row.day
                anomalies.append({
                    "employee_id": employee_id,
                    "anomaly_type": "Abnormal Login Frequency",
                    "description": f"{row.count} logins on {day_val.strftime('%Y-%m-%d')} exceeds expected frequency",
                    "severity": "high",
                    "detected_at": datetime.combine(day_val, datetime.min.time()),
                })

    return anomalies


def get_work_pattern(db: Session, employee_id: str | UUID) -> dict:
    employee_id = _coerce_uuid(employee_id)

    daily_activity_counts = (
        db.query(func.date(ActivityLog.timestamp).label("day"), func.count(ActivityLog.id).label("count"))
        .filter(ActivityLog.employee_id == employee_id)
        .group_by(func.date(ActivityLog.timestamp))
        .all()
    )

    total_active_days = len(daily_activity_counts)
    total_daily_activities = sum(row.count for row in daily_activity_counts)

    session_entries = (
        db.query(ActivityLog.session_id, func.date(ActivityLog.timestamp).label("day"))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.session_duration.isnot(None),
            ActivityLog.session_duration > 0,
        )
        .distinct()
        .all()
    )

    sessions_per_day: Dict[datetime, int] = {}
    total_session_hours = 0.0

    for session_id, day in session_entries:
        sessions_per_day[day] = sessions_per_day.get(day, 0) + 1

    session_durations = (
        db.query(ActivityLog.session_duration, func.date(ActivityLog.timestamp).label("day"))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.session_duration.isnot(None),
            ActivityLog.session_duration > 0,
        )
        .all()
    )

    for duration, day in session_durations:
        total_session_hours += duration / 3600

    average_active_sessions = round(sum(sessions_per_day.values()) / total_active_days, 2) if total_active_days else 0.0
    average_working_hours_per_day = round(total_session_hours / total_active_days, 2) if total_active_days else 0.0
    average_daily_activities = round(total_daily_activities / total_active_days, 2) if total_active_days else 0.0

    busiest_weekday = None
    if daily_activity_counts:
        weekday_totals: Dict[str, int] = {
            "Monday": 0,
            "Tuesday": 0,
            "Wednesday": 0,
            "Thursday": 0,
            "Friday": 0,
            "Saturday": 0,
            "Sunday": 0,
        }
        for row in daily_activity_counts:
            day_val = datetime.strptime(row.day, "%Y-%m-%d").date() if isinstance(row.day, str) else row.day
            weekday = day_val.strftime("%A")
            weekday_totals[weekday] += row.count
        busiest_weekday = max(weekday_totals, key=weekday_totals.get)

    consistency_score = 0.0
    if total_active_days and total_daily_activities:
        daily_counts = [row.count for row in daily_activity_counts]
        if len(daily_counts) > 1:
            mean_count = mean(daily_counts)
            deviation = stdev(daily_counts)
            consistency_score = max(0.0, round(100.0 - (deviation / mean_count * 100.0), 2)) if mean_count else 0.0
        else:
            consistency_score = 100.0

    return {
        "employee_id": employee_id,
        "average_working_hours_per_day": average_working_hours_per_day,
        "average_active_sessions": average_active_sessions,
        "total_active_days": total_active_days,
        "busiest_weekday": busiest_weekday,
        "average_daily_activities": average_daily_activities,
        "consistency_score": consistency_score,
    }


def calculate_average_daily_login_count(db: Session, employee_id: str | UUID) -> float:
    employee_id = _coerce_uuid(employee_id)

    daily_counts = (
        db.query(func.date(ActivityLog.timestamp).label("day"), func.count(ActivityLog.id).label("count"))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type == ActivityType.LOGIN,
        )
        .group_by(func.date(ActivityLog.timestamp))
        .all()
    )

    if not daily_counts:
        return 0.0

    return round(mean([row.count for row in daily_counts]), 2)


def calculate_average_daily_file_downloads(db: Session, employee_id: str | UUID) -> float:
    employee_id = _coerce_uuid(employee_id)

    daily_counts = (
        db.query(func.date(ActivityLog.timestamp).label("day"), func.count(ActivityLog.id).label("count"))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type == ActivityType.FILE_DOWNLOAD,
        )
        .group_by(func.date(ActivityLog.timestamp))
        .all()
    )

    if not daily_counts:
        return 0.0

    return round(mean([row.count for row in daily_counts]), 2)


def calculate_average_daily_usb_activities(db: Session, employee_id: str | UUID) -> float:
    employee_id = _coerce_uuid(employee_id)

    daily_counts = (
        db.query(func.date(ActivityLog.timestamp).label("day"), func.count(ActivityLog.id).label("count"))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type.in_([
                ActivityType.USB_CONNECTED,
                ActivityType.USB_REMOVED,
                ActivityType.EXTERNAL_DEVICE_CONNECTED,
            ]),
        )
        .group_by(func.date(ActivityLog.timestamp))
        .all()
    )

    if not daily_counts:
        return 0.0

    return round(mean([row.count for row in daily_counts]), 2)


def calculate_average_daily_email_activities(db: Session, employee_id: str | UUID) -> float:
    employee_id = _coerce_uuid(employee_id)

    daily_counts = (
        db.query(func.date(ActivityLog.timestamp).label("day"), func.count(ActivityLog.id).label("count"))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type == ActivityType.EMAIL_ACTIVITY,
        )
        .group_by(func.date(ActivityLog.timestamp))
        .all()
    )

    if not daily_counts:
        return 0.0

    return round(mean([row.count for row in daily_counts]), 2)


def get_behavior_baseline(db: Session, employee_id: str | UUID) -> dict:
    return {
        "employee_id": _coerce_uuid(employee_id),
        "average_login_hour": calculate_average_login_hour(db, employee_id),
        "average_logout_hour": calculate_average_logout_hour(db, employee_id),
        "average_daily_logins": calculate_average_daily_login_count(db, employee_id),
        "average_file_downloads": calculate_average_daily_file_downloads(db, employee_id),
        "average_usb_activities": calculate_average_daily_usb_activities(db, employee_id),
        "average_email_activities": calculate_average_daily_email_activities(db, employee_id),
    }


def get_resource_access(db: Session, employee_id: str | UUID) -> dict:
    employee_id = _coerce_uuid(employee_id)

    file_access_logs = (
        db.query(ActivityLog)
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type == ActivityType.FILE_ACCESS,
        )
    )

    total_file_accesses = file_access_logs.count()

    daily_counts = (
        db.query(func.date(ActivityLog.timestamp).label("day"), func.count(ActivityLog.id).label("count"))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type == ActivityType.FILE_ACCESS,
        )
        .group_by(func.date(ActivityLog.timestamp))
        .all()
    )

    average_files_per_day = round(mean([row.count for row in daily_counts]), 2) if daily_counts else 0.0

    resources = (
        db.query(ActivityLog.resource_name)
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type == ActivityType.FILE_ACCESS,
            ActivityLog.resource_name.isnot(None),
        )
        .all()
    )

    resource_names = [r[0] for r in resources if r[0]]
    unique_resources = len(set(resource_names))
    most_accessed_resource = Counter(resource_names).most_common(1)[0][0] if resource_names else None

    access_frequency_score = 0.0
    if daily_counts:
        counts = [row.count for row in daily_counts]
        if len(counts) > 1:
            mean_count = mean(counts)
            deviation = stdev(counts)
            access_frequency_score = max(0.0, round(100.0 - (deviation / mean_count * 100.0), 2)) if mean_count else 0.0
        else:
            access_frequency_score = 100.0

    after_hours_access_count = (
        db.query(func.count(ActivityLog.id))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type == ActivityType.FILE_ACCESS,
            ActivityLog.is_after_hours == True,
        )
        .scalar() or 0
    )

    return {
        "employee_id": employee_id,
        "total_file_accesses": total_file_accesses,
        "average_files_per_day": average_files_per_day,
        "most_accessed_resource": most_accessed_resource,
        "unique_resources": unique_resources,
        "access_frequency_score": access_frequency_score,
        "after_hours_access_count": after_hours_access_count,
    }


def get_file_access_anomalies(db: Session, employee_id: str | UUID) -> list[dict]:
    employee_id = _coerce_uuid(employee_id)

    file_accesses = (
        db.query(ActivityLog.timestamp, ActivityLog.resource_name, ActivityLog.is_after_hours)
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type == ActivityType.FILE_ACCESS,
        )
        .all()
    )

    timestamps = [row[0] for row in file_accesses]
    resource_names = [row[1] for row in file_accesses if row[1]]

    daily_counts = (
        db.query(func.date(ActivityLog.timestamp).label("day"), func.count(ActivityLog.id).label("count"))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type == ActivityType.FILE_ACCESS,
        )
        .group_by(func.date(ActivityLog.timestamp))
        .all()
    )

    counts = [row.count for row in daily_counts]
    mean_count = mean(counts) if counts else 0.0
    std_count = stdev(counts) if len(counts) > 1 else 0.0

    anomalies: list[dict] = []

    total_file_accesses = len(timestamps)
    if total_file_accesses > 100 and total_file_accesses > mean_count * 2:
        anomalies.append({
            "employee_id": employee_id,
            "anomaly_type": "Excessive File Accesses",
            "resource_name": None,
            "description": f"Total file accesses {total_file_accesses} significantly exceeds normal volume.",
            "severity": "high",
            "detected_at": datetime.utcnow(),
        })

    unusual_resources = Counter([name for name in resource_names if name and "sensitive" in name.lower()])
    if unusual_resources:
        resource, _ = unusual_resources.most_common(1)[0]
        anomalies.append({
            "employee_id": employee_id,
            "anomaly_type": "Unusual Resource Access",
            "resource_name": resource,
            "description": f"Accessed unusual/sensitive resource {resource}.",
            "severity": "high",
            "detected_at": datetime.utcnow(),
        })

    for ts, resource_name, after_hours in file_accesses:
        if after_hours:
            anomalies.append({
                "employee_id": employee_id,
                "anomaly_type": "After-Hours File Access",
                "resource_name": resource_name,
                "description": f"File access to {resource_name or 'unknown resource'} outside normal hours.",
                "severity": "medium",
                "detected_at": ts,
            })

    if len(counts) > 1:
        for row in daily_counts:
            if row.count > mean_count + max(2.0, std_count * 2):
                day_val = datetime.strptime(row.day, "%Y-%m-%d").date() if isinstance(row.day, str) else row.day
                anomalies.append({
                    "employee_id": employee_id,
                    "anomaly_type": "Abnormal Daily Access Spike",
                    "resource_name": None,
                    "description": f"{row.count} file accesses on {day_val.strftime('%Y-%m-%d')} is a spike above expected volume.",
                    "severity": "high",
                    "detected_at": datetime.combine(day_val, datetime.min.time()),
                })

    return anomalies


def get_privilege_anomalies(db: Session, employee_id: str | UUID) -> list[dict]:
    employee_id = _coerce_uuid(employee_id)

    privilege_events = (
        db.query(
            ActivityLog.timestamp,
            ActivityLog.activity_type,
            ActivityLog.description,
            ActivityLog.privilege_level,
            ActivityLog.resource_name,
            ActivityLog.severity,
        )
        .filter(ActivityLog.employee_id == employee_id)
        .all()
    )

    anomalies: list[dict] = []

    unauthorized_actions = [
        row for row in privilege_events
        if row[2] and "unauthorized" in row[2].lower()
    ]

    suspicious_admin_access = [
        row for row in privilege_events
        if row[3] and any(token in row[3].lower() for token in ["admin", "administrator", "root", "superuser"])
    ]

    restricted_resources = [
        row for row in privilege_events
        if row[4] and any(token in row[4].lower() for token in ["restricted", "confidential", "sensitive", "admin-only"])
    ]

    escalation_attempts = [
        row for row in privilege_events
        if row[1] == ActivityType.PRIVILEGE_ESCALATION
        or (row[2] and any(token in row[2].lower() for token in ["privilege escalation", "escalation", "elevated privileges", "sudo", "admin rights"]))
    ]

    if unauthorized_actions:
        for ts, activity_type, description, privilege_level, resource_name, severity in unauthorized_actions:
            anomalies.append({
                "employee_id": employee_id,
                "anomaly_type": "Unauthorized Privileged Action",
                "description": description or "Unauthorized privileged action detected.",
                "severity": "high",
                "detected_at": ts,
            })

    if suspicious_admin_access:
        for ts, activity_type, description, privilege_level, resource_name, severity in suspicious_admin_access:
            anomalies.append({
                "employee_id": employee_id,
                "anomaly_type": "Suspicious Admin Access",
                "description": description or f"Admin-level privilege accessed: {privilege_level}.",
                "severity": "medium",
                "detected_at": ts,
            })

    if restricted_resources:
        for ts, activity_type, description, privilege_level, resource_name, severity in restricted_resources:
            anomalies.append({
                "employee_id": employee_id,
                "anomaly_type": "Restricted Resource Access",
                "description": description or f"Access to restricted resource: {resource_name}.",
                "severity": "high",
                "detected_at": ts,
            })

    if escalation_attempts:
        for ts, activity_type, description, privilege_level, resource_name, severity in escalation_attempts:
            anomalies.append({
                "employee_id": employee_id,
                "anomaly_type": "Abnormal Privilege Escalation Attempt",
                "description": description or "Potential privilege escalation activity detected.",
                "severity": "critical",
                "detected_at": ts,
            })

    daily_privilege_counts: Dict[datetime, int] = {}
    for ts, activity_type, description, privilege_level, resource_name, severity in privilege_events:
        if privilege_level or activity_type == ActivityType.PRIVILEGE_ESCALATION:
            day = ts.date()
            daily_privilege_counts[day] = daily_privilege_counts.get(day, 0) + 1

    if daily_privilege_counts:
        average_daily_privileges = mean(daily_privilege_counts.values())
        for day, count in daily_privilege_counts.items():
            if count > max(5, average_daily_privileges * 2):
                anomalies.append({
                    "employee_id": employee_id,
                    "anomaly_type": "Excessive Permission Usage",
                    "description": f"{count} privileged operations on {day.isoformat()} exceeds expected behavior.",
                    "severity": "high",
                    "detected_at": datetime.combine(day, datetime.min.time()),
                })

    if not anomalies:
        anomalies.append({
            "employee_id": employee_id,
            "anomaly_type": "No Privilege Anomalies Detected",
            "description": "No suspicious privilege activity was found for this employee.",
            "severity": "low",
            "detected_at": datetime.utcnow(),
        })

    return anomalies


def get_data_exfiltration_anomalies(db: Session, employee_id: str | UUID) -> list[dict]:
    employee_id = _coerce_uuid(employee_id)

    exfiltration_events = (
        db.query(
            ActivityLog.timestamp,
            ActivityLog.activity_type,
            ActivityLog.description,
            ActivityLog.download_size,
            ActivityLog.upload_size,
            ActivityLog.data_transferred,
            ActivityLog.resource_name,
        )
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type.in_([
                ActivityType.FILE_DOWNLOAD,
                ActivityType.CLOUD_UPLOAD,
                ActivityType.CLOUD_DOWNLOAD,
                ActivityType.DATA_TRANSFER,
                ActivityType.EMAIL_ACTIVITY,
            ]),
        )
        .all()
    )

    anomalies: list[dict] = []

    large_downloads = [
        row for row in exfiltration_events
        if row[3] and row[3] > 500_000_000
    ]
    for ts, activity_type, description, download_size, upload_size, data_transferred, resource_name in large_downloads:
        anomalies.append({
            "employee_id": employee_id,
            "anomaly_type": "Unusually Large File Download",
            "description": description or f"Downloaded {download_size} bytes in a single file download.",
            "severity": "high",
            "detected_at": ts,
        })

    excessive_transfers = [
        row for row in exfiltration_events
        if row[1] in [ActivityType.DATA_TRANSFER, ActivityType.CLOUD_UPLOAD, ActivityType.CLOUD_DOWNLOAD]
        and ((row[4] or 0) + (row[5] or 0) + (row[3] or 0)) > 200_000_000
    ]
    for ts, activity_type, description, download_size, upload_size, data_transferred, resource_name in excessive_transfers:
        anomalies.append({
            "employee_id": employee_id,
            "anomaly_type": "Excessive Outbound Transfer",
            "description": description or f"High-volume outbound transfer of {(upload_size or 0) + (data_transferred or 0) + (download_size or 0)} bytes.",
            "severity": "high",
            "detected_at": ts,
        })

    export_activities = [
        row for row in exfiltration_events
        if row[1] == ActivityType.FILE_DOWNLOAD
        and row[6]
        and any(token in row[6].lower() for token in ["export", "dump", "backup", "csv", "xls", "sql"])
    ]
    for ts, activity_type, description, download_size, upload_size, data_transferred, resource_name in export_activities:
        anomalies.append({
            "employee_id": employee_id,
            "anomaly_type": "Abnormal Export Activity",
            "description": description or f"Export-style access detected for resource {resource_name}.",
            "severity": "medium",
            "detected_at": ts,
        })

    suspicious_email_attachments = [
        row for row in exfiltration_events
        if row[1] == ActivityType.EMAIL_ACTIVITY
        and row[2]
        and any(token in row[2].lower() for token in ["attachment", "attached", "email attachment"])
    ]
    for ts, activity_type, description, download_size, upload_size, data_transferred, resource_name in suspicious_email_attachments:
        anomalies.append({
            "employee_id": employee_id,
            "anomaly_type": "Suspicious Email Attachment Activity",
            "description": description or "Email activity included suspicious attachment behavior.",
            "severity": "medium",
            "detected_at": ts,
        })

    daily_movement: Dict[datetime, int] = {}
    for ts, activity_type, description, download_size, upload_size, data_transferred, resource_name in exfiltration_events:
        total_bytes = (download_size or 0) + (upload_size or 0) + (data_transferred or 0)
        day = ts.date()
        daily_movement[day] = daily_movement.get(day, 0) + total_bytes

    for day, bytes_moved in daily_movement.items():
        if bytes_moved > 1_000_000_000:
            anomalies.append({
                "employee_id": employee_id,
                "anomaly_type": "High-Volume Data Movement",
                "description": f"{bytes_moved} bytes moved on {day.isoformat()}, exceeding high-volume thresholds.",
                "severity": "high",
                "detected_at": datetime.combine(day, datetime.min.time()),
            })

    if not anomalies:
        anomalies.append({
            "employee_id": employee_id,
            "anomaly_type": "No Data Exfiltration Anomalies Detected",
            "description": "No suspicious data exfiltration behavior was found for this employee.",
            "severity": "low",
            "detected_at": datetime.utcnow(),
        })

    return anomalies


# ============================================================================
# DEVICE & PREFERENCE CALCULATIONS
# ============================================================================
    """Get the most frequently used device"""
    employee_id = _coerce_uuid(employee_id)

    devices = (
        db.query(ActivityLog.device_name)
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.device_name.isnot(None)
        )
        .all()
    )

    devices = [d[0] for d in devices if d[0]]
    return Counter(devices).most_common(1)[0][0] if devices else None


def get_device_usage(db: Session, employee_id: str | UUID) -> dict:
    employee_id = _coerce_uuid(employee_id)

    device_events = (
        db.query(ActivityLog.device_name)
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.device_name.isnot(None)
        )
        .all()
    )

    device_names = [d[0] for d in device_events if d[0]]
    total_devices_used = len(set(device_names))
    primary_device = Counter(device_names).most_common(1)[0][0] if device_names else None

    daily_device_switches = (
        db.query(
            func.date(ActivityLog.timestamp).label("day"),
            ActivityLog.device_name,
        )
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.device_name.isnot(None),
        )
        .group_by(func.date(ActivityLog.timestamp), ActivityLog.device_name)
        .all()
    )

    switches_per_day: Dict[datetime, int] = {}
    for day, device_name in daily_device_switches:
        switches_per_day[day] = switches_per_day.get(day, 0) + 1

    average_device_switches_per_day = round(sum(switches_per_day.values()) / len(switches_per_day), 2) if switches_per_day else 0.0

    usb_activity_count = (
        db.query(func.count(ActivityLog.id))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type.in_([
                ActivityType.USB_CONNECTED,
                ActivityType.USB_REMOVED,
            ]),
        )
        .scalar() or 0
    )

    external_device_usage_count = (
        db.query(func.count(ActivityLog.id))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type == ActivityType.EXTERNAL_DEVICE_CONNECTED,
        )
        .scalar() or 0
    )

    trusted_device_events = [name for name in device_names if "trusted" in name.lower()]
    trusted_device_percentage = round((len(trusted_device_events) / len(device_names)) * 100, 2) if device_names else 0.0

    return {
        "employee_id": employee_id,
        "total_devices_used": total_devices_used,
        "primary_device": primary_device,
        "average_device_switches_per_day": average_device_switches_per_day,
        "usb_activity_count": usb_activity_count,
        "external_device_usage_count": external_device_usage_count,
        "trusted_device_percentage": trusted_device_percentage,
    }


def get_device_anomalies(db: Session, employee_id: str | UUID) -> list[dict]:
    employee_id = _coerce_uuid(employee_id)

    device_events = (
        db.query(ActivityLog.timestamp, ActivityLog.device_name, ActivityLog.activity_type)
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.device_name.isnot(None),
        )
        .all()
    )

    anomalies: list[dict] = []
    usb_activity_events = [row for row in device_events if row[2] in [ActivityType.USB_CONNECTED, ActivityType.USB_REMOVED]]
    unknown_devices = [row for row in device_events if row[1] and "unknown" in row[1].lower()]
    external_storage_events = [row for row in device_events if row[2] == ActivityType.EXTERNAL_DEVICE_CONNECTED]

    daily_devices: Dict[datetime, set[str]] = {}
    for ts, device_name, _ in device_events:
        day = ts.date()
        daily_devices.setdefault(day, set()).add(device_name)

    for ts, device_name, _ in usb_activity_events:
        anomalies.append({
            "employee_id": employee_id,
            "anomaly_type": "Unusual USB Activity",
            "device_name": device_name,
            "description": f"USB event for {device_name} detected.",
            "severity": "medium",
            "detected_at": ts,
        })

    for ts, device_name, _ in unknown_devices:
        anomalies.append({
            "employee_id": employee_id,
            "anomaly_type": "Unknown Device Connection",
            "device_name": device_name,
            "description": f"Unknown device connected: {device_name}.",
            "severity": "high",
            "detected_at": ts,
        })

    for day, devices in daily_devices.items():
        if len(devices) > 4:
            anomalies.append({
                "employee_id": employee_id,
                "anomaly_type": "Excessive Device Switching",
                "device_name": None,
                "description": f"{len(devices)} different devices used on {day.isoformat()}.",
                "severity": "medium",
                "detected_at": datetime.combine(day, datetime.min.time()),
            })

    if len(external_storage_events) > 5:
        anomalies.append({
            "employee_id": employee_id,
            "anomaly_type": "External Storage Usage Spike",
            "device_name": None,
            "description": f"{len(external_storage_events)} external storage connections detected.",
            "severity": "high",
            "detected_at": datetime.utcnow(),
        })

    unauthorized_devices = [row for row in device_events if row[1] and any(token in row[1].lower() for token in ["unauthorized", "untrusted", "blocked"])]
    for ts, device_name, _ in unauthorized_devices:
        anomalies.append({
            "employee_id": employee_id,
            "anomaly_type": "Unauthorized Device Usage",
            "device_name": device_name,
            "description": f"Unauthorized device usage detected: {device_name}.",
            "severity": "high",
            "detected_at": ts,
        })

    return anomalies


def get_preferred_device(db: Session, employee_id: str | UUID) -> Optional[str]:
    """Get the most frequently used device name"""
    employee_id = _coerce_uuid(employee_id)

    devices = (
        db.query(ActivityLog.device_name)
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.device_name.isnot(None)
        )
        .all()
    )

    devices = [d[0] for d in devices if d[0]]
    return Counter(devices).most_common(1)[0][0] if devices else None


def get_preferred_browser(db: Session, employee_id: str | UUID) -> Optional[str]:
    """Get the most frequently used browser"""
    employee_id = _coerce_uuid(employee_id)

    browsers = (
        db.query(ActivityLog.browser)
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.browser.isnot(None)
        )
        .all()
    )

    browsers = [b[0] for b in browsers if b[0]]
    return Counter(browsers).most_common(1)[0][0] if browsers else None


def get_preferred_operating_system(db: Session, employee_id: str | UUID) -> Optional[str]:
    """Get the most frequently used operating system"""
    employee_id = _coerce_uuid(employee_id)

    operating_systems = (
        db.query(ActivityLog.operating_system)
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.operating_system.isnot(None)
        )
        .all()
    )

    operating_systems = [os[0] for os in operating_systems if os[0]]
    return Counter(operating_systems).most_common(1)[0][0] if operating_systems else None


def get_preferred_ip_address(db: Session, employee_id: str | UUID) -> Optional[str]:
    """Get the most frequently used IP address"""
    employee_id = _coerce_uuid(employee_id)

    ips = (
        db.query(ActivityLog.ip_address)
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.ip_address.isnot(None)
        )
        .all()
    )

    ips = [ip[0] for ip in ips if ip[0]]
    return Counter(ips).most_common(1)[0][0] if ips else None


def get_preferred_location(db: Session, employee_id: str | UUID) -> Optional[str]:
    """Get the most frequently recorded location"""
    employee_id = _coerce_uuid(employee_id)

    locations = (
        db.query(ActivityLog.location)
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.location.isnot(None)
        )
        .all()
    )

    locations = [loc[0] for loc in locations if loc[0]]
    return Counter(locations).most_common(1)[0][0] if locations else None


# ============================================================================
# ACTIVITY FREQUENCY CALCULATIONS
# ============================================================================

def calculate_average_daily_activities(db: Session, employee_id: str | UUID) -> int:
    """
    Calculate average number of activities performed per day.
    
    Groups all activities by date and computes mean.
    """
    employee_id = _coerce_uuid(employee_id)

    activities = (
        db.query(ActivityLog.timestamp)
        .filter(ActivityLog.employee_id == employee_id)
        .all()
    )

    if not activities:
        return 0

    daily_counts = defaultdict(int)
    for activity in activities:
        day = activity[0].date()
        daily_counts[day] += 1

    return round(sum(daily_counts.values()) / len(daily_counts)) if daily_counts else 0


def calculate_average_weekly_activities(db: Session, employee_id: str | UUID) -> Optional[float]:
    """
    Calculate average activities per week over the last 30 days.
    """
    employee_id = _coerce_uuid(employee_id)

    thirty_days_ago = datetime.now() - timedelta(days=30)

    activities = (
        db.query(ActivityLog.timestamp)
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.timestamp >= thirty_days_ago
        )
        .all()
    )

    if not activities:
        return None

    activity_list = [a[0] for a in activities]
    
    # Group by week
    weekly_counts = defaultdict(int)
    for ts in activity_list:
        week_start = ts.date() - timedelta(days=ts.weekday())
        weekly_counts[week_start] += 1

    if not weekly_counts:
        return None

    return round(mean(weekly_counts.values()), 2)


def calculate_weekend_activity_percentage(db: Session, employee_id: str | UUID) -> float:
    """
    Calculate percentage of activities that occur on weekends.
    """
    employee_id = _coerce_uuid(employee_id)

    all_activities = (
        db.query(ActivityLog.timestamp)
        .filter(ActivityLog.employee_id == employee_id)
        .all()
    )

    if not all_activities:
        return 0.0

    timestamps = [a[0] for a in all_activities]
    weekend_count = sum(
        1 for ts in timestamps 
        if TimeBasedClassification.is_weekend(ts)
    )

    percentage = (weekend_count / len(timestamps)) * 100
    return round(percentage, 2)


def calculate_night_activity_percentage(db: Session, employee_id: str | UUID) -> float:
    """
    Calculate percentage of activities between 10 PM and 6 AM.
    """
    employee_id = _coerce_uuid(employee_id)

    all_activities = (
        db.query(ActivityLog.timestamp)
        .filter(ActivityLog.employee_id == employee_id)
        .all()
    )

    if not all_activities:
        return 0.0

    timestamps = [a[0] for a in all_activities]
    night_count = sum(
        1 for ts in timestamps 
        if TimeBasedClassification.is_night_activity(ts)
    )

    percentage = (night_count / len(timestamps)) * 100
    return round(percentage, 2)


def calculate_after_hours_activity_percentage(db: Session, employee_id: str | UUID) -> float:
    """
    Calculate percentage of activities outside business hours (9-5).
    """
    employee_id = _coerce_uuid(employee_id)

    all_activities = (
        db.query(ActivityLog.timestamp)
        .filter(ActivityLog.employee_id == employee_id)
        .all()
    )

    if not all_activities:
        return 0.0

    timestamps = [a[0] for a in all_activities]
    after_hours_count = sum(
        1 for ts in timestamps 
        if TimeBasedClassification.is_after_hours(ts)
    )

    percentage = (after_hours_count / len(timestamps)) * 100
    return round(percentage, 2)


# ============================================================================
# DEVICE & SECURITY BEHAVIOR CALCULATIONS
# ============================================================================

def calculate_usb_usage_frequency(db: Session, employee_id: str | UUID) -> int:
    """
    Count total USB connection/disconnection events.
    """
    employee_id = _coerce_uuid(employee_id)

    usb_events = (
        db.query(func.count(ActivityLog.id))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type.in_([
                ActivityType.USB_CONNECTED,
                ActivityType.USB_REMOVED,
                ActivityType.EXTERNAL_DEVICE_CONNECTED
            ])
        )
        .scalar()
    )

    return usb_events or 0


def calculate_cloud_upload_frequency(db: Session, employee_id: str | UUID) -> int:
    """
    Count cloud upload activities and sum total data uploaded.
    """
    employee_id = _coerce_uuid(employee_id)

    uploads = (
        db.query(func.count(ActivityLog.id))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type.in_([
                ActivityType.CLOUD_UPLOAD,
                ActivityType.FILE_UPLOAD
            ])
        )
        .scalar()
    )

    return uploads or 0


def calculate_sensitive_file_access_count(db: Session, employee_id: str | UUID) -> int:
    """
    Count sensitive file access events.
    """
    employee_id = _coerce_uuid(employee_id)

    sensitive_access = (
        db.query(func.count(ActivityLog.id))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type.in_([
                ActivityType.SENSITIVE_FILE_ACCESS,
                ActivityType.FILE_DOWNLOAD
            ])
        )
        .scalar()
    )

    return sensitive_access or 0


def calculate_failed_login_count(db: Session, employee_id: str | UUID, days_back: int = 30) -> int:
    """
    Count failed login attempts in the last N days.
    """
    employee_id = _coerce_uuid(employee_id)

    cutoff_date = datetime.now() - timedelta(days=days_back)

    failed_logins = (
        db.query(func.count(ActivityLog.id))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type == ActivityType.FAILED_LOGIN,
            ActivityLog.timestamp >= cutoff_date
        )
        .scalar()
    )

    return failed_logins or 0


def calculate_password_change_frequency(db: Session, employee_id: str | UUID, days_back: int = 90) -> int:
    """
    Count password change events in the last N days.
    """
    employee_id = _coerce_uuid(employee_id)

    cutoff_date = datetime.now() - timedelta(days=days_back)

    changes = (
        db.query(func.count(ActivityLog.id))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type.in_([
                ActivityType.PASSWORD_CHANGED,
                ActivityType.PASSWORD_RESET
            ]),
            ActivityLog.timestamp >= cutoff_date
        )
        .scalar()
    )

    return changes or 0


def calculate_vpn_usage_frequency(db: Session, employee_id: str | UUID) -> int:
    """
    Count VPN connection events.
    """
    employee_id = _coerce_uuid(employee_id)

    vpn_events = (
        db.query(func.count(ActivityLog.id))
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.vpn_used == True
        )
        .scalar()
    )

    return vpn_events or 0


# ============================================================================
# BEHAVIORAL PATTERN CALCULATIONS
# ============================================================================

def get_most_active_day(db: Session, employee_id: str | UUID) -> Optional[str]:
    """
    Find the day of week with most activities.
    """
    employee_id = _coerce_uuid(employee_id)

    activities = (
        db.query(ActivityLog.timestamp)
        .filter(ActivityLog.employee_id == employee_id)
        .all()
    )

    if not activities:
        return None

    timestamps = [a[0] for a in activities]
    distribution = BehavioralMetrics.calculate_daily_distribution(timestamps)
    
    if distribution:
        return max(distribution, key=distribution.get)
    return None


def get_least_active_day(db: Session, employee_id: str | UUID) -> Optional[str]:
    """
    Find the day of week with least activities.
    """
    employee_id = _coerce_uuid(employee_id)

    activities = (
        db.query(ActivityLog.timestamp)
        .filter(ActivityLog.employee_id == employee_id)
        .all()
    )

    if not activities:
        return None

    timestamps = [a[0] for a in activities]
    distribution = BehavioralMetrics.calculate_daily_distribution(timestamps)
    
    if distribution:
        return min(distribution, key=distribution.get)
    return None


def get_most_common_activity_type(db: Session, employee_id: str | UUID) -> Optional[str]:
    """
    Find the most frequently performed activity type.
    """
    employee_id = _coerce_uuid(employee_id)

    activities = (
        db.query(ActivityLog.activity_type)
        .filter(ActivityLog.employee_id == employee_id)
        .all()
    )

    if not activities:
        return None

    activity_types = [a[0].value for a in activities if a[0]]
    counter = Counter(activity_types)
    
    if counter:
        return counter.most_common(1)[0][0]
    return None


def calculate_behavior_consistency_score(db: Session, employee_id: str | UUID) -> float:
    """
    Calculate behavior consistency (0-100).
    
    Low variance in activity patterns = high consistency.
    Uses login hour variance as primary metric.
    """
    employee_id = _coerce_uuid(employee_id)

    logins = (
        db.query(ActivityLog.timestamp)
        .filter(
            ActivityLog.employee_id == employee_id,
            ActivityLog.activity_type == ActivityType.LOGIN,
        )
        .all()
    )

    if len(logins) < 2:
        return 100.0

    timestamps = [log[0] for log in logins]
    hours = []
    
    for ts in timestamps:
        decimal_hour = ts.hour + ts.minute / 60 + ts.second / 3600
        hours.append(decimal_hour)

    return BehavioralMetrics.calculate_consistency_score(hours)


def calculate_overall_profile_score(
    consistency_score: float,
    risk_factors: Dict[str, any]
) -> float:
    """
    Calculate overall behavior profile score (0-100).
    
    High = predictable, low-risk behavior
    Low = unpredictable, high-risk behavior
    """
    # Start with consistency
    score = consistency_score * 0.4
    
    # Deduct for risk factors
    risk_deductions = 0.0
    
    if risk_factors.get("high_after_hours_activity"):
        risk_deductions += 15
    
    if risk_factors.get("unusual_device_count"):
        risk_deductions += 10
    
    if risk_factors.get("high_failed_logins"):
        risk_deductions += 20
    
    if risk_factors.get("unusual_data_transfer"):
        risk_deductions += 15
    
    final_score = score - risk_deductions
    return round(max(0, min(100, final_score)), 2)


def create_or_update_behavior_profile(
    db: Session,
    employee_id: str | UUID,
):
    """
    Creates or updates the employee's behavior profile.
    """

    employee_id = _coerce_uuid(employee_id)

    avg_login = calculate_average_login_hour(db, employee_id)

    preferred_device = get_preferred_device(db, employee_id)

    preferred_browser = get_preferred_browser(db, employee_id)

    preferred_os = get_preferred_operating_system(db, employee_id)

    avg_daily = calculate_average_daily_activities(db, employee_id)

    profile = (
        db.query(BehaviorProfile)
        .filter(BehaviorProfile.employee_id == employee_id)
        .first()
    )

    if profile:

        profile.avg_login_hour = avg_login
        profile.preferred_device = preferred_device
        profile.preferred_browser = preferred_browser
        profile.preferred_operating_system = preferred_os
        profile.avg_daily_activities = avg_daily

    else:

        profile = BehaviorProfile(
            employee_id=employee_id,
            avg_login_hour=avg_login,
            preferred_device=preferred_device,
            preferred_browser=preferred_browser,
            preferred_operating_system=preferred_os,
            avg_daily_activities=avg_daily,
            profile_score=100.0,
        )

        db.add(profile)

    db.commit()
    db.refresh(profile)

    return profile