from typing import Dict

RISK_WEIGHTS = {
    "behavioral_anomalies": 0.35,
    "privilege_misuse": 0.25,
    "data_access_violations": 0.20,
    "access_pattern_deviations": 0.10,
    "historical_security_events": 0.10,
}


def calculate_risk_score(
    behavioral_anomalies: float,
    privilege_misuse: float,
    data_access_violations: float,
    access_pattern_deviations: float,
    historical_security_events: float,
) -> Dict:
    score = (
        behavioral_anomalies * RISK_WEIGHTS["behavioral_anomalies"]
        + privilege_misuse * RISK_WEIGHTS["privilege_misuse"]
        + data_access_violations * RISK_WEIGHTS["data_access_violations"]
        + access_pattern_deviations * RISK_WEIGHTS["access_pattern_deviations"]
        + historical_security_events * RISK_WEIGHTS["historical_security_events"]
    )

    if score >= 80:
        level = "Critical"
    elif score >= 60:
        level = "High"
    elif score >= 40:
        level = "Medium"
    else:
        level = "Low"

    return {
        "risk_score": round(score, 2),
        "risk_level": level,
    }