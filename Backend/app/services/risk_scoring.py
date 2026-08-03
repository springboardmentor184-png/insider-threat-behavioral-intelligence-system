# app/services/risk_scoring.py

from typing import Dict


WEIGHTS = {
    "behavioral_anomalies": 35,
    "privilege_misuse": 25,
    "data_access_violations": 20,
    "access_pattern_deviations": 10,
    "historical_security_events": 10,
}


def calculate_risk_score(
    category_scores: Dict,
    ml_prediction: str
) -> Dict:
    """
    Weighted Insider Risk Scoring Engine.
    """

    weighted_breakdown = {}

    # --------------------------------------
    # Historical Security Events
    # --------------------------------------
    historical_score = 100 if ml_prediction == "Anomaly" else 0

    category_scores["historical_security_events"] = historical_score

    total_score = 0

    for category, weight in WEIGHTS.items():

        score = category_scores.get(category, 0)

        weighted = (score * weight) / 100

        weighted_breakdown[category] = round(weighted, 2)

        total_score += weighted

    risk_score = round(total_score)

    # -----------------------------
    # Risk Levels
    # -----------------------------
    if risk_score < 25:
        risk_level = "Low"

    elif risk_score < 50:
        risk_level = "Medium"

    elif risk_score < 75:
        risk_level = "High"

    else:
        risk_level = "Critical"

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "score_breakdown": weighted_breakdown,
    }