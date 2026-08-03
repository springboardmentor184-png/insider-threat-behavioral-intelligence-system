# app/services/rule_engine.py

from typing import Dict


def evaluate_rules(data: dict) -> Dict:
    """
    Evaluate insider threat business rules.
    Returns triggered rules along with their risk categories.
    """

    triggered_rules = []

    category_scores = {
        "behavioral_anomalies": 0,
        "privilege_misuse": 0,
        "data_access_violations": 0,
        "access_pattern_deviations": 0,
    }

    # --------------------------------------
    # Access Pattern Deviations
    # --------------------------------------
    if data["avg_failed_logins"] >= 8:
        triggered_rules.append("Excessive Failed Logins")
        category_scores["access_pattern_deviations"] = 100

    # --------------------------------------
    # Data Access Violations
    # --------------------------------------
    if data["avg_files_downloaded"] >= 400:
        triggered_rules.append("Mass File Download")
        category_scores["data_access_violations"] = 100

    # --------------------------------------
    # Behavioral Anomalies
    # --------------------------------------
    if data["avg_emails_sent"] >= 80:
        triggered_rules.append("Abnormal Email Activity")
        category_scores["behavioral_anomalies"] = max(
            category_scores["behavioral_anomalies"], 50
        )

    if data["after_hours_rate"] >= 80:
        triggered_rules.append("After Hours Activity")
        category_scores["behavioral_anomalies"] = 100

    # --------------------------------------
    # Privilege Misuse
    # --------------------------------------
    if data["usb_usage_rate"] >= 80:
        triggered_rules.append("Frequent USB Usage")
        category_scores["privilege_misuse"] = 100

    return {
        "risk_flags": len(triggered_rules),
        "triggered": len(triggered_rules) >= 2,
        "triggered_rules": triggered_rules,
        "category_scores": category_scores,
    }