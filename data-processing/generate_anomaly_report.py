import json
import pandas as pd
from sqlalchemy import create_engine

DB_USER = "postgres"
DB_PASS = "sql%40123456"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "itbis_db"

engine = create_engine(f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

results = pd.read_sql('SELECT * FROM model_results', engine)
features = pd.read_sql('SELECT * FROM user_features', engine)

df = results.merge(features, on=["user", "label"], how="left")

THRESHOLD = 0.5  # rf_malicious_prob above this = flagged


def explain(row):
    reasons = []
    if row["after_hours_ratio"] > 0.15:
        reasons.append(f"Off-hours logon activity ({row['after_hours_ratio']*100:.0f}% of logons)")
    if row["sensitive_file_ratio"] > 0.15:
        reasons.append(f"Accessed sensitive files ({row['sensitive_file_ratio']*100:.0f}% of file activity)")
    if row["external_email_ratio"] > 0.1:
        reasons.append(f"Sent emails to external domains ({row['external_email_ratio']*100:.0f}% of emails)")
    if row["suspicious_http_ratio"] > 0.1:
        reasons.append(f"Visited suspicious domains ({row['suspicious_http_ratio']*100:.0f}% of web activity)")
    if row.get("after_hours_device", 0) > 0:
        reasons.append(f"Off-hours device connections ({int(row['after_hours_device'])} events)")
    return reasons if reasons else ["No specific behavioral triggers above threshold"]


report = []
for _, row in df.iterrows():
    flagged = row["rf_malicious_prob"] >= THRESHOLD or row["iso_forest_flag"] == 1
    report.append({
        "user": row["user"],
        "label": row["label"],
        "flagged": bool(flagged),
        "risk_score": round(float(row["risk_score"]), 3),
        "rf_malicious_prob": round(float(row["rf_malicious_prob"]), 3),
        "iso_forest_flag": int(row["iso_forest_flag"]),
        "reasons": explain(row) if flagged else [],
        "metrics": {
            "total_logons": int(row["total_logons"]),
            "after_hours_logons": int(row["after_hours_logons"]),
            "sensitive_file_access": int(row["sensitive_file_access"]),
            "external_emails": int(row["external_emails"]),
            "suspicious_http_hits": int(row["suspicious_http_hits"]),
        }
    })

report = sorted(report, key=lambda r: r["rf_malicious_prob"], reverse=True)

with open("anomaly_report.json", "w") as f:
    json.dump(report, f, indent=2)

report_df = pd.json_normalize(report)

import json as json_lib
report_df["reasons"] = report_df["reasons"].apply(json_lib.dumps)
report_df.to_sql("anomaly_reports", engine, if_exists="replace", index=False)

flagged_count = sum(r["flagged"] for r in report)
print(f"Report generated: {flagged_count} flagged users out of {len(report)}")
print("Saved anomaly_report.json and 'anomaly_reports' table.")