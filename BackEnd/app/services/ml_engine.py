import os
import joblib
import numpy as np
from sklearn.ensemble import IsolationForest

MODEL_PATH = "app/services/isolation_forest_model.pkl"

_model = None


def get_model():
    global _model

    if _model is None:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
        else:
            _model = IsolationForest(
                n_estimators=100,
                contamination=0.05,
                random_state=42
            )

    return _model


def train_model(data):
    global _model

    model = IsolationForest(
        n_estimators=100,
        contamination=0.05,
        random_state=42
    )

    model.fit(data)

    _model = model

    joblib.dump(
        model,
        MODEL_PATH
    )

    return model


def predict_anomaly(features):
    model = get_model()

    features = np.array(
        features,
        dtype=float
    ).reshape(1, -1)

    prediction = model.predict(features)[0]

    decision_score = model.decision_function(
        features
    )[0]

    anomaly_score = round(
        float(
            max(
                0,
                min(
                    100,
                    (0.5 - decision_score) * 100
                )
            )
        ),
        2
    )

    return {
        "prediction": int(prediction),
        "anomaly": 1 if prediction == -1 else 0,
        "anomaly_score": anomaly_score
    }


def predict_risk(features):
    result = predict_anomaly(features)

    anomaly_score = result["anomaly_score"]

    if anomaly_score >= 80:
        risk_level = "Critical"
    elif anomaly_score >= 60:
        risk_level = "High"
    elif anomaly_score >= 30:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "anomaly_prediction": result["prediction"],
        "anomaly": result["anomaly"],
        "anomaly_score": anomaly_score,
        "risk_score": anomaly_score,
        "risk_level": risk_level
    }