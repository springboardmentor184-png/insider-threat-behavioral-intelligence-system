def calculate_risk_score(
    anomaly_score,
    login_count,
    file_count,
    email_count=0,
    device_count=0,
    after_hours_count=0,
    alert_count=0,
    investigation_count=0,
):
    login_count = login_count or 0
    file_count = file_count or 0
    email_count = email_count or 0
    device_count = device_count or 0
    after_hours_count = after_hours_count or 0
    alert_count = alert_count or 0
    investigation_count = investigation_count or 0
    anomaly_score = anomaly_score or 0

    behavioral_anomalies = min(
        35,
        round(
            (float(anomaly_score) / 100) * 35,
            2,
        ),
    )

    if login_count > 0:
        device_ratio = (
            device_count / login_count
        )
    else:
        device_ratio = device_count

    privilege_misuse = min(
        25,
        round(
            device_ratio * 25,
            2,
        ),
    )

    expected_file_activity = max(
        1,
        login_count * 5,
    )

    data_access_violations = min(
        20,
        round(
            (
                file_count
                / expected_file_activity
            )
            * 20,
            2,
        ),
    )

    if login_count > 0:
        after_hours_ratio = (
            after_hours_count
            / login_count
        )
    else:
        after_hours_ratio = 0

    access_pattern_deviations = min(
        10,
        round(
            after_hours_ratio * 10,
            2,
        ),
    )

    historical_security_events = min(
        10,
        round(
            alert_count * 2
            + investigation_count * 3
            + (
                email_count
                / max(
                    1,
                    login_count * 20,
                )
            ),
            2,
        ),
    )

    risk_score = round(
        min(
            100,
            behavioral_anomalies
            + privilege_misuse
            + data_access_violations
            + access_pattern_deviations
            + historical_security_events,
        ),
        2,
    )

    risk_level = get_risk_level(
        risk_score
    )

    recommendation = (
        get_risk_recommendation(
            risk_level
        )
    )

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "components": {
            "behavioral_anomalies": (
                behavioral_anomalies
            ),
            "privilege_misuse": (
                privilege_misuse
            ),
            "data_access_violations": (
                data_access_violations
            ),
            "access_pattern_deviations": (
                access_pattern_deviations
            ),
            "historical_security_events": (
                historical_security_events
            ),
        },
    }


def get_risk_level(
    risk_score
):
    if risk_score >= 80:
        return "Critical"

    if risk_score >= 60:
        return "High"

    if risk_score >= 35:
        return "Medium"

    return "Low"


def get_risk_recommendation(
    risk_level
):
    recommendations = {
        "Critical": (
            "Immediately escalate the employee "
            "to the security team, create an "
            "investigation, preserve activity "
            "evidence, and review access "
            "privileges."
        ),
        "High": (
            "Create a high-priority "
            "investigation and review recent "
            "login, file, device, and "
            "behavioral activities."
        ),
        "Medium": (
            "Monitor the employee closely "
            "and review behavioral changes "
            "during the next analysis cycle."
        ),
        "Low": (
            "Continue normal monitoring and "
            "update the behavioral baseline "
            "when new activity data is "
            "available."
        ),
    }

    return recommendations.get(
        risk_level,
        recommendations["Low"],
    )


def get_risk_color(
    risk_level
):
    colors = {
        "Critical": "#dc2626",
        "High": "#ea580c",
        "Medium": "#ca8a04",
        "Low": "#16a34a",
    }

    return colors.get(
        risk_level,
        "#6b7280",
    )


def create_risk_history(
    current_score,
    previous_scores=None,
):
    if previous_scores is None:
        previous_scores = []

    history = []

    for index, score in enumerate(
        previous_scores
    ):
        history.append(
            {
                "period": (
                    f"Previous {index + 1}"
                ),
                "risk_score": round(
                    float(score),
                    2,
                ),
                "risk_level": (
                    get_risk_level(
                        float(score)
                    )
                ),
            }
        )

    history.append(
        {
            "period": "Current",
            "risk_score": round(
                float(current_score),
                2,
            ),
            "risk_level": get_risk_level(
                float(current_score)
            ),
        }
    )

    return history