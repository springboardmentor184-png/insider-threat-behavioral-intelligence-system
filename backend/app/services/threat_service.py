from collections import Counter
from datetime import datetime
from typing import Protocol
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.risk import RiskAssessment, RiskLevel
from app.services.behavior_service import (
    get_behavior_baseline,
    get_login_anomalies,
    get_file_access_anomalies,
    get_device_anomalies,
    get_privilege_anomalies,
    get_data_exfiltration_anomalies,
)


def _coerce_uuid(value: str | UUID) -> UUID:
    return value if isinstance(value, UUID) else UUID(str(value))


def _severity_weight(severity: str) -> float:
    severity_key = (severity or "").strip().lower()
    return {
        "critical": 35.0,
        "high": 20.0,
        "medium": 10.0,
        "low": 4.0,
    }.get(severity_key, 2.0)


def _threat_level(score: float) -> str:
    if score >= 75.0:
        return RiskLevel.CRITICAL.value
    if score >= 50.0:
        return RiskLevel.HIGH.value
    if score >= 25.0:
        return RiskLevel.MEDIUM.value
    return RiskLevel.LOW.value


def _build_recommendation(level: str) -> str:
    return {
        RiskLevel.CRITICAL.value: "Investigate immediately and escalate to security operations.",
        RiskLevel.HIGH.value: "Review recent activity and apply containment controls as needed.",
        RiskLevel.MEDIUM.value: "Monitor the employee closely and validate suspicious events.",
        RiskLevel.LOW.value: "Continue normal monitoring and review only if new anomalies appear.",
    }[level]


def _assemble_explanation(baseline: dict, anomaly_counts: dict) -> str:
    details = []
    if anomaly_counts.get("login"):
        details.append(f"Detected {anomaly_counts['login']} login anomaly events.")
    if anomaly_counts.get("file"):
        details.append(f"Detected {anomaly_counts['file']} file access anomaly events.")
    if anomaly_counts.get("device"):
        details.append(f"Detected {anomaly_counts['device']} device anomaly events.")
    if anomaly_counts.get("privilege"):
        details.append(f"Detected {anomaly_counts['privilege']} privilege anomaly events.")
    if anomaly_counts.get("exfiltration"):
        details.append(f"Detected {anomaly_counts['exfiltration']} data exfiltration anomaly events.")

    baseline_notes = []
    if baseline.get("average_login_hour") is not None:
        login_hour = baseline["average_login_hour"]
        if login_hour < 6 or login_hour > 20:
            baseline_notes.append("Baseline login behavior is outside normal business hours.")
    if baseline.get("average_file_downloads", 0.0) > 10.0:
        baseline_notes.append("Baseline file download volume is higher than expected.")
    if baseline.get("average_usb_activities", 0.0) > 10.0:
        baseline_notes.append("Baseline USB activity is elevated.")

    if not details and not baseline_notes:
        return "No significant threat indicators were identified across the analyzed behavior endpoints."

    return " ".join(details + baseline_notes)


def _confidence_from_score(score: float, anomaly_count: int) -> float:
    base_confidence = 0.55 if anomaly_count else 0.35
    bonus = min(0.40, anomaly_count * 0.05)
    confidence = min(0.95, base_confidence + bonus + (score / 400.0))
    return round(confidence, 2)


def analyze_employee_threat(db: Session, employee_id: str | UUID) -> RiskAssessment:
    employee_id = _coerce_uuid(employee_id)

    baseline = get_behavior_baseline(db, employee_id)
    login_anomalies = get_login_anomalies(db, employee_id)
    file_anomalies = get_file_access_anomalies(db, employee_id)
    device_anomalies = get_device_anomalies(db, employee_id)
    privilege_anomalies = get_privilege_anomalies(db, employee_id)
    data_exfiltration_anomalies = get_data_exfiltration_anomalies(db, employee_id)

    anomaly_collections = {
        "login": login_anomalies,
        "file": file_anomalies,
        "device": device_anomalies,
        "privilege": privilege_anomalies,
        "exfiltration": data_exfiltration_anomalies,
    }

    anomaly_count = sum(len(events) for events in anomaly_collections.values())
    severity_score = 0.0
    anomaly_types = Counter()
    for events in anomaly_collections.values():
        for anomaly in events:
            severity_score += _severity_weight(anomaly.get("severity"))
            anomaly_types[anomaly.get("anomaly_type") or "Unknown"] += 1

    baseline_score = 0.0
    if baseline.get("average_login_hour") is not None and (baseline["average_login_hour"] < 6 or baseline["average_login_hour"] > 20):
        baseline_score += 5.0
    if baseline.get("average_file_downloads", 0.0) > 10.0:
        baseline_score += 5.0
    if baseline.get("average_usb_activities", 0.0) > 8.0:
        baseline_score += 3.0

    threat_score = min(100.0, max(0.0, 10.0 + anomaly_count * 8.0 + severity_score + baseline_score))
    threat_level = _threat_level(threat_score)
    explanation = _assemble_explanation(baseline, {
        key: len(value) for key, value in anomaly_collections.items()
    })
    recommendation = _build_recommendation(threat_level)
    confidence_score = _confidence_from_score(threat_score, anomaly_count)

    assessment = RiskAssessment(
        employee_id=employee_id,
        risk_score=round(threat_score, 2),
        risk_level=RiskLevel(threat_level),
        anomaly_detected=anomaly_count > 0,
        recommendation=recommendation,
        last_analyzed=datetime.now(),
        risk_reason=explanation,
        confidence_score=confidence_score,
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment
