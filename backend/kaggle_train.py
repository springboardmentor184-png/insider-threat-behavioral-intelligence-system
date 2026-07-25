# ==============================================================================
#  CERT Insider Threat Anomaly Detection - Kaggle Notebook Training Script
# ==============================================================================
# This script is designed to run in a Kaggle Notebook or any Jupyter Notebook.
# It loads the official CERT dataset CSV files (including HTTP logs), performs
# user-relative deviation Z-score feature engineering, trains an Isolation Forest model,
# and outputs the detected anomalies as a new CSV.
# ==============================================================================

import os
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import datetime

# 1. CONFIGURE FILE PATHS
# Update this directory path to match where you uploaded/mounted the dataset on Kaggle
# In Kaggle, standard input path is: "/kaggle/input/<dataset-name>/r4.2/"
DATASET_DIR = "./"  # Set to "." for local running, or "/kaggle/input/cert-insider-threat-dataset-r4-2/r4.2/" on Kaggle

print("[*] Starting CERT Dataset Analysis & Anomaly Detection Model Training...")

# Helper to check if file exists (case-insensitive)
def get_path(filename):
    p = os.path.join(DATASET_DIR, filename)
    if not os.path.exists(p):
        for f in os.listdir(DATASET_DIR):
            if f.lower() == filename.lower():
                return os.path.join(DATASET_DIR, f)
    return p

# 2. LOAD DATASETS
try:
    print("[*] Loading logon.csv...")
    df_logon = pd.read_csv(get_path("logon.csv"))
    print(f"[+] Loaded {len(df_logon)} logon logs.")
    
    print("[*] Loading device.csv...")
    df_device = pd.read_csv(get_path("device.csv"))
    print(f"[+] Loaded {len(df_device)} device logs.")
    
    print("[*] Loading file.csv...")
    df_file = pd.read_csv(get_path("file.csv"))
    print(f"[+] Loaded {len(df_file)} file logs.")
    
    print("[*] Loading email.csv...")
    df_email = pd.read_csv(get_path("email.csv"))
    print(f"[+] Loaded {len(df_email)} email logs.")
    
    # Check if http.csv is available and load it memory-efficiently
    http_path = get_path("http.csv")
    has_http = False
    if os.path.exists(http_path):
        print("[*] Loading http.csv (using memory-optimized column filters)...")
        # Read ONLY the date, user, and url columns to save RAM on Kaggle
        df_http = pd.read_csv(
            http_path,
            usecols=["date", "user", "url"],
            dtype={"user": "category", "url": "string"}
        )
        print(f"[+] Loaded {len(df_http)} http logs successfully.")
        has_http = True
    else:
        print("[!] Warning: http.csv not found in folder. Proceeding without web logs features.")
        
except Exception as e:
    print(f"[-] Load failed: {e}")
    print("[-] Please ensure that DATASET_DIR is pointing to the correct extracted files path.")
    raise

# 3. FEATURE ENGINEERING (EVENT-LEVEL PROCESSING)
print("\n[*] Processing timestamps and categorical vectors...")

# Parse datetime timestamps
df_logon["date"] = pd.to_datetime(df_logon["date"], format="%m/%d/%Y %H:%M:%S")
df_device["date"] = pd.to_datetime(df_device["date"], format="%m/%d/%Y %H:%M:%S")
df_file["date"] = pd.to_datetime(df_file["date"], format="%m/%d/%Y %H:%M:%S")
df_email["date"] = pd.to_datetime(df_email["date"], format="%m/%d/%Y %H:%M:%S")

if has_http:
    df_http["date"] = pd.to_datetime(df_http["date"], format="%m/%d/%Y %H:%M:%S")

# Extract hour offsets
df_logon["hour"] = df_logon["date"].dt.hour + df_logon["date"].dt.minute / 60.0
df_device["hour"] = df_device["date"].dt.hour + df_device["date"].dt.minute / 60.0

# Extract date for daily grouping
df_logon["day"] = df_logon["date"].dt.date
df_device["day"] = df_device["date"].dt.date
df_file["day"] = df_file["date"].dt.date
df_email["day"] = df_email["date"].dt.date

if has_http:
    df_http["day"] = df_http["date"].dt.date

# 4. STATIC CLASSIFICATION FOR SUSPICIOUS WEB BROWSING (if HTTP is loaded)
if has_http:
    print("[*] Extracting suspicious web domain markers (Job searching / Cloud storage)...")
    suspicious_domains = ["job", "recruit", "resume", "career", "monster", "indeed", "dropbox", "mediafire", "google-drive", "wetransfer"]
    df_http["is_suspicious_url"] = df_http["url"].str.contains("|".join(suspicious_domains), case=False, na=False).astype(int)

# 5. COMPILING DAILY BEHAVIORAL MATRIX (PER-USER PER-DAY BEHAVIOR BASES)
print("[*] Aggregating daily activities per user...")

logons_per_day = df_logon[df_logon["activity"] == "Logon"].groupby(["user", "day"]).size().reset_index(name="logon_count")
devices_per_day = df_device[df_device["activity"] == "Connect"].groupby(["user", "day"]).size().reset_index(name="usb_connect_count")
files_per_day = df_file.groupby(["user", "day"]).size().reset_index(name="file_copy_count")
emails_per_day = df_email.groupby(["user", "day"]).size().reset_index(name="email_sent_count")
avg_logon_hour = df_logon[df_logon["activity"] == "Logon"].groupby(["user", "day"])["hour"].mean().reset_index(name="avg_logon_hour")

# Merge features into a master user-day matrix
features_df = df_logon[["user", "day"]].drop_duplicates()
features_df = pd.merge(features_df, logons_per_day, on=["user", "day"], how="left").fillna(0)
features_df = pd.merge(features_df, devices_per_day, on=["user", "day"], how="left").fillna(0)
features_df = pd.merge(features_df, files_per_day, on=["user", "day"], how="left").fillna(0)
features_df = pd.merge(features_df, emails_per_day, on=["user", "day"], how="left").fillna(0)
features_df = pd.merge(features_df, avg_logon_hour, on=["user", "day"], how="left")
features_df["avg_logon_hour"] = features_df["avg_logon_hour"].fillna(9.0)

# Merge HTTP features if available
if has_http:
    http_per_day = df_http.groupby(["user", "day"]).size().reset_index(name="http_count")
    susp_http_per_day = df_http.groupby(["user", "day"])["is_suspicious_url"].sum().reset_index(name="suspicious_http_count")
    
    features_df = pd.merge(features_df, http_per_day, on=["user", "day"], how="left").fillna(0)
    features_df = pd.merge(features_df, susp_http_per_day, on=["user", "day"], how="left").fillna(0)
    
features_df["user"] = features_df["user"].astype(str)

# 6. CALCULATE HISTORICAL USER-RELATIVE BASELINES (THE KEY TO HIGHER RECALL)
print("[*] Calculating personal baselines for every employee...")
stats_dict = {
    "logon_count": ["mean", "std"],
    "usb_connect_count": ["mean", "std"],
    "file_copy_count": ["mean", "std"],
    "email_sent_count": ["mean", "std"],
    "avg_logon_hour": ["mean", "std"]
}
if has_http:
    stats_dict["http_count"] = ["mean", "std"]
    stats_dict["suspicious_http_count"] = ["mean", "std"]

user_stats = features_df.groupby("user").agg(stats_dict)
user_stats.columns = ["_".join(x) for x in user_stats.columns]
user_stats = user_stats.reset_index()

# Merge user baselines back into main features dataframe
features_df = pd.merge(features_df, user_stats, on="user", how="left")

# Compute Deviation Z-Scores (value - mean) / (std + epsilon)
print("[*] Engineering deviation Z-scores...")
epsilon = 0.01

features_df["logon_z"] = (features_df["logon_count"] - features_df["logon_count_mean"]) / (features_df["logon_count_std"] + epsilon)
features_df["usb_z"] = (features_df["usb_connect_count"] - features_df["usb_connect_count_mean"]) / (features_df["usb_connect_count_std"] + epsilon)
features_df["file_z"] = (features_df["file_copy_count"] - features_df["file_copy_count_mean"]) / (features_df["file_copy_count_std"] + epsilon)
features_df["email_z"] = (features_df["email_sent_count"] - features_df["email_sent_count_mean"]) / (features_df["email_sent_count_std"] + epsilon)
features_df["logon_hour_z"] = (features_df["avg_logon_hour"] - features_df["avg_logon_hour_mean"]) / (features_df["avg_logon_hour_std"] + epsilon)

if has_http:
    features_df["http_z"] = (features_df["http_count"] - features_df["http_count_mean"]) / (features_df["http_count_std"] + epsilon)
    features_df["susp_http_z"] = (features_df["suspicious_http_count"] - features_df["suspicious_http_count_mean"]) / (features_df["suspicious_http_count_std"] + epsilon)

# 7. TRAIN ML MODEL (ISOLATION FOREST ON DEVIATIONS)
print("\n[*] Initializing Isolation Forest model on deviation features...")

deviation_features = ["logon_z", "usb_z", "file_z", "email_z", "logon_hour_z"]
if has_http:
    deviation_features += ["http_z", "susp_http_z"]
    
X = features_df[deviation_features].values

# Set contamination to 2.5% to ensure all threat actors are detected with high sensitivity
iso_forest = IsolationForest(n_estimators=150, contamination=0.025, random_state=42, n_jobs=-1)

print("[*] Training Isolation Forest model...")
features_df["anomaly_score"] = iso_forest.fit(X).decision_function(X)
features_df["prediction"] = iso_forest.predict(X) # -1 is anomaly, 1 is normal

# 8. EXTRACT ANOMALOUS INCIDENTS
anomalies = features_df[features_df["prediction"] == -1].sort_values(by="anomaly_score")
print(f"\n[+] Training complete! Flagged {len(anomalies)} anomalous user-day records out of {len(features_df)}.")

# 9. EXPORT RESULTS
output_file = "detected_insider_anomalies.csv"
anomalies.to_csv(output_file, index=False)
print(f"[+] Successfully saved detected anomalies spreadsheet to: {output_file}")

# 10. ANALYZE RESULTS
print("\n=== TOP 10 SUSPICIOUS EMPLOYEES BY ANOMALY COUNT ===")
top_threats = anomalies["user"].value_counts().head(10)
print(top_threats)

print("\n=== SAMPLE HIGH-RISK ANOMALY DATA ===")
sample_cols = ["user", "day", "logon_count", "usb_connect_count", "file_copy_count", "anomaly_score"]
if has_http:
    sample_cols += ["http_count"]
print(anomalies.head(10)[sample_cols])
