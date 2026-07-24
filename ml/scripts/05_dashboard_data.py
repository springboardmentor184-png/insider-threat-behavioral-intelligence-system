import pandas as pd
import json

print("=" * 60)
print("Loading Risk Scores...")
print("=" * 60)

# Load risk scoring output
risk_data = pd.read_csv("ml/outputs/risk_scores.csv")

print(f"Users Loaded : {len(risk_data)}")
print()

# =====================================================
# Dashboard Summary
# =====================================================

print("=" * 60)
print("Generating Dashboard Summary...")
print("=" * 60)

# summary = {
#     "total_users": len(risk_data),

#     "critical_users": (
#         risk_data["risk_level"] == "Critical"
#     ).sum(),

#     "high_risk_users": (
#         risk_data["risk_level"] == "High"
#     ).sum(),

#     "medium_risk_users": (
#         risk_data["risk_level"] == "Medium"
#     ).sum(),

#     "low_risk_users": (
#         risk_data["risk_level"] == "Low"
#     ).sum(),

#     "detected_anomalies": (
#         risk_data["anomaly"] == "Anomaly"
#     ).sum(),

#     "average_risk_score": round(
#         risk_data["risk_score"].mean(),
#         2
#     )
# }

summary = {
    "total_users": int(len(risk_data)),

    "critical_users": int(
        (risk_data["risk_level"] == "Critical").sum()
    ),

    "high_risk_users": int(
        (risk_data["risk_level"] == "High").sum()
    ),

    "medium_risk_users": int(
        (risk_data["risk_level"] == "Medium").sum()
    ),

    "low_risk_users": int(
        (risk_data["risk_level"] == "Low").sum()
    ),

    "detected_anomalies": int(
        (risk_data["anomaly"] == "Anomaly").sum()
    ),

    "average_risk_score": float(
        round(risk_data["risk_score"].mean(), 2)
    )
}



print("Dashboard Summary")
print("-" * 40)

for key, value in summary.items():
    print(f"{key:25}: {value}")

print()




# =====================================================
# Risk Distribution
# =====================================================

print("=" * 60)
print("Generating Risk Distribution...")
print("=" * 60)

# risk_distribution = (
#     risk_data["risk_level"]
#     .value_counts()
#     .to_dict()
# )

risk_distribution = {
    k: int(v)
    for k, v in risk_data["risk_level"].value_counts().items()
}

print("Risk Distribution")

for level, count in risk_distribution.items():
    print(f"{level:10}: {count}")

print()


# =====================================================
# Top 10 Highest Risk Employees
# =====================================================

print("=" * 60)
print("Selecting Top 10 Highest Risk Employees...")
print("=" * 60)

top_risky_users = risk_data.nlargest(
    10,
    "risk_score"
)

print(
    top_risky_users[
        [
            "user",
            "risk_score",
            "risk_level"
        ]
    ]
)

print()











# =====================================================
# Prepare Dashboard JSON
# =====================================================

print("=" * 60)
print("Preparing Dashboard JSON...")
print("=" * 60)

dashboard_data = {
    "summary": summary,

    "risk_distribution": risk_distribution,

    "top_risky_users": []
}

# ------------------------------------
# Add Top Risk Users
# ------------------------------------

for _, row in top_risky_users.iterrows():

    reasons = []

    for i in range(1, 6):
        reason = row[f"reason_{i}"]

        if pd.notna(reason) and reason != "":
            reasons.append(reason)

    dashboard_data["top_risky_users"].append(
        {
            "user": row["user"],
            "risk_score": int(row["risk_score"]),
            "risk_level": row["risk_level"],
            "anomaly": row["anomaly"],
            "reasons": reasons
        }
    )

print("Dashboard data prepared successfully.")
print()





# =====================================================
# Save JSON
# =====================================================

output_json = "ml/outputs/dashboard_data.json"

with open(output_json, "w") as file:
    json.dump(
        dashboard_data,
        file,
        indent=4
    )

print("=" * 60)
print("Dashboard JSON Saved")
print("=" * 60)

print(f"Saved to : {output_json}")

print()

print("=" * 60)
print("Dashboard Data Generation Completed Successfully!")
print("=" * 60)