"""
Feature Engineering & Model Training for Insider Threat Detection
=================================================================

Reads the ingested CERT logon/device subset from PostgreSQL activity_logs,
engineers per-user behavioral features, and trains an unsupervised
Isolation Forest to rank anomalous profiles.

Outputs:
  - ml/trained_model.joblib          (serialised Isolation Forest pipeline)
  - ml/training_report.json          (threshold, ranking, precision, recall, F1)
  - prints known-insider ranks and threshold metrics to stdout

Usage:
    python -m ml.train_model
"""

import os
import json
import warnings
import numpy as np
import pandas as pd
from pathlib import Path
from collections import defaultdict

from sklearn.preprocessing import RobustScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)
from sklearn.ensemble import IsolationForest

import joblib

from sqlalchemy import text
from database import engine

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data" / "cert_data" / "r4.2"
MODEL_DIR = BASE_DIR / "ml"
MODEL_PATH = MODEL_DIR / "trained_model.joblib"
REPORT_PATH = MODEL_DIR / "training_report.json"

# ---------------------------------------------------------------------------
# Reference insider IDs from the broader CERT r4.2 scenario.  This project
# only ships a logon/device subset, so evaluation must use their intersection
# with the observed users rather than treating all 13 as present ground truth.
# ---------------------------------------------------------------------------
KNOWN_INSIDERS = {
    # Scenario 1 – user who logs in after hours and downloads sensitive data
    "ACM2278",
    # Scenario 2 – disgruntled employee using USB devices after resignation
    "CMP2946",
    # Scenario 3 – employee who accesses systems from abnormal locations/times
    "PLJ1771",
    # Additional documented insiders in r4.2
    "CDE1846",
    "MCF0600",
    "MBG3183",
    "AAM0658",
    "AJR0932",
    "HIS0934",
    "DAM0315",
    "RES0688",
    "TAR0535",
    "PHB0250",
}


# ---------------------------------------------------------------------------
# Feature engineering
# ---------------------------------------------------------------------------
def load_and_engineer_features() -> pd.DataFrame:
    """
    Read raw CSVs, compute per-user aggregated behavioral features.
    Returns a DataFrame with one row per user and a binary 'is_threat' label.
    """
    print("[1/4] Loading logon events from PostgreSQL activity_logs ...")
    logon_df = pd.read_sql(text("""
        SELECT employee_id AS user, timestamp AS date, event_type, pc
        FROM activity_logs
        WHERE event_type IN ('logon', 'logoff')
    """), engine)
    logon_df["activity"] = logon_df["event_type"].map({"logon": "Logon", "logoff": "Logoff"})
    logon_df["date"] = pd.to_datetime(logon_df["date"])
    logon_df["hour"] = logon_df["date"].dt.hour
    logon_df["weekday"] = logon_df["date"].dt.weekday  # 0=Mon, 6=Sun
    logon_df["is_weekend"] = logon_df["weekday"].isin([5, 6]).astype(int)
    logon_df["is_after_hours"] = ((logon_df["hour"] < 6) | (logon_df["hour"] >= 20)).astype(int)
    logon_df["day"] = logon_df["date"].dt.date

    print(f"    Logon rows: {len(logon_df):,}")

    print("[2/4] Loading device events from PostgreSQL activity_logs ...")
    device_df = pd.read_sql(text("""
        SELECT employee_id AS user, timestamp AS date, event_type, pc
        FROM activity_logs
        WHERE event_type IN ('device_connect', 'device_disconnect')
    """), engine)
    device_df["activity"] = device_df["event_type"].map({"device_connect": "Connect", "device_disconnect": "Disconnect"})
    device_df["date"] = pd.to_datetime(device_df["date"])
    device_df["hour"] = device_df["date"].dt.hour
    device_df["weekday"] = device_df["date"].dt.weekday
    device_df["is_weekend"] = device_df["weekday"].isin([5, 6]).astype(int)
    device_df["is_after_hours"] = ((device_df["hour"] < 6) | (device_df["hour"] >= 20)).astype(int)
    device_df["day"] = device_df["date"].dt.date

    print(f"    Device rows: {len(device_df):,}")

    # ---- Logon features per user ----
    print("[3/4] Engineering per-user features ...")

    logon_only = logon_df[logon_df["activity"].str.lower() == "logon"]
    logoff_only = logon_df[logon_df["activity"].str.lower() == "logoff"]

    logon_feats = logon_only.groupby("user").agg(
        total_logons=("date", "count"),
        mean_logon_hour=("hour", "mean"),
        std_logon_hour=("hour", "std"),
        after_hours_logons=("is_after_hours", "sum"),
        weekend_logons=("is_weekend", "sum"),
        unique_pcs_logon=("pc", "nunique"),
        num_logon_days=("day", "nunique"),
    ).reset_index()

    logoff_feats = logoff_only.groupby("user").agg(
        total_logoffs=("date", "count"),
    ).reset_index()

    # ---- Device features per user ----
    device_connects = device_df[device_df["activity"].str.lower() == "connect"]
    device_disconnects = device_df[device_df["activity"].str.lower() == "disconnect"]

    device_conn_feats = device_connects.groupby("user").agg(
        total_device_connects=("date", "count"),
        after_hours_device=("is_after_hours", "sum"),
        weekend_device=("is_weekend", "sum"),
        unique_pcs_device=("pc", "nunique"),
        mean_device_hour=("hour", "mean"),
        std_device_hour=("hour", "std"),
        num_device_days=("day", "nunique"),
    ).reset_index()

    device_disconn_feats = device_disconnects.groupby("user").agg(
        total_device_disconnects=("date", "count"),
    ).reset_index()

    # ---- Merge all features ----
    features = logon_feats.copy()
    features = features.merge(logoff_feats, on="user", how="left")
    features = features.merge(device_conn_feats, on="user", how="left")
    features = features.merge(device_disconn_feats, on="user", how="left")
    features = features.fillna(0)

    # ---- Derived ratios ----
    features["after_hours_logon_ratio"] = features["after_hours_logons"] / features["total_logons"].clip(lower=1)
    features["weekend_logon_ratio"] = features["weekend_logons"] / features["total_logons"].clip(lower=1)
    features["logons_per_day"] = features["total_logons"] / features["num_logon_days"].clip(lower=1)
    features["device_connects_per_day"] = features["total_device_connects"] / features["num_device_days"].clip(lower=1)
    features["after_hours_device_ratio"] = features["after_hours_device"] / features["total_device_connects"].clip(lower=1)
    features["weekend_device_ratio"] = features["weekend_device"] / features["total_device_connects"].clip(lower=1)
    features["logon_logoff_ratio"] = features["total_logons"] / features["total_logoffs"].clip(lower=1)
    features["pc_variety_score"] = features["unique_pcs_logon"] + features["unique_pcs_device"]

    # ---- Session-based features (time between logon and logoff) ----
    # We'll compute per-user session stats
    session_stats = _compute_session_features(logon_df)
    features = features.merge(session_stats, on="user", how="left")
    features = features.fillna(0)

    # ---- Label ----
    features["user"] = features["user"].str.strip().str.upper()
    features["is_threat"] = features["user"].isin(KNOWN_INSIDERS).astype(int)

    print(f"    Total users: {len(features)}")
    print(f"    Evaluable reference insiders: {features['is_threat'].sum()} of {len(KNOWN_INSIDERS)} configured")
    print(f"    Normal users:   {(features['is_threat'] == 0).sum()}")

    return features


def _compute_session_features(logon_df: pd.DataFrame) -> pd.DataFrame:
    """
    Estimate session durations by pairing each Logon with the next Logoff
    for the same user on the same PC.
    """
    logon_sorted = logon_df.sort_values(["user", "pc", "date"])[["user", "pc", "date", "activity"]].copy()
    logon_sorted["previous_activity"] = logon_sorted.groupby(["user", "pc"])["activity"].shift()
    logon_sorted["previous_date"] = logon_sorted.groupby(["user", "pc"])["date"].shift()
    sessions = logon_sorted[
        (logon_sorted["activity"].str.lower() == "logoff")
        & (logon_sorted["previous_activity"].str.lower() == "logon")
    ].copy()
    sessions["session_duration_min"] = (sessions["date"] - sessions["previous_date"]).dt.total_seconds() / 60.0
    sessions = sessions[sessions["session_duration_min"].between(0, 1440, inclusive="neither")]
    if sessions.empty:
        # Return empty df with expected columns
        return pd.DataFrame(columns=["user", "mean_session_min", "std_session_min", "max_session_min"])

    session_feats = sessions.groupby("user").agg(
        mean_session_min=("session_duration_min", "mean"),
        std_session_min=("session_duration_min", "std"),
        max_session_min=("session_duration_min", "max"),
    ).reset_index()
    session_feats = session_feats.fillna(0)
    return session_feats


# ---------------------------------------------------------------------------
# Data balancing via SMOTE-like oversampling
# ---------------------------------------------------------------------------
def balance_dataset(X: np.ndarray, y: np.ndarray, random_state: int = 42):
    """
    Use SMOTE if available, else simple random oversampling of the minority class.
    """
    try:
        from imblearn.over_sampling import SMOTE
        sm = SMOTE(random_state=random_state, k_neighbors=min(3, sum(y == 1) - 1))
        X_res, y_res = sm.fit_resample(X, y)
        print(f"    SMOTE applied: {sum(y_res == 0)} normal, {sum(y_res == 1)} threat")
        return X_res, y_res
    except ImportError:
        # Fallback: random oversampling
        minority_idx = np.where(y == 1)[0]
        majority_count = sum(y == 0)
        if len(minority_idx) == 0:
            return X, y
        oversample_factor = majority_count // len(minority_idx)
        extra_idx = np.tile(minority_idx, oversample_factor)
        X_over = np.vstack([X, X[extra_idx]])
        y_over = np.concatenate([y, y[extra_idx]])
        # Shuffle
        perm = np.random.RandomState(random_state).permutation(len(y_over))
        print(f"    Random oversampling: {sum(y_over == 0)} normal, {sum(y_over == 1)} threat")
        return X_over[perm], y_over[perm]


# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------
def _legacy_supervised_train_model():
    features = load_and_engineer_features()

    feature_cols = [c for c in features.columns if c not in ("user", "is_threat")]
    X = features[feature_cols].values
    y = features["is_threat"].values
    users = features["user"].values

    print(f"\n[4/4] Training model ...")
    print(f"    Feature columns ({len(feature_cols)}): {feature_cols}")
    print(f"    Class distribution: {dict(zip(*np.unique(y, return_counts=True)))}")

    # Stratified split - ensure both classes in train and test
    X_train, X_test, y_train, y_test, users_train, users_test = train_test_split(
        X, y, users, test_size=0.25, random_state=42, stratify=y
    )

    print(f"    Train set: {len(y_train)} samples ({sum(y_train)} threats)")
    print(f"    Test set:  {len(y_test)} samples ({sum(y_test)} threats)")

    # Balance the training set
    X_train_bal, y_train_bal = balance_dataset(X_train, y_train)

    # Build pipeline
    if XGBClassifier is not None:
        print("    Using XGBClassifier")
        clf = XGBClassifier(
            n_estimators=200,
            max_depth=5,
            learning_rate=0.1,
            scale_pos_weight=1,  # already balanced via SMOTE
            eval_metric="logloss",
            use_label_encoder=False,
            random_state=42,
        )
    else:
        print("    XGBoost not available, using GradientBoosting")
        clf = GradientBoostingClassifier(
            n_estimators=200,
            max_depth=5,
            learning_rate=0.1,
            random_state=42,
        )

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", clf),
    ])

    pipeline.fit(X_train_bal, y_train_bal)

    # ---- Evaluate on held-out test set ----
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1] if hasattr(pipeline, "predict_proba") else None

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred).tolist()

    print("\n" + "=" * 60)
    print("HELD-OUT TEST SET RESULTS")
    print("=" * 60)
    print(f"  Accuracy:  {acc:.4f}  ({acc*100:.1f}%)")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall:    {rec:.4f}")
    print(f"  F1-Score:  {f1:.4f}")
    print(f"\nConfusion Matrix:")
    print(f"  TN={cm[0][0]}  FP={cm[0][1]}")
    print(f"  FN={cm[1][0]}  TP={cm[1][1]}")
    print()
    print(classification_report(y_test, y_pred, target_names=["Normal", "Insider Threat"]))

    # ---- Cross-validation on full (balanced) data ----
    X_full_bal, y_full_bal = balance_dataset(X, y)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(pipeline, X_full_bal, y_full_bal, cv=cv, scoring="accuracy")
    print(f"5-Fold CV Accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # ---- Save model ----
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"\nModel saved to {MODEL_PATH}")

    # ---- Save feature names for inference ----
    joblib.dump(feature_cols, MODEL_DIR / "feature_columns.joblib")

    # ---- Save report ----
    report = {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": {
            "true_negative": cm[0][0],
            "false_positive": cm[0][1],
            "false_negative": cm[1][0],
            "true_positive": cm[1][1],
        },
        "cv_accuracy_mean": round(cv_scores.mean(), 4),
        "cv_accuracy_std": round(cv_scores.std(), 4),
        "train_samples": len(y_train_bal),
        "test_samples": len(y_test),
        "feature_count": len(feature_cols),
        "feature_names": feature_cols,
        "known_insiders": sorted(list(KNOWN_INSIDERS)),
    }

    with open(REPORT_PATH, "w") as f:
        json.dump(report, f, indent=2)
    print(f"Report saved to {REPORT_PATH}")

    return report


def train_isolation_forest():
    """Train without labels; labels are used only to evaluate ranking quality."""
    features = load_and_engineer_features()
    feature_cols = [c for c in features.columns if c not in ("user", "is_threat")]
    X = features[feature_cols].values
    y = features["is_threat"].values
    threshold_percentile = 90  # analyst triage queue: riskiest 10% of profiles
    print(f"\n[4/4] Fitting Isolation Forest on {len(X):,} profiles...")
    print("    Known-insider labels are not used by the detector.")
    pipeline = Pipeline([
        ("scaler", RobustScaler()),
        ("detector", IsolationForest(n_estimators=500, contamination=0.10, random_state=42, n_jobs=-1)),
    ])
    pipeline.fit(X)
    scores = -pipeline.score_samples(X)  # higher score means more anomalous
    threshold = float(np.percentile(scores, threshold_percentile))
    predicted_anomaly = (scores >= threshold).astype(int)
    precision = precision_score(y, predicted_anomaly, zero_division=0)
    recall = recall_score(y, predicted_anomaly, zero_division=0)
    f1 = f1_score(y, predicted_anomaly, zero_division=0)
    cm = confusion_matrix(y, predicted_anomaly, labels=[0, 1]).tolist()
    ranked = features[["user", "is_threat"]].copy()
    ranked["anomaly_score"] = scores
    ranked["risk_rank"] = ranked["anomaly_score"].rank(ascending=False, method="min").astype(int)
    ranked["risk_percentile"] = (ranked["risk_rank"] / len(ranked) * 100).round(1)
    known_rankings = ranked[ranked["is_threat"] == 1].sort_values("risk_rank")
    observed_users = set(features["user"])
    evaluable_insiders = sorted(KNOWN_INSIDERS & observed_users)
    unavailable_insiders = sorted(KNOWN_INSIDERS - observed_users)

    print("\n" + "=" * 60)
    print("ANOMALY-RANKING RESULTS AT A TOP-10% TRIAGE THRESHOLD")
    print("=" * 60)
    print(f"Threshold score: {threshold:.6f}")
    print(f"Precision: {precision:.4f}  Recall: {recall:.4f}  F1: {f1:.4f}")
    print(f"Confusion matrix: TN={cm[0][0]} FP={cm[0][1]} FN={cm[1][0]} TP={cm[1][1]}")
    print(f"\nEvaluable insider scores and rank ({len(evaluable_insiders)} of {len(KNOWN_INSIDERS)} configured IDs):")
    print(known_rankings[["user", "anomaly_score", "risk_rank", "risk_percentile"]].to_string(index=False))
    print(f"Unavailable configured IDs: {', '.join(unavailable_insiders)}")

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump({"pipeline": pipeline, "threshold": threshold, "threshold_percentile": threshold_percentile}, MODEL_PATH)
    joblib.dump(feature_cols, MODEL_DIR / "feature_columns.joblib")
    report = {
        "model_type": "IsolationForest",
        "evaluation_note": "Accuracy is omitted because a normal-only model would look 99.7% accurate on this subset while detecting no threats. Precision, recall, and F1 are calculated only against the evaluable insiders present in the supplied logon/device files.",
        "configured_reference_insiders": sorted(KNOWN_INSIDERS),
        "evaluable_reference_insiders": evaluable_insiders,
        "unavailable_reference_insiders": unavailable_insiders,
        "evaluation_population_note": f"Only {len(evaluable_insiders)} of {len(KNOWN_INSIDERS)} configured reference IDs occur in this supplied data subset; recall is {recall:.4f} ({cm[1][1]}/{len(evaluable_insiders)}) for those {len(evaluable_insiders)} evaluable IDs, not all configured IDs.",
        "threshold_percentile": threshold_percentile, "anomaly_score_threshold": round(threshold, 6),
        "precision": round(precision, 4), "recall": round(recall, 4), "f1_score": round(f1, 4),
        "confusion_matrix": {"true_negative": cm[0][0], "false_positive": cm[0][1], "false_negative": cm[1][0], "true_positive": cm[1][1]},
        "profiles_scored": len(y), "flagged_profiles": int(predicted_anomaly.sum()),
        "feature_count": len(feature_cols), "feature_names": feature_cols,
        "known_insiders": evaluable_insiders,
        "known_insider_rankings": known_rankings[["user", "anomaly_score", "risk_rank", "risk_percentile"]].to_dict(orient="records"),
    }
    with open(REPORT_PATH, "w") as file:
        json.dump(report, file, indent=2)
    print(f"Model saved to {MODEL_PATH}")
    print(f"Report saved to {REPORT_PATH}")
    return report


def train_model():
    """Backward-compatible entry point for callers of the original trainer."""
    return train_isolation_forest()


if __name__ == "__main__":
    train_isolation_forest()
