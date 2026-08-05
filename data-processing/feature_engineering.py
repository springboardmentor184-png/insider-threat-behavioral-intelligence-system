import pandas as pd
from sqlalchemy import create_engine

DB_USER = "postgres"
DB_PASS = "sql%40123456"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "itbis_db"

engine = create_engine(f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

logon = pd.read_sql('SELECT id, date, "user", pc, activity, off_hours_flag FROM logon', engine)
device = pd.read_sql('SELECT id, date, "user", pc, device_type, activity, off_hours_flag FROM device', engine)
file_access = pd.read_sql('SELECT id, date, "user", pc, filename, activity, sensitive_flag, off_hours_flag FROM file_access', engine)
email = pd.read_sql('SELECT id, date, "user", "to", external_flag, size_kb, has_attachment, off_hours_flag FROM email', engine)
http = pd.read_sql('SELECT id, date, "user", pc, url_domain, suspicious_flag, off_hours_flag FROM http', engine)
labels = pd.read_sql('SELECT employee_id, username, label FROM labels', engine)

users = pd.DataFrame({"user": logon["user"].unique()})

# Logon features
total_logons = logon.groupby("user").size().rename("total_logons")
after_hours_logons = logon[logon["off_hours_flag"] == 1].groupby("user").size().rename("after_hours_logons")

# Device features
device_count = device.groupby("user").size().rename("device_activity")
after_hours_device = device[device["off_hours_flag"] == 1].groupby("user").size().rename("after_hours_device")

# File features
file_count = file_access.groupby("user").size().rename("file_access_count")
sensitive_file_count = file_access[file_access["sensitive_flag"] == 1].groupby("user").size().rename("sensitive_file_access")

# Email features
email_count = email.groupby("user").size().rename("emails_sent")
external_email_count = email[email["external_flag"] == 1].groupby("user").size().rename("external_emails")
avg_attachment_size = email.groupby("user")["size_kb"].mean().rename("avg_email_size_kb")

# HTTP features
http_count = http.groupby("user").size().rename("http_activity")
suspicious_http_count = http[http["suspicious_flag"] == 1].groupby("user").size().rename("suspicious_http_hits")

features = users.set_index("user")
for f in [total_logons, after_hours_logons, device_count, after_hours_device,
          file_count, sensitive_file_count, email_count, external_email_count,
          avg_attachment_size, http_count, suspicious_http_count]:
    features = features.join(f)

features = features.fillna(0)

# ratios
features["after_hours_ratio"] = features["after_hours_logons"] / features["total_logons"].replace(0, 1)
features["sensitive_file_ratio"] = features["sensitive_file_access"] / features["file_access_count"].replace(0, 1)
features["external_email_ratio"] = features["external_emails"] / features["emails_sent"].replace(0, 1)
features["suspicious_http_ratio"] = features["suspicious_http_hits"] / features["http_activity"].replace(0, 1)

# combined risk score (simple weighted sum, tune later)
features["risk_score"] = (
    features["after_hours_ratio"] * 2 +
    features["sensitive_file_ratio"] * 3 +
    features["external_email_ratio"] * 3 +
    features["suspicious_http_ratio"] * 2
)

features = features.reset_index()
features = features.merge(labels[["username", "label"]], left_on="user", right_on="username", how="left")
features = features.drop(columns=["username"])

features = features.sort_values("risk_score", ascending=False)
print(features.head(15))

features.to_sql("user_features", engine, if_exists="replace", index=False)
print("\nSaved to 'user_features' table.")

print("\nLabel distribution:")
print(features["label"].value_counts())