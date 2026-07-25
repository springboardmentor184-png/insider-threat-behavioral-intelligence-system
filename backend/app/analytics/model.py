import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

def prepare_user_day_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Step 1: Feature Aggregation
    Groups raw activity logs by employee (user) and day, compiling daily counts
    and tracking average hours for logon and USB connections.
    """
    # Ensure necessary columns are filled
    
    df["bytes_transferred"] = pd.to_numeric(df["bytes_transferred"]).fillna(0)
    df["target_asset"] = df["target_asset"].fillna("")
    
    # 1. Identify suspicious URLs in Network web-browsing logs (Job portals / cloud transfers)
    suspicious_domains = ["job", "recruit", "resume", "career", "monster", "indeed", "dropbox", "mediafire", "google-drive", "wetransfer"]
    df["is_suspicious_url"] = df.apply(
        lambda r: 1 if (r["activity_type"] == "NETWORK" and any(word in r["target_asset"].lower() for word in suspicious_domains)) else 0,
        axis=1
    )

    # 2. Perform daily groupings
    logons_per_day = df[(df["activity_type"] == "LOGIN") & (df["action"] == "LOGON")].groupby(["user", "day"]).size().reset_index(name="logon_count")
    devices_per_day = df[(df["activity_type"] == "USB_DEVICE") & (df["action"] == "CONNECT")].groupby(["user", "day"]).size().reset_index(name="usb_connect_count")
    files_per_day = df[df["activity_type"] == "FILE_ACCESS"].groupby(["user", "day"]).size().reset_index(name="file_copy_count")
    emails_per_day = df[df["activity_type"] == "EMAIL"].groupby(["user", "day"]).size().reset_index(name="email_sent_count")
    http_per_day = df[df["activity_type"] == "NETWORK"].groupby(["user", "day"]).size().reset_index(name="http_count")
    susp_http_per_day = df.groupby(["user", "day"])["is_suspicious_url"].sum().reset_index(name="suspicious_http_count")
    
    # Average login hour
    avg_logon_hour = df[(df["activity_type"] == "LOGIN") & (df["action"] == "LOGON")].groupby(["user", "day"])["hour"].mean().reset_index(name="avg_logon_hour")

    # 3. Combine daily metrics into a master features DataFrame
    features_df = df[["user", "day"]].drop_duplicates()
    features_df = pd.merge(features_df, logons_per_day, on=["user", "day"], how="left").fillna(0)
    features_df = pd.merge(features_df, devices_per_day, on=["user", "day"], how="left").fillna(0)
    features_df = pd.merge(features_df, files_per_day, on=["user", "day"], how="left").fillna(0)
    features_df = pd.merge(features_df, emails_per_day, on=["user", "day"], how="left").fillna(0)
    features_df = pd.merge(features_df, http_per_day, on=["user", "day"], how="left").fillna(0)
    features_df = pd.merge(features_df, susp_http_per_day, on=["user", "day"], how="left").fillna(0)
    features_df = pd.merge(features_df, avg_logon_hour, on=["user", "day"], how="left")
    
    # Set default values for missing metrics
    features_df["avg_logon_hour"] = features_df["avg_logon_hour"].fillna(9.0) # Assume standard 9 AM
    features_df["user"] = features_df["user"].astype(str)
    
    return features_df

def compute_user_deviation_zscores(features_df: pd.DataFrame) -> pd.DataFrame:
    """
    Step 2: User-Relative Baseline Engineering (Z-Scores)
    Calculates the historical baseline (mean and std dev) for each employee,
    then transforms counts into standard Z-score deviations:
        Z = (X - μ) / (σ + ε)
    This measures how unusual a day is compared to the employee's personal normal range.
    """
    # Group by employee to calculate personal average and deviation ranges
    user_stats = features_df.groupby("user").agg({
        "logon_count": ["mean", "std"],
        "usb_connect_count": ["mean", "std"],
        "file_copy_count": ["mean", "std"],
        "email_sent_count": ["mean", "std"],
        "http_count": ["mean", "std"],
        "suspicious_http_count": ["mean", "std"],
        "avg_logon_hour": ["mean", "std"]
    })
    
    # Flatten columns index (e.g. logon_count_mean, logon_count_std)
    user_stats.columns = ["_".join(x) for x in user_stats.columns]
    user_stats = user_stats.reset_index()

    # Merge baselines back
    features_df = pd.merge(features_df, user_stats, on="user", how="left")

    # Calculate deviation Z-Scores (adding epsilon to prevent division by zero)
    epsilon = 0.01
    features_df["logon_z"] = (features_df["logon_count"] - features_df["logon_count_mean"]) / (features_df["logon_count_std"] + epsilon)
    features_df["usb_z"] = (features_df["usb_connect_count"] - features_df["usb_connect_count_mean"]) / (features_df["usb_connect_count_std"] + epsilon)
    features_df["file_z"] = (features_df["file_copy_count"] - features_df["file_copy_count_mean"]) / (features_df["file_copy_count_std"] + epsilon)
    features_df["email_z"] = (features_df["email_sent_count"] - features_df["email_sent_count_mean"]) / (features_df["email_sent_count_std"] + epsilon)
    features_df["http_z"] = (features_df["http_count"] - features_df["http_count_mean"]) / (features_df["http_count_std"] + epsilon)
    features_df["susp_http_z"] = (features_df["suspicious_http_count"] - features_df["suspicious_http_count_mean"]) / (features_df["suspicious_http_count_std"] + epsilon)
    features_df["logon_hour_z"] = (features_df["avg_logon_hour"] - features_df["avg_logon_hour_mean"]) / (features_df["avg_logon_hour_std"] + epsilon)

    return features_df

def fit_anomaly_isolation_forest(features_df: pd.DataFrame, contamination: float = 0.025) -> pd.DataFrame:
    """
    Step 3: Unsupervised Machine Learning Model
    Trains an Isolation Forest outlier detection model on the Z-score deviation features.
    Saves anomaly scores and predicts outlier indices (prediction = -1).
    """
    deviation_features = ["logon_z", "usb_z", "file_z", "email_z", "http_z", "susp_http_z", "logon_hour_z"]
    X = features_df[deviation_features].values
    
    # Train unsupervised forest model
    iso_forest = IsolationForest(n_estimators=150, contamination=contamination, random_state=42)
    features_df["anomaly_score"] = iso_forest.fit(X).decision_function(X)
    features_df["prediction"] = iso_forest.predict(X) # -1 indicates outlier, 1 is normal
    
    return features_df
