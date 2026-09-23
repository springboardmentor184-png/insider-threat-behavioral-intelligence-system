"""Transparent risk scoring and alert generation for analyst review."""

from math import floor, ceil

from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Alert, Anomaly, RiskScore


RISK_CATEGORY_LABELS = {
    "low": "Low",
    "medium": "Medium",
    "high": "High",
    "critical": "Critical",
}


def _percentile(values: list[float], percentile: float) -> float:
    """Return an interpolated percentile without adding a numeric dependency."""
    if not values:
        return 0.0
    values = sorted(values)
    position = (len(values) - 1) * percentile
    lower, upper = floor(position), ceil(position)
    if lower == upper:
        return values[lower]
    return values[lower] + (values[upper] - values[lower]) * (position - lower)


def latest_risk_scores(db: Session):
    """One current score per employee, used for relative risk categorization."""
    latest = db.query(func.max(RiskScore.id).label("id")).group_by(RiskScore.employee_id).subquery()
    return db.query(RiskScore).filter(RiskScore.id.in_(latest)).all()


def risk_level_for_score(score: float, population_scores: list[float]) -> str:
    """Map a score to a percentile-based Low/Medium/High/Critical category."""
    if len(population_scores) < 4:
        return "low"
    median = _percentile(population_scores, 0.50)
    upper_quartile = _percentile(population_scores, 0.75)
    upper_decile = _percentile(population_scores, 0.90)
    if score >= upper_decile:
        return "critical"
    if score >= upper_quartile:
        return "high"
    if score >= median:
        return "medium"
    return "low"


def refresh_risk_categories(db: Session) -> list[RiskScore]:
    """Keep stored categories aligned with the current score distribution.

    Ranking makes percentile bands stable even when several profiles have the
    same rounded numeric score.
    """
    records = latest_risk_scores(db)
    total = len(records)
    for rank, record in enumerate(sorted(records, key=lambda item: (item.risk_score, item.employee_id))):
        percentile = (rank + 1) / total if total else 0
        if percentile > 0.90:
            record.risk_level = "critical"
        elif percentile > 0.75:
            record.risk_level = "high"
        elif percentile > 0.50:
            record.risk_level = "medium"
        else:
            record.risk_level = "low"
    db.commit()
    return records


def serialize_risk_score(record: RiskScore) -> dict:
    """Stable API payload with the score and its human-readable category."""
    return {
        "id": record.id,
        "employee_id": record.employee_id,
        "risk_score": record.risk_score,
        "risk_level": record.risk_level,
        "risk_category": RISK_CATEGORY_LABELS[record.risk_level],
        "threat_probability": record.threat_probability,
        "computed_at": record.computed_at,
    }


def calculate_risk_score(db: Session, employee_id: str) -> RiskScore:
    """Persist an explainable score using the document's weighted factors."""
    anomalies = db.query(Anomaly).filter(
        Anomaly.employee_id == employee_id, Anomaly.status.in_(["open", "reviewed"])
    ).all()
    severity_weight = {"low": 20, "medium": 45, "high": 70, "critical": 100}
    behavioral = min(100.0, sum(severity_weight.get(a.severity, 0) for a in anomalies) / 2)
    privilege = min(100.0, sum("privilege" in a.anomaly_type for a in anomalies) * 50.0)
    data_access = min(100.0, sum(any(k in a.anomaly_type for k in ("download", "transfer", "data")) for a in anomalies) * 50.0)
    access_pattern = min(100.0, sum("login" in a.anomaly_type for a in anomalies) * 25.0)
    history = min(100.0, len(anomalies) * 10.0)
    score = round(behavioral * .35 + privilege * .25 + data_access * .20 + access_pattern * .10 + history * .10, 1)
    record = RiskScore(
        employee_id=employee_id, risk_score=score, risk_level="low", threat_probability=round(score / 100, 4),
        behavioral_anomaly_score=behavioral, privilege_misuse_score=privilege, data_access_score=data_access,
        access_pattern_score=access_pattern, historical_events_score=history,
    )
    db.add(record); db.flush()
    db.commit()
    refresh_risk_categories(db)
    db.refresh(record)
    if record.risk_level in {"high", "critical"} and not db.query(Alert).filter(
        Alert.employee_id == employee_id, Alert.alert_type == "high_risk_score",
        Alert.status.in_(["new", "acknowledged", "investigating"]),
    ).first():
        db.add(Alert(employee_id=employee_id, alert_type="high_risk_score", severity=record.risk_level,
                     title=f"{record.risk_level.title()} risk score for {employee_id}",
                     description=f"Weighted behavioural risk score is {score}/100.", source_risk_score_id=record.id))
    db.commit(); db.refresh(record)
    return record
