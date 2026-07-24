from datetime import datetime


def calculate_behavioral_features(
    login_count=0,
    file_access_count=0,
    failed_login_count=0,
    after_hours_count=0,
    unique_devices=0,
    unique_files=0
):
    return [
        float(login_count),
        float(file_access_count),
        float(failed_login_count),
        float(after_hours_count),
        float(unique_devices),
        float(unique_files)
    ]


def is_after_hours(dt: datetime):
    return dt.hour < 7 or dt.hour > 20


def get_behavior_label(score: float):
    if score >= 80:
        return "Critical"
    if score >= 60:
        return "High"
    if score >= 30:
        return "Medium"
    return "Low"