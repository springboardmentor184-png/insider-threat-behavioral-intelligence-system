import os
import sys
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(os.path.dirname(BASE_DIR))
DATASET_DIR = os.path.join(ROOT_DIR, "dataset")
sys.path.insert(0, ROOT_DIR)
from database.db_connection import get_connection

def load_logon_data(sample=True):
    filename = "logon_sample.csv" if sample else "logon.csv"
    path = os.path.join(DATASET_DIR, filename)
    return pd.read_csv(path)


def load_device_data(sample=True):
    filename = "device_sample.csv" if sample else "device.csv"
    path = os.path.join(DATASET_DIR, filename)
    return pd.read_csv(path)


def clean_logon_data(df: pd.DataFrame) -> pd.DataFrame:
    df["date"] = pd.to_datetime(df["date"], format="%m/%d/%Y %H:%M:%S", errors="coerce")
    df = df.dropna(subset=["user", "pc", "date"])
    return df


def clean_device_data(df: pd.DataFrame) -> pd.DataFrame:
    df["date"] = pd.to_datetime(df["date"], format="%m/%d/%Y %H:%M:%S", errors="coerce")
    df = df.dropna(subset=["user", "pc", "date"])
    return df


def engineer_logon_features(df: pd.DataFrame) -> pd.DataFrame:
    """Per-user logon behavior features."""
    df["hour"] = df["date"].dt.hour
    df["after_hours"] = df["hour"].apply(lambda h: 1 if h < 6 or h > 20 else 0)

    logons_only = df[df["activity"] == "Logon"]

    features = (
        logons_only.groupby("user")
        .agg(
            total_logons=("date", "count"),
            after_hours_logons=("after_hours", "sum"),
            unique_pcs_used=("pc", "nunique"),
        )
        .reset_index()
    )
    return features

def engineer_device_features(df: pd.DataFrame) -> pd.DataFrame:
    """Per-user USB device usage features."""
    connects_only = df[df["activity"] == "Connect"]

    features = (
        connects_only.groupby("user")
        .agg(
            total_device_connects=("date", "count"),
            unique_pcs_used_for_devices=("pc", "nunique"),
        )
        .reset_index()
    )
    return features


def run_preprocessing_pipeline(sample=True):
    """Full pipeline: load, clean, and merge logon + device features per user."""
    logon_df = clean_logon_data(load_logon_data(sample))
    device_df = clean_device_data(load_device_data(sample))

    logon_features = engineer_logon_features(logon_df)
    device_features = engineer_device_features(device_df)

    # Merge both feature sets on 'user'
    combined = pd.merge(logon_features, device_features, on="user", how="outer").fillna(0)

    # Simple risk flag example: high after-hours activity + high device usage
    combined["risk_flag"] = (
        (combined["after_hours_logons"] > 5) | (combined["total_device_connects"] > 10)
    )

    return combined

def save_to_database(df):
    conn = get_connection()
    cursor = conn.cursor()

    sql = """
    INSERT INTO user_behavior_features
    (employee_id, total_logons, after_hours_logons,
     unique_pcs_used, total_device_connects,
     unique_pcs_used_for_devices, risk_flag)
    VALUES (%s,%s,%s,%s,%s,%s,%s)
    """

    for _, row in df.iterrows():
        cursor.execute(sql, (
            row["user"],
            int(row["total_logons"]),
            int(row["after_hours_logons"]),
            int(row["unique_pcs_used"]),
            int(row["total_device_connects"]),
            int(row["unique_pcs_used_for_devices"]),
            bool(row["risk_flag"])
        ))

    conn.commit()
    cursor.close()
    conn.close()

    print("Data inserted successfully!")





def create_sample_files(nrows=5000):
    """One-time utility: create small sample CSVs from the full datasets."""
    logon = pd.read_csv(os.path.join(DATASET_DIR, "logon.csv"), nrows=nrows)
    logon.to_csv(os.path.join(DATASET_DIR, "logon_sample.csv"), index=False)
    print("logon_sample.csv created with", len(logon), "rows")

    device = pd.read_csv(os.path.join(DATASET_DIR, "device.csv"), nrows=nrows)
    device.to_csv(os.path.join(DATASET_DIR, "device_sample.csv"), index=False)
    print("device_sample.csv created with", len(device), "rows")

if __name__ == "__main__":
    result = run_preprocessing_pipeline(sample=True)

    print(result.head(20))
    print("Total users processed:", len(result))
    print("Users flagged as risky:", result["risk_flag"].sum())

    save_to_database(result)