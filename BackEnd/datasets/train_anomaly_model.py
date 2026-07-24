import pandas as pd
import os
import joblib

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

INPUT_FILE = os.path.join(
    BASE_DIR,
    "processed",
    "behavioral_features.csv"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "..",
    "trained_models"
)

OUTPUT_FILE = os.path.join(
    BASE_DIR,
    "processed",
    "anomaly_results.csv"
)

MODEL_FILE = os.path.join(
    MODEL_DIR,
    "isolation_forest_model.pkl"
)

os.makedirs(MODEL_DIR, exist_ok=True)

df = pd.read_csv(INPUT_FILE)

features = [
    "login_count",
    "unique_devices",
    "after_hours_logins",
    "weekend_logins",
    "after_hours_ratio",
    "weekend_ratio"
]

X = df[features]

scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)

model = IsolationForest(
    n_estimators=200,
    contamination=0.05,
    random_state=42
)

model.fit(X_scaled)

df["anomaly_prediction"] = model.predict(X_scaled)

df["anomaly_score"] = model.decision_function(X_scaled)

df["anomaly"] = (
    df["anomaly_prediction"] == -1
).astype(int)

df["risk_score"] = (
    (-df["anomaly_score"]) * 100
)

df["risk_score"] = (
    df["risk_score"]
    .clip(0, 100)
    .round(2)
)

def classify_risk(score):

    if score >= 75:
        return "Critical"

    elif score >= 50:
        return "High"

    elif score >= 25:
        return "Medium"

    else:
        return "Low"


df["risk_level"] = df["risk_score"].apply(
    classify_risk
)

df.to_csv(
    OUTPUT_FILE,
    index=False
)

joblib.dump(
    model,
    MODEL_FILE
)

joblib.dump(
    scaler,
    os.path.join(
        MODEL_DIR,
        "feature_scaler.pkl"
    )
)

print("================================")
print("ANOMALY DETECTION COMPLETED")
print("================================")

print(f"Total employees: {len(df)}")

print(
    f"Anomalies detected: "
    f"{df['anomaly'].sum()}"
)

print("\nRisk distribution:")

print(
    df["risk_level"].value_counts()
)

print("\nTop risky employees:")

print(
    df.sort_values(
        "risk_score",
        ascending=False
    ).head(10)
)

print("\nResults saved to:")

print(OUTPUT_FILE)

print("\nModel saved to:")

print(MODEL_FILE)