from datetime import datetime
from collections import defaultdict

import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


def parse_date(value):
    if value is None:
        return None

    if isinstance(value, datetime):
        return value

    value = str(value).strip()

    formats = [
        "%m/%d/%Y %H:%M:%S",
        "%m/%d/%Y %H:%M",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d",
    ]

    for date_format in formats:
        try:
            return datetime.strptime(value, date_format)
        except ValueError:
            continue

    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def create_employee_features(
    employee_id,
    login_activities,
    file_activities,
    email_activities=None,
    device_activities=None,
):
    if email_activities is None:
        email_activities = []

    if device_activities is None:
        device_activities = []

    login_count = len(login_activities)
    file_count = len(file_activities)
    email_count = len(email_activities)
    device_count = len(device_activities)

    after_hours_count = 0
    unique_devices = set()
    unique_files = set()

    for activity in login_activities:
        date_value = parse_date(
            getattr(activity, "date", None)
            or getattr(activity, "login_time", None)
            or getattr(activity, "timestamp", None)
        )

        if date_value:
            if date_value.hour < 7 or date_value.hour >= 19:
                after_hours_count += 1

        device = (
            getattr(activity, "pc", None)
            or getattr(activity, "device_name", None)
            or getattr(activity, "device", None)
        )

        if device:
            unique_devices.add(str(device))

    for activity in file_activities:
        filename = (
            getattr(activity, "filename", None)
            or getattr(activity, "file_name", None)
            or getattr(activity, "resource", None)
        )

        if filename:
            unique_files.add(str(filename))

    total_activities = (
        login_count
        + file_count
        + email_count
        + device_count
    )

    return {
        "employee_id": str(employee_id),
        "login_count": login_count,
        "file_count": file_count,
        "email_count": email_count,
        "device_count": device_count,
        "after_hours_count": after_hours_count,
        "unique_devices": len(unique_devices),
        "unique_files": len(unique_files),
        "total_activities": total_activities,
    }


def create_feature_matrix(employee_features):
    matrix = []

    for employee in employee_features:
        matrix.append(
            [
                employee["login_count"],
                employee["file_count"],
                employee["email_count"],
                employee["device_count"],
                employee["after_hours_count"],
                employee["unique_devices"],
                employee["unique_files"],
                employee["total_activities"],
            ]
        )

    if len(matrix) == 0:
        return np.empty((0, 8))

    return np.array(
        matrix,
        dtype=float,
    )


def detect_employee_anomalies(employee_features):
    if len(employee_features) == 0:
        return []

    feature_matrix = create_feature_matrix(
        employee_features
    )

    if len(employee_features) < 3:
        maximum_activity = max(
            employee["total_activities"]
            for employee in employee_features
        )

        if maximum_activity == 0:
            maximum_activity = 1

        results = []

        for employee in employee_features:
            activity_ratio = (
                employee["total_activities"]
                / maximum_activity
            )

            if employee["login_count"] > 0:
                after_hours_ratio = (
                    employee["after_hours_count"]
                    / employee["login_count"]
                )
            else:
                after_hours_ratio = 0

            anomaly_score = round(
                min(
                    100,
                    activity_ratio * 60
                    + after_hours_ratio * 40,
                ),
                2,
            )

            results.append(
                {
                    **employee,
                    "anomaly_score": anomaly_score,
                    "is_anomaly": anomaly_score >= 65,
                }
            )

        return results

    scaler = StandardScaler()

    scaled_features = scaler.fit_transform(
        feature_matrix
    )

    model = IsolationForest(
        n_estimators=200,
        contamination=0.1,
        random_state=42,
    )

    predictions = model.fit_predict(
        scaled_features
    )

    raw_scores = -model.score_samples(
        scaled_features
    )

    minimum_score = float(
        np.min(raw_scores)
    )

    maximum_score = float(
        np.max(raw_scores)
    )

    results = []

    for index, employee in enumerate(
        employee_features
    ):
        if maximum_score == minimum_score:
            anomaly_score = 20.0
        else:
            anomaly_score = (
                (
                    float(raw_scores[index])
                    - minimum_score
                )
                /
                (
                    maximum_score
                    - minimum_score
                )
            ) * 100

        anomaly_score = round(
            max(
                0,
                min(
                    100,
                    anomaly_score,
                ),
            ),
            2,
        )

        is_anomaly = (
            predictions[index] == -1
            or anomaly_score >= 65
        )

        results.append(
            {
                **employee,
                "anomaly_score": anomaly_score,
                "is_anomaly": bool(
                    is_anomaly
                ),
            }
        )

    return results


def get_behavioral_status(
    anomaly_score
):
    if anomaly_score >= 80:
        return "Critical"

    if anomaly_score >= 65:
        return "High"

    if anomaly_score >= 40:
        return "Medium"

    return "Normal"


def get_behavioral_summary(
    employee,
    anomaly_score,
):
    indicators = []

    if employee["after_hours_count"] > 0:
        indicators.append(
            f'{employee["after_hours_count"]} after-hours logins'
        )

    if employee["unique_devices"] > 3:
        indicators.append(
            f'{employee["unique_devices"]} devices used'
        )

    if employee["unique_files"] > 50:
        indicators.append(
            f'{employee["unique_files"]} unique files accessed'
        )

    if (
        employee["file_count"]
        >
        employee["login_count"] * 10
    ):
        indicators.append(
            "high file activity"
        )

    status = get_behavioral_status(
        anomaly_score
    )

    if len(indicators) == 0:
        return (
            f"{status} behavioral pattern"
        )

    return (
        f"{status} behavioral pattern: "
        + ", ".join(indicators)
    )


def create_activity_timeline(
    login_activities,
    file_activities,
):
    timeline = []

    for activity in login_activities:
        date_value = (
            getattr(activity, "date", None)
            or getattr(
                activity,
                "login_time",
                None,
            )
            or getattr(
                activity,
                "timestamp",
                None,
            )
        )

        timeline.append(
            {
                "type": "Login Activity",
                "date": (
                    date_value.isoformat()
                    if hasattr(
                        date_value,
                        "isoformat",
                    )
                    else str(
                        date_value
                        or ""
                    )
                ),
                "activity": str(
                    getattr(
                        activity,
                        "activity",
                        None,
                    )
                    or getattr(
                        activity,
                        "action",
                        None,
                    )
                    or "Login Event"
                ),
                "device": str(
                    getattr(
                        activity,
                        "pc",
                        None,
                    )
                    or getattr(
                        activity,
                        "device_name",
                        None,
                    )
                    or "Unknown"
                ),
            }
        )

    for activity in file_activities:
        date_value = (
            getattr(activity, "date", None)
            or getattr(
                activity,
                "access_time",
                None,
            )
            or getattr(
                activity,
                "timestamp",
                None,
            )
        )

        timeline.append(
            {
                "type": "File Activity",
                "date": (
                    date_value.isoformat()
                    if hasattr(
                        date_value,
                        "isoformat",
                    )
                    else str(
                        date_value
                        or ""
                    )
                ),
                "activity": str(
                    getattr(
                        activity,
                        "activity",
                        None,
                    )
                    or getattr(
                        activity,
                        "action",
                        None,
                    )
                    or "File Access"
                ),
                "file": str(
                    getattr(
                        activity,
                        "filename",
                        None,
                    )
                    or getattr(
                        activity,
                        "file_name",
                        None,
                    )
                    or "Unknown"
                ),
                "device": str(
                    getattr(
                        activity,
                        "pc",
                        None,
                    )
                    or "Unknown"
                ),
            }
        )

    timeline.sort(
        key=lambda item: item["date"],
        reverse=True,
    )

    return timeline


def group_activities_by_day(
    activities
):
    grouped = defaultdict(int)

    for activity in activities:
        date_value = (
            getattr(
                activity,
                "date",
                None,
            )
            or getattr(
                activity,
                "login_time",
                None,
            )
            or getattr(
                activity,
                "timestamp",
                None,
            )
        )

        parsed_date = parse_date(
            date_value
        )

        if parsed_date:
            date_key = (
                parsed_date.strftime(
                    "%Y-%m-%d"
                )
            )

            grouped[date_key] += 1

    return [
        {
            "date": date,
            "count": count,
        }
        for date, count
        in sorted(
            grouped.items()
        )
    ]