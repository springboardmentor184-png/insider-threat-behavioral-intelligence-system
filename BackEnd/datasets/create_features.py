import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

INPUT_FILE = os.path.join(
    BASE_DIR,
    "processed",
    "logon_cleaned_1000.csv"
)

OUTPUT_FILE = os.path.join(
    BASE_DIR,
    "processed",
    "behavioral_features.csv"
)

df = pd.read_csv(INPUT_FILE)

df["date"] = pd.to_datetime(
    df["date"],
    errors="coerce"
)

df["hour"] = df["date"].dt.hour

df["day_of_week"] = df["date"].dt.dayofweek

df["is_after_hours"] = (
    (df["hour"] < 6) |
    (df["hour"] >= 22)
).astype(int)

df["is_weekend"] = (
    df["day_of_week"] >= 5
).astype(int)

user_stats = df.groupby("user").agg(
    login_count=("user", "count"),
    unique_devices=("pc", "nunique"),
    after_hours_logins=("is_after_hours", "sum"),
    weekend_logins=("is_weekend", "sum")
).reset_index()

user_stats["after_hours_ratio"] = (
    user_stats["after_hours_logins"] /
    user_stats["login_count"]
)

user_stats["weekend_ratio"] = (
    user_stats["weekend_logins"] /
    user_stats["login_count"]
)

user_stats = user_stats.fillna(0)

user_stats.to_csv(
    OUTPUT_FILE,
    index=False
)

print("Behavioral feature engineering completed")

print(f"Rows: {len(user_stats)}")

print(f"Columns: {list(user_stats.columns)}")

print("\nBehavioral Features:")

print(user_stats.head())

print(f"\nSaved to: {OUTPUT_FILE}")