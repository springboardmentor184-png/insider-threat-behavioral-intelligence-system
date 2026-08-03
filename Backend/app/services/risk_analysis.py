# app/services/risk_analysis.py

from typing import Dict, List


def generate_risk_analysis(
    risk_level: str,
    triggered_rules: List[str]
) -> Dict:
    """
    Generate investigation-ready risk analysis based on
    calculated risk score and triggered business rules.
    """

    # ---------------------------------
    # Threat Severity
    # ---------------------------------
    threat_severity = risk_level

    # ---------------------------------
    # Risk Trend
    # Future versions can compare
    # historical risk scores.
    # ---------------------------------
    risk_trend = "Stable"

    # ---------------------------------
    # Recommendation
    # ---------------------------------
    if risk_level == "Low":
        recommendation = "Continue Monitoring"

    elif risk_level == "Medium":
        recommendation = "Review Employee Activity"

    elif risk_level == "High":
        recommendation = "Start Investigation"

    else:
        recommendation = "Immediate Security Response"

    # ---------------------------------
    # Risk Summary
    # ---------------------------------
    if risk_level == "Low":

        risk_summary = (
            "Employee behaviour matches the established behavioural baseline. "
            "No significant insider threat indicators were detected."
        )

    elif risk_level == "Medium":

        risk_summary = (
            "Employee behaviour shows moderate deviations from the normal baseline. "
            "Continue monitoring and review recent activities."
        )

    elif risk_level == "High":

        risk_summary = (
            "Employee behaviour indicates multiple insider threat indicators. "
            "A security investigation is recommended."
        )

    else:

        risk_summary = (
            "Employee behaviour deviates significantly from the established behavioural baseline. "
            "Multiple high-risk indicators have been detected requiring immediate investigation."
        )

    return {

        "threat_severity": threat_severity,

        "risk_trend": risk_trend,

        "recommendation": recommendation,

        "risk_summary": risk_summary,

    }