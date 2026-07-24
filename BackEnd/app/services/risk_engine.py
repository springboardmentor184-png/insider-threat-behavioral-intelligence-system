def calculate_risk_score(
    behavioral_anomalies=0,
    privilege_misuse=0,
    data_access_violations=0,
    access_pattern_deviations=0,
    historical_security_events=0
):
    score = (
        behavioral_anomalies * 0.35
        + privilege_misuse * 0.25
        + data_access_violations * 0.20
        + access_pattern_deviations * 0.10
        + historical_security_events * 0.10
    )

    score = max(0, min(100, score))

    if score >= 80:
        level = "Critical"
    elif score >= 60:
        level = "High"
    elif score >= 30:
        level = "Medium"
    else:
        level = "Low"

    return {
        "score": round(score, 2),
        "level": level
    }


def calculate_employee_risk(
    anomaly_count=0,
    file_access_count=0,
    failed_logins=0,
    after_hours_activity=0,
    historical_events=0
):
    behavioral_anomalies = min(anomaly_count * 10, 100)
    privilege_misuse = min(failed_logins * 15, 100)
    data_access_violations = min(file_access_count * 5, 100)
    access_pattern_deviations = min(after_hours_activity * 10, 100)
    historical_security_events = min(historical_events * 10, 100)

    return calculate_risk_score(
        behavioral_anomalies,
        privilege_misuse,
        data_access_violations,
        access_pattern_deviations,
        historical_security_events
    )