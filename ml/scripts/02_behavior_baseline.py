# import pandas as pd

# # Load dataset
# df = pd.read_csv(r"C:\Users\Suhas\OneDrive\Desktop\Insider-Threat-Behavioral-Intelligence-System\ml\datasets\r1\logon.csv")


# # Convert date column into datetime format
# df["date"] = pd.to_datetime(
#     df["date"],
#     format="%m/%d/%Y %H:%M:%S"
# )

# # Extract useful features
# df["hour"] = df["date"].dt.hour
# df["day"] = df["date"].dt.day_name()
# df["month"] = df["date"].dt.month
# df["date_only"] = df["date"].dt.date


# print(df.head())

# baseline = (
#     df.groupby("user")
#       .agg(
#           avg_login_hour=("hour", "mean"),
#           total_logins=("activity", "count"),
#           unique_pcs=("pc", "nunique"),
#           first_login=("date", "min"),
#           last_login=("date", "max"),
#       )
#       .reset_index()
# )

# print(baseline.head())

# baseline.to_csv(
#     r"C:\Users\Suhas\OneDrive\Desktop\Insider-Threat-Behavioral-Intelligence-System\ml\outputs\baseline.csv",
#     index=False
# )

# print("Behavior baseline saved successfully!")


import pandas as pd
from pathlib import Path

# -----------------------------
# Load Dataset
# -----------------------------

BASE_DIR = Path(__file__).resolve().parents[2]

logon = pd.read_csv(
    BASE_DIR / "ml/datasets/r1/logon.csv"
)

# -----------------------------
# Convert Date
# -----------------------------

logon["date"] = pd.to_datetime(
    logon["date"],
    format="%m/%d/%Y %H:%M:%S"
)

logon["hour"] = (
    logon["date"].dt.hour +
    logon["date"].dt.minute / 60
)

logon["day"] = logon["date"].dt.date

# -----------------------------
# Separate Logons / Logoffs
# -----------------------------

logins = logon[
    logon["activity"] == "Logon"
].copy()

logoffs = logon[
    logon["activity"] == "Logoff"
].copy()

# Rename logout column
logoffs = logoffs.rename(
    columns={
        "date": "logout_time"
    }
)

# -----------------------------
# Match Login with Logout
# -----------------------------

sessions = pd.merge_asof(

    logins.sort_values("date"),

    logoffs.sort_values("logout_time"),

    by=["user", "pc"],

    left_on="date",

    right_on="logout_time",

    direction="forward"

)

# -----------------------------
# Session Duration
# -----------------------------

sessions["session_hours"] = (

    sessions["logout_time"] -
    sessions["date"]

).dt.total_seconds() / 3600

# Remove broken sessions
sessions = sessions[
    sessions["session_hours"] > 0
]

# -----------------------------
# Login Features
# -----------------------------

login_features = logins.groupby("user").agg(

    avg_login_hour=("hour", "mean"),

    login_variance=("hour", "std"),

    total_logins=("user", "count"),

    unique_pcs=("pc", "nunique"),

    working_days=("day", "nunique"),

    first_login=("date", "min"),

    last_login=("date", "max")

)

# -----------------------------
# Logout Features
# -----------------------------

logoffs["logout_hour"] = (

    logoffs["logout_time"].dt.hour +
    logoffs["logout_time"].dt.minute / 60

)

logout_features = logoffs.groupby("user").agg(

    avg_logout_hour=("logout_hour", "mean"),

    logout_variance=("logout_hour", "std")

)

# -----------------------------
# Session Features
# -----------------------------

session_features = sessions.groupby("user").agg(

    avg_session_hours=("session_hours", "mean")

)

# -----------------------------
# Combine Everything
# -----------------------------

baseline = login_features.join(

    logout_features

).join(

    session_features

)

baseline = baseline.fillna(0)

baseline = baseline.reset_index()

# -----------------------------
# Save
# -----------------------------

output_path = BASE_DIR / "ml/outputs/baseline.csv"

baseline.to_csv(

    output_path,

    index=False

)

print("\nBaseline Generated Successfully!\n")

print(baseline.head(10))

print("\nColumns:")

print(baseline.columns)