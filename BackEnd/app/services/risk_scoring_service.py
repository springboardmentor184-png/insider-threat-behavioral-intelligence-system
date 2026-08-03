from datetime import datetime, timedelta


def get_risk_level(score):
    if score >= 80:
        return "Critical"
    if score >= 60:
        return "High"
    if score >= 30:
        return "Medium"
    return "Low"


def calculate_risk_score(
    login_count=0,
    file_access_count=0,
    email_count=0,
    device_count=0,
    anomaly_count=0,
    alert_count=0,
):
    login_score = min(login_count * 2, 15)
    file_score = min(file_access_count * 0.05, 20)
    email_score = min(email_count * 0.01, 10)
    device_score = min(device_count * 2, 10)
    anomaly_score = min(anomaly_count * 12, 30)
    alert_score = min(alert_count * 5, 15)

    total_score = (
        login_score
        + file_score
        + email_score
        + device_score
        + anomaly_score
        + alert_score
    )

    return round(min(total_score, 100), 2)


def build_risk_factors(
    login_count,
    file_access_count,
    email_count,
    device_count,
    anomaly_count,
    alert_count,
):
    factors = []

    if login_count >= 10:
        factors.append(
            {
                "factor": "High Login Activity",
                "severity": "Medium",
                "score": min(login_count * 2, 15),
                "description": f"{login_count} login activities detected",
            }
        )

    if file_access_count >= 100:
        factors.append(
            {
                "factor": "High File Access",
                "severity": "High",
                "score": min(file_access_count * 0.05, 20),
                "description": f"{file_access_count} file access events detected",
            }
        )

    if email_count >= 100:
        factors.append(
            {
                "factor": "High Email Activity",
                "severity": "Medium",
                "score": min(email_count * 0.01, 10),
                "description": f"{email_count} email activities detected",
            }
        )

    if device_count >= 5:
        factors.append(
            {
                "factor": "Multiple Device Activity",
                "severity": "Medium",
                "score": min(device_count * 2, 10),
                "description": f"{device_count} device activities detected",
            }
        )

    if anomaly_count > 0:
        factors.append(
            {
                "factor": "Behavioral Anomalies",
                "severity": "High",
                "score": min(anomaly_count * 12, 30),
                "description": f"{anomaly_count} anomalous activities detected",
            }
        )

    if alert_count > 0:
        factors.append(
            {
                "factor": "Security Alerts",
                "severity": "High",
                "score": min(alert_count * 5, 15),
                "description": f"{alert_count} security alerts detected",
            }
        )

    if not factors:
        factors.append(
            {
                "factor": "Normal Behavior",
                "severity": "Low",
                "score": 0,
                "description": "No significant risk indicators detected",
            }
        )

    return factors


def build_risk_result(
    employee_id,
    employee_name,
    login_count=0,
    file_access_count=0,
    email_count=0,
    device_count=0,
    anomaly_count=0,
    alert_count=0,
):
    score = calculate_risk_score(
        login_count=login_count,
        file_access_count=file_access_count,
        email_count=email_count,
        device_count=device_count,
        anomaly_count=anomaly_count,
        alert_count=alert_count,
    )

    return {
        "employee_id": employee_id,
        "employee_name": employee_name,
        "risk_score": score,
        "risk_level": get_risk_level(score),
        "risk_factors": build_risk_factors(
            login_count=login_count,
            file_access_count=file_access_count,
            email_count=email_count,
            device_count=device_count,
            anomaly_count=anomaly_count,
            alert_count=alert_count,
        ),
        "activity_summary": {
            "login_count": login_count,
            "file_access_count": file_access_count,
            "email_count": email_count,
            "device_count": device_count,
            "anomaly_count": anomaly_count,
            "alert_count": alert_count,
        },
        "calculated_at": datetime.now().isoformat(),
    }


def get_risk_trend(current_score):
    now = datetime.now()

    return [
        {
            "date": (now - timedelta(days=6)).strftime("%Y-%m-%d"),
            "score": max(0, round(current_score - 18, 2)),
        },
        {
            "date": (now - timedelta(days=5)).strftime("%Y-%m-%d"),
            "score": max(0, round(current_score - 14, 2)),
        },
        {
            "date": (now - timedelta(days=4)).strftime("%Y-%m-%d"),
            "score": max(0, round(current_score - 10, 2)),
        },
        {
            "date": (now - timedelta(days=3)).strftime("%Y-%m-%d"),
            "score": max(0, round(current_score - 7, 2)),
        },
        {
            "date": (now - timedelta(days=2)).strftime("%Y-%m-%d"),
            "score": max(0, round(current_score - 4, 2)),
        },
        {
            "date": (now - timedelta(days=1)).strftime("%Y-%m-%d"),
            "score": max(0, round(current_score - 2, 2)),
        },
        {
            "date": now.strftime("%Y-%m-%d"),
            "score": current_score,
        },
    ]