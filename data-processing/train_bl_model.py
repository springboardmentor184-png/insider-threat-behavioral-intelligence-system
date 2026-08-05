import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    classification_report, confusion_matrix, precision_score,
    recall_score, f1_score
)

DB_USER = "postgres"
DB_PASS = "sql%40123456"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "itbis_db"

engine = create_engine(f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

df = pd.read_sql('SELECT * FROM user_features', engine)

# Feature columns: everything except identifiers and label
FEATURE_COLS = [c for c in df.columns if c not in ("user", "label")]

X = df[FEATURE_COLS].fillna(0)
y = df["label"].map({"normal": 0, "malicious": 1})

scaler = StandardScaler()
X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=FEATURE_COLS)

# ---------- Supervised: RandomForest ----------
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.3, random_state=42, stratify=y
)

rf = RandomForestClassifier(
    n_estimators=300,
    max_depth=6,
    class_weight="balanced",
    random_state=42,
)
rf.fit(X_train, y_train)
rf_preds = rf.predict(X_test)

print("=" * 60)
print("SUPERVISED: RandomForestClassifier")
print("=" * 60)
print(classification_report(y_test, rf_preds, target_names=["normal", "malicious"]))
print("Confusion matrix (rows=actual, cols=predicted):")
print(confusion_matrix(y_test, rf_preds))

importances = pd.Series(rf.feature_importances_, index=FEATURE_COLS).sort_values(ascending=False)
print("\nTop feature importances:")
print(importances.head(10))

# ---------- Unsupervised: IsolationForest ----------
contamination = y.mean()  # 6/60 = 0.10
iso = IsolationForest(
    n_estimators=300,
    contamination=contamination,
    random_state=42,
)
iso.fit(X_scaled)
iso_raw = iso.predict(X_scaled)  # 1 = normal, -1 = anomaly
iso_preds = pd.Series(iso_raw).map({1: 0, -1: 1})

print("\n" + "=" * 60)
print("UNSUPERVISED: IsolationForest (evaluated against labels)")
print("=" * 60)
print(classification_report(y, iso_preds, target_names=["normal", "malicious"]))
print("Confusion matrix (rows=actual, cols=predicted):")
print(confusion_matrix(y, iso_preds))

# ---------- Save results back to Postgres ----------
results = df[["user", "label"]].copy()
results["iso_forest_flag"] = iso_preds.values
results["rf_malicious_prob"] = rf.predict_proba(X_scaled)[:, 1]
results = results.sort_values("rf_malicious_prob", ascending=False)

results.to_sql("model_results", engine, if_exists="replace", index=False)
print("\nSaved predictions to 'model_results' table.")
print(results.head(10))