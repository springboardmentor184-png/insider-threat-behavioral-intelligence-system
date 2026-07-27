import pandas as pd
from sklearn.ensemble import IsolationForest
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.models.activity_event import ActivityEvent
from app.models.risk_score import RiskScore


FEATURE_COLS = [
    "total_events", "unique_days_active", "avg_login_hour", "std_login_hour",
    "device_connect", "device_disconnect", "email_sent", "logon", "logoff", "file_access"
]


def compute_risk_scores(db: Session):
    # Load all activity events into a DataFrame
    events = db.query(ActivityEvent).all()

    if not events:
        return {"users_processed": 0, "category_counts": {}}

    rows = [{
        "source_user_id": e.source_user_id,
        "event_type": e.event_type,
        "timestamp": e.timestamp,
    } for e in events]

    df = pd.DataFrame(rows)
    df["hour"] = pd.to_datetime(df["timestamp"]).dt.hour
    df["date"] = pd.to_datetime(df["timestamp"]).dt.date

    features = df.groupby("source_user_id").agg(
        total_events=("event_type", "count"),
        unique_days_active=("date", "nunique"),
        avg_login_hour=("hour", "mean"),
        std_login_hour=("hour", "std"),
    ).reset_index()

    event_counts = df.pivot_table(
        index="source_user_id",
        columns="event_type",
        values="timestamp",
        aggfunc="count",
        fill_value=0
    ).reset_index()

    features = features.merge(event_counts, on="source_user_id", how="left")
    features["std_login_hour"] = features["std_login_hour"].fillna(0)

    for col in FEATURE_COLS:
        if col not in features.columns:
            features[col] = 0

    X = features[FEATURE_COLS].fillna(0)

    model = IsolationForest(n_estimators=200, contamination=0.05, random_state=42)
    features["anomaly_score_raw"] = model.fit_predict(X)
    features["anomaly_score_raw"] = model.decision_function(X)

    min_score = features["anomaly_score_raw"].min()
    max_score = features["anomaly_score_raw"].max()
    features["risk_score"] = (
        (max_score - features["anomaly_score_raw"]) / (max_score - min_score) * 100
    ).round(2)

    def risk_category(score):
        if score >= 80:
            return "Critical"
        elif score >= 60:
            return "High"
        elif score >= 40:
            return "Medium"
        else:
            return "Low"

    features["risk_category"] = features["risk_score"].apply(risk_category)

    # Clear old scores and insert fresh ones
    db.query(RiskScore).delete()

    for _, row in features.iterrows():
        db.add(RiskScore(
            source_user_id=row["source_user_id"],
            risk_score=row["risk_score"],
            risk_category=row["risk_category"],
            total_events=int(row["total_events"]),
            unique_days_active=int(row["unique_days_active"]),
            avg_login_hour=float(row["avg_login_hour"]),
            std_login_hour=float(row["std_login_hour"]),
        ))

    db.commit()

    category_counts = features["risk_category"].value_counts().to_dict()

    return {
        "users_processed": len(features),
        "category_counts": category_counts,
    }