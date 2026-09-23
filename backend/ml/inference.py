"""
Inference module – loads the trained model and scores users.

Used by the API routes to compute real-time risk scores.
"""

import json
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Optional

import joblib

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "ml"
MODEL_PATH = MODEL_DIR / "trained_model.joblib"
FEATURE_COLS_PATH = MODEL_DIR / "feature_columns.joblib"
REPORT_PATH = MODEL_DIR / "training_report.json"


def _load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"No trained model found at {MODEL_PATH}. "
            "Run 'python -m ml.train_model' first."
        )
    return joblib.load(MODEL_PATH)


def _load_feature_columns():
    if not FEATURE_COLS_PATH.exists():
        raise FileNotFoundError(f"No feature columns file at {FEATURE_COLS_PATH}")
    return joblib.load(FEATURE_COLS_PATH)


def _load_report() -> dict:
    if not REPORT_PATH.exists():
        return {}
    with open(REPORT_PATH) as f:
        return json.load(f)


# Cached at module level
_model = None
_feature_cols = None


def get_model():
    global _model
    if _model is None:
        _model = _load_model()
    return _model


def get_feature_columns():
    global _feature_cols
    if _feature_cols is None:
        _feature_cols = _load_feature_columns()
    return _feature_cols


def score_user(features_dict: dict) -> dict:
    """
    Given a dict of feature_name -> value for a single user,
    return { threat_probability, risk_level, risk_score }.
    """
    model = get_model()
    cols = get_feature_columns()

    X = np.array([[features_dict.get(c, 0.0) for c in cols]])

    # Isolation Forest returns lower normality for unusual profiles.  The
    # persisted threshold keeps API decisions consistent with training.
    if isinstance(model, dict) and "pipeline" in model:
        anomaly_score = float(-model["pipeline"].score_samples(X)[0])
        threshold = float(model["threshold"])
        prediction = anomaly_score >= threshold
        # A bounded presentation value for existing risk-score consumers.
        proba = min(1.0, max(0.0, anomaly_score / max(threshold * 1.5, 1e-9)))
    else:
        proba = model.predict_proba(X)[0][1]
        prediction = bool(model.predict(X)[0])
        anomaly_score = None

    # Map probability to risk level
    if proba >= 0.85:
        risk_level = "critical"
    elif proba >= 0.65:
        risk_level = "high"
    elif proba >= 0.40:
        risk_level = "medium"
    else:
        risk_level = "low"

    # Risk score: 0-100 scale
    risk_score = round(proba * 100, 1)

    return {
        "threat_probability": round(float(proba), 4),
        "risk_score": risk_score,
        "risk_level": risk_level,
        "is_predicted_threat": bool(prediction),
        "anomaly_score": round(anomaly_score, 6) if anomaly_score is not None else None,
    }


def score_users_batch(users_features: list[dict]) -> list[dict]:
    """Score multiple users at once."""
    return [score_user(f) for f in users_features]


def get_training_report() -> dict:
    """Return the training metrics report."""
    return _load_report()
