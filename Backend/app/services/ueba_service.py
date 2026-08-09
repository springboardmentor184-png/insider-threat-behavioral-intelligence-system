# app/services/ueba_service.py

from typing import Dict


def generate_ueba_intelligence(
    employee,
    prediction: Dict
) -> Dict:
    """
    Generate UEBA (User & Entity Behavior Analytics)
    intelligence for an employee based on AI prediction.
    """

    risk_score = prediction["risk_score"]
    risk_level = prediction["risk_level"]

    # ---------------------------------------
    # User Behaviour Analytics
    # ---------------------------------------

    if risk_score >= 80:
        behaviour_status = "Highly Suspicious"

    elif risk_score >= 50:
        behaviour_status = "Suspicious"

    elif risk_score >= 25:
        behaviour_status = "Needs Monitoring"

    else:
        behaviour_status = "Normal"

    # ---------------------------------------
    # Behaviour Trend
    # (Version 1)
    # ---------------------------------------

    if risk_level in ["High", "Critical"]:
        behaviour_trend = "Increasing"

    else:
        behaviour_trend = "Stable"

    # ---------------------------------------
    # Entity Behaviour Analytics
    # (Department-based)
    # ---------------------------------------

    high_risk_departments = [
        "IT",
        "Finance",
        "Security",
        "Operations"
    ]

    if employee.department in high_risk_departments:
        department_risk = "High"
    else:
        department_risk = "Normal"

    # ---------------------------------------
    # Peer Group Comparison
    # (Version 1 Placeholder)
    # ---------------------------------------

    if risk_score >= 60:
        peer_group_status = "Above Department Average"
    else:
        peer_group_status = "Within Department Average"

    # ---------------------------------------
    # Return Intelligence
    # ---------------------------------------

    return {
        "employee_id": employee.employee_id,
        "full_name": employee.full_name,
        "department": employee.department,
        "role": employee.role,

        "behaviour_status": behaviour_status,
        "behaviour_score": risk_score,
        "behaviour_trend": behaviour_trend,

        "department_risk": department_risk,
        "peer_group_status": peer_group_status,

        "prediction": prediction["prediction"],
        "risk_level": prediction["risk_level"],
        "threat_severity": prediction["threat_severity"],
        "detection_method": prediction["detection_method"]
    }