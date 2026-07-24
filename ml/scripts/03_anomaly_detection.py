import pandas as pd

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

print("=" * 60)
print("Loading Behaviour Baseline...")
print("=" * 60)

baseline = pd.read_csv(
    "ml/outputs/baseline.csv"
)

print("Users :", len(baseline))
print()

print("=" * 60)
print("Selecting Behaviour Features...")
print("=" * 60)

feature_columns = [

    # Login Behaviour
    "avg_login_hour",
    "login_variance",

    # Logout Behaviour
    "avg_logout_hour",
    "logout_variance",

    # Session Behaviour
    "avg_session_hours",
    "max_session_hours",
    "session_variance",

    # Login Frequency
    "total_logins",
    "working_days",
    "avg_logins_per_day",

    # Device Behaviour
    "unique_pcs",
    "device_switches",
    "primary_pc_percentage",

    # Time Behaviour
    "night_login_count",
    "offhour_percentage",

    # Weekend Behaviour
    "weekend_logins",
    "weekday_logins"

]

features = baseline[feature_columns]

print("Features Used:")

for feature in feature_columns:
    print("✓", feature)

print()

#part3
print("=" * 60)
print("Preparing Data...")
print("=" * 60)

# ---------------------------------------
# Handle Missing Values
# ---------------------------------------
features = features.fillna(
    features.median(numeric_only=True)
)

print("✓ Missing values handled using median.")

# ---------------------------------------
# Standardize Features
# ---------------------------------------
scaler = StandardScaler()

features_scaled = scaler.fit_transform(features)

print("✓ Features standardized.")

print()
print("=" * 60)
print("Training Isolation Forest...")
print("=" * 60)

# ---------------------------------------
# Train Isolation Forest
# ---------------------------------------
model = IsolationForest(

    contamination="auto",

    random_state=42,

    n_estimators=200,

    max_samples="auto"

)

model.fit(features_scaled)

print("✓ Model trained successfully.")
print()

print("=" * 60)
print("Predicting Anomalies...")
print("=" * 60)

# predictions = model.predict(features_scaled)

# baseline["anomaly"] = predictions

# baseline["anomaly"] = baseline["anomaly"].map({

#     1: "Normal",

#     -1: "Anomaly"

# })

# ===========================================
# Get anomaly scores
# ===========================================

baseline["anomaly_score"] = model.decision_function(features_scaled)

# Lower score = more suspicious
baseline = baseline.sort_values(
    by="anomaly_score"
)

# ===========================================
# Business Threshold
# ===========================================

THRESHOLD = -0.10

baseline["anomaly"] = baseline["anomaly_score"].apply(
    lambda score: "Anomaly"
    if score < THRESHOLD
    else "Normal"
)

print("✓ Prediction completed.")
print()

#part-4
print("=" * 60)
print("Saving Anomaly Report...")
print("=" * 60)

baseline.to_csv(
    "ml/outputs/anomaly_report.csv",
    index=False
)

print("✓ Report saved successfully.")
print()

print("=" * 60)
print("Sample Results")
print("=" * 60)

# print(
#     baseline[
#         [
#             "user",
#             "avg_login_hour",
#             "avg_session_hours",
#             "unique_pcs",
#             "anomaly"
#         ]
#     ].head(10)
# )

print(
    baseline[
        [
            "user",
            "anomaly_score",
            "avg_login_hour",
            "avg_session_hours",
            "unique_pcs",
            "anomaly"
        ]
    ].head(10)
)

print()

print("=" * 60)
print("Anomaly Summary")
print("=" * 60)

summary = baseline["anomaly"].value_counts()

print(summary)

print()

total_users = len(baseline)
total_anomalies = len(
    baseline[
        baseline["anomaly"] == "Anomaly"
    ]
)

percentage = (total_anomalies / total_users) * 100

print(f"Total Users        : {total_users}")
print(f"Detected Anomalies : {total_anomalies}")
print(f"Anomaly Percentage : {percentage:.2f}%")

print()

#part-5
print("=" * 60)
print("Top Suspicious Employees")
print("=" * 60)

anomalies = baseline[
    baseline["anomaly"] == "Anomaly"
]

# columns = [

#     "user",

#     "avg_login_hour",

#     "avg_logout_hour",

#     "avg_session_hours",

#     "total_logins",

#     "unique_pcs",

#     "device_switches",

#     "offhour_percentage"

# ]

columns = [

    "user",

    "anomaly_score",

    "avg_login_hour",

    "avg_logout_hour",

    "avg_session_hours",

    "total_logins",

    "unique_pcs",

    "device_switches",

    "offhour_percentage"

]

# print(
#     anomalies[columns]
#     .sort_values(
#         by="unique_pcs",
#         ascending=False
#     )
#     .head(20)
# )

print(
    anomalies[columns]
    .sort_values(
        by="anomaly_score",
        ascending=True
    )
    .head(20)
)

print()

print("=" * 60)
print("Anomaly Detection Completed Successfully!")
print("=" * 60)