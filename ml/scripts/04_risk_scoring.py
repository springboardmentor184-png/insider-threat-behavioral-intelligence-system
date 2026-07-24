import pandas as pd
import numpy as np

print("="*60)
print("Loading Files...")
print("="*60)

baseline = pd.read_csv("ml/outputs/baseline.csv")
anomalies = pd.read_csv("ml/outputs/anomaly_report.csv")

# Merge anomaly score & anomaly label
baseline["anomaly"] = anomalies["anomaly"]
baseline["anomaly_score"] = anomalies["anomaly_score"]

print("Users Loaded :", len(baseline))
print()


#part-2
# =====================================================
# Risk Scoring Function
# =====================================================

def calculate_risk(row):

    score = 0
    reasons = []

    # -----------------------------
    # Isolation Forest
    # -----------------------------
    if row["anomaly"] == "Anomaly":
        score = 60
        reasons.append("Isolation Forest detected abnormal behaviour")
    else:
        score=20
    # Off-hour activity
    # -----------------------------

    if row["offhour_percentage"] > 70:
        score += 10
        reasons.append(
            f"Very high off-hour activity ({row['offhour_percentage']:.1f}%)"
        )

    elif row["offhour_percentage"] > 50:
        score += 8
        reasons.append(
            f"High off-hour activity ({row['offhour_percentage']:.1f}%)"
        )

    elif row["offhour_percentage"] > 30:
        score += 5
        reasons.append(
            f"Moderate off-hour activity ({row['offhour_percentage']:.1f}%)"
        )
    if row["night_login_count"] > 100:
        score += 8
        reasons.append(f"{int(row['night_login_count'])} night logins")

    elif row["night_login_count"] > 50:
        score += 5
        reasons.append(f"{int(row['night_login_count'])} night logins")

    elif row["night_login_count"] > 20:
        score += 3
        reasons.append(f"{int(row['night_login_count'])} night logins")
    
    # -----------------------------
    # Night Logins
    # -----------------------------

    # if row["night_login_count"] > 100:
    #     score += 15
    #     reasons.append(
    #         f"{int(row['night_login_count'])} night logins"
    #     )

    # elif row["night_login_count"] > 50:
    #     score += 10
    #     reasons.append(
    #         f"{int(row['night_login_count'])} night logins"
    #     )

    # elif row["night_login_count"] > 20:
    #     score += 5
    #     reasons.append(
    #         f"{int(row['night_login_count'])} night logins"
    #     )

    # -----------------------------
    # Unique PCs
    # -----------------------------

    if row["unique_pcs"] > 1000:
        score += 10
        reasons.append(
            f"Used {int(row['unique_pcs'])} different PCs"
        )

    elif row["unique_pcs"] > 500:
        score += 8
        reasons.append(
            f"Used {int(row['unique_pcs'])} different PCs"
        )

    elif row["unique_pcs"] > 100:
        score += 5
        reasons.append(
            f"Used {int(row['unique_pcs'])} different PCs"
        )

    elif row["unique_pcs"] > 20:
        score += 2
        reasons.append(
            f"Used {int(row['unique_pcs'])} different PCs"
        )


#part-3
    # -----------------------------
    # Device Switching
    # -----------------------------

    if row["device_switches"] > 1000:
        score += 10
        reasons.append(
            f"{int(row['device_switches'])} device switches"
        )

    elif row["device_switches"] > 500:
        score += 8
        reasons.append(
            f"{int(row['device_switches'])} device switches"
        )

    elif row["device_switches"] > 100:
        score += 5
        reasons.append(
            f"{int(row['device_switches'])} device switches"
        )

    # -----------------------------
    # Long Sessions
    # -----------------------------

    if row["avg_session_hours"] > 10:
        score += 5
        reasons.append(
            f"Average session {row['avg_session_hours']:.1f} hours"
        )

    elif row["avg_session_hours"] > 8:
        score += 3
        reasons.append(
            f"Average session {row['avg_session_hours']:.1f} hours"
        )

    # -----------------------------
    # Login Variance
    # -----------------------------

    if row["login_variance"] > 5:
        score += 8
        reasons.append("Very inconsistent login timings")

    elif row["login_variance"] > 3:
        score += 5
        reasons.append("High login variance")

    elif row["login_variance"] > 2:
        score += 3
        reasons.append("Moderate login variance")

    # -----------------------------
    # Very High Login Count
    # -----------------------------

    if row["total_logins"] > 2000:
        score += 5
        reasons.append(
            f"{int(row['total_logins'])} total logins"
        )

    elif row["total_logins"] > 1000:
        score += 3
        reasons.append(
            f"{int(row['total_logins'])} total logins"
        )

    # -----------------------------
    # Cap Risk Score
    # -----------------------------

    score = min(score, 100)

    # -----------------------------
    # Risk Level
    # -----------------------------

    if score >= 80:
        level = "Critical"

    elif score >= 60:
        level = "High"

    elif score >= 30:
        level = "Medium"

    else:
        level = "Low"

    # return pd.Series([
    #     score,
    #     level,
    #     "; ".join(reasons)
    # ])
    while len(reasons) < 5:
        reasons.append("")
    return pd.Series([
    score,
    level,
    reasons[0],
    reasons[1],
    reasons[2],
    reasons[3],
    reasons[4]
])

#part-4
# ===================================================== 
print("="*60)
print("Calculating Risk Scores...")
print("="*60)

baseline[
    [
        "risk_score",
        "risk_level",
        "reason_1",
        "reason_2",
        "reason_3",
        "reason_4",
        "reason_5"
    ]
] = baseline.apply(
    calculate_risk,
    axis=1
)

# -----------------------------------
# Sort by highest risk
# -----------------------------------

baseline = baseline.sort_values(
    by="risk_score",
    ascending=False
)

# -----------------------------------
# Save
# -----------------------------------

output_path = "ml/outputs/risk_scores.csv"

baseline.to_csv(
    output_path,
    index=False
)

print("✓ Risk scores generated successfully.")
print()

print("="*60)
print("Top 20 Highest Risk Employees")
print("="*60)

print(
    baseline[
        [
            "user",
            "risk_score",
            "risk_level"
        ]
    ].head(20)
)

# for _, row in baseline.head(20).iterrows():
#     print("=" * 70)
#     print(f"User       : {row['user']}")
#     print(f"Risk Score : {row['risk_score']}")
#     print(f"Risk Level : {row['risk_level']}")
#     print(f"Anomaly    : {row['anomaly']}")
#     print(f"Reasons:")

#     for i in range(1, 6):
#         reason = row[f"reason_{i}"]
#         if reason:
#             print(f"  ✓ {reason}")
#     print()

# print("=" * 70)
for _, row in baseline.head(20).iterrows():
    print("=" * 70)
    print(f"User       : {row['user']}")
    print(f"Risk Score : {row['risk_score']}")
    print(f"Risk Level : {row['risk_level']}")
    print(f"Anomaly    : {row['anomaly']}")
    print("Reasons:")

    for i in range(1, 6):
        reason = row[f"reason_{i}"]
        if reason:
            print(f"  ✓ {reason}")

    print()

print("=" * 70)


print()

print("="*60)
print("Risk Level Summary")
print("="*60)

print(
    baseline["risk_level"].value_counts()
)

print()

print(f"Saved to : {output_path}")

print()
print("="*60)
print("Risk Scoring Completed Successfully!")
print("="*60)