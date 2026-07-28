from sklearn.ensemble import IsolationForest
import pandas as pd
from sqlalchemy.orm import Session
from app import models

FEATURE_COLUMNS = [
    "login_count", "failed_login_count", "distinct_dest_computers",
    "distinct_dns_domains", "total_bytes", "distinct_dest_ports",
    "distinct_processes"
]

def run_anomaly_detection(db: Session):
    records = db.query(models.LanlBehaviorFeature).all()
    if not records:
        return {"message": "No feature data found"}

    df = pd.DataFrame([{
        "id": r.id, "entity_id": r.entity_id, **{c: getattr(r, c) for c in FEATURE_COLUMNS}
    } for r in records])

    model = IsolationForest(contamination=0.02, random_state=42)
    df["anomaly_score"] = -model.fit(df[FEATURE_COLUMNS]).score_samples(df[FEATURE_COLUMNS])
    df["is_anomaly"] = model.predict(df[FEATURE_COLUMNS]) == -1

    for _, row in df.iterrows():
        rec = db.query(models.LanlBehaviorFeature).get(int(row["id"]))
        rec.anomaly_score = float(row["anomaly_score"])
        rec.is_anomaly = bool(row["is_anomaly"])
    db.commit()

    return {"total": len(df), "anomalies_found": int(df["is_anomaly"].sum())}


def validate_against_redteam(db: Session):
    redteam_events = db.query(models.LanlRedteamEvent).all()
    WINDOW_SECONDS = 3600
    attacked = {(e.source_computer, (e.event_time // WINDOW_SECONDS) * WINDOW_SECONDS) for e in redteam_events}

    anomalies = db.query(models.LanlBehaviorFeature).filter(
        models.LanlBehaviorFeature.is_anomaly == True
    ).all()

    tp = 0
    for a in anomalies:
        if (a.entity_id, a.time_window) in attacked:
            a.is_redteam_confirmed = True
            tp += 1
    db.commit()

    precision = tp / len(anomalies) if anomalies else 0
    return {"true_positives": tp, "total_flagged": len(anomalies), "precision": round(precision, 3)}