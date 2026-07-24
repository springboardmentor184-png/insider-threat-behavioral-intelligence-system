import pandas as pd
import numpy as np
from pathlib import Path

# =====================================================
# Paths
# =====================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = PROJECT_ROOT / "ml" / "datasets" / "r1" / "logon.csv"

OUTPUT_PATH = PROJECT_ROOT / "ml" / "outputs" / "baseline.csv"


# =====================================================
# Load Dataset
# =====================================================

print("=" * 60)
print("Loading CERT Logon Dataset...")
print("=" * 60)

df = pd.read_csv(DATA_PATH)

print("Rows :", len(df))
print("Columns :", df.columns.tolist())


# =====================================================
# Convert datetime
# =====================================================

df["date"] = pd.to_datetime(
    df["date"],
    format="%m/%d/%Y %H:%M:%S"
)

df = df.sort_values(
    ["user", "date"]
).reset_index(drop=True)


# =====================================================
# Create useful columns
# =====================================================

df["hour"] = df["date"].dt.hour
df["weekday"] = df["date"].dt.weekday
df["is_weekend"] = df["weekday"] >= 5


print("\nDataset Loaded Successfully\n")

#part-2
# =====================================================
# Build User Sessions (Logon -> Logoff)
# =====================================================

print("=" * 60)
print("Building User Sessions...")
print("=" * 60)

sessions = []

for user in df["user"].unique():

    user_df = df[df["user"] == user].sort_values("date")

    active_sessions = {}

    for _, row in user_df.iterrows():

        pc = row["pc"]

        if row["activity"] == "Logon":

            # store latest logon for that PC
            active_sessions[pc] = row["date"]

        elif row["activity"] == "Logoff":

            if pc in active_sessions:

                login_time = active_sessions.pop(pc)

                logout_time = row["date"]

                duration = (
                    logout_time - login_time
                ).total_seconds() / 3600

                # Ignore impossible sessions
                if duration >= 0:

                    sessions.append({

                        "user": user,

                        "pc": pc,

                        "login_time": login_time,

                        "logout_time": logout_time,

                        "session_hours": duration,

                        "login_hour": login_time.hour
                            + login_time.minute / 60,

                        "logout_hour": logout_time.hour
                            + logout_time.minute / 60,

                        "weekday": login_time.weekday(),

                        "is_weekend":
                            login_time.weekday() >= 5

                    })


sessions = pd.DataFrame(sessions)

print("\nTotal Sessions Created :", len(sessions))
print(sessions.head())

#part-3
# =====================================================
# Device Switching
# =====================================================

print("=" * 60)
print("Calculating Device Switching...")
print("=" * 60)

device_switches = {}

for user in sessions["user"].unique():

    temp = sessions[
        sessions["user"] == user
    ].sort_values("login_time")

    switches = 0

    previous_pc = None

    for pc in temp["pc"]:

        if previous_pc is not None:

            if pc != previous_pc:

                switches += 1

        previous_pc = pc

    device_switches[user] = switches


#part-4
# =====================================================
# Feature Engineering
# =====================================================

print("=" * 60)
print("Generating Behaviour Features...")
print("=" * 60)

baseline = []

for user in sessions["user"].unique():

    temp = sessions[
        sessions["user"] == user
    ]

    total_sessions = len(temp)

    primary_pc = temp["pc"].mode().iloc[0]

    primary_pc_percent = (
        (temp["pc"] == primary_pc).sum()
        / total_sessions
    ) * 100

    night_logins = (
        temp["login_hour"] < 6
    ).sum()

    offhour = (
        (
            temp["login_hour"] < 8
        ) |
        (
            temp["login_hour"] > 18
        )
    ).sum()

    baseline.append({

        "user": user,

        "avg_login_hour":
            temp["login_hour"].mean(),

        "login_variance":
            temp["login_hour"].std(),

        "avg_logout_hour":
            temp["logout_hour"].mean(),

        "logout_variance":
            temp["logout_hour"].std(),

        "avg_session_hours":
            temp["session_hours"].mean(),

        "max_session_hours":
            temp["session_hours"].max(),

        "min_session_hours":
            temp["session_hours"].min(),

        "session_variance":
            temp["session_hours"].std(),

        "total_logins":
            total_sessions,

        "working_days":
            temp["login_time"].dt.date.nunique(),

        "avg_logins_per_day":
            total_sessions
            / temp["login_time"].dt.date.nunique(),

        "unique_pcs":
            temp["pc"].nunique(),

        "primary_pc":
            primary_pc,

        "primary_pc_percentage":
            primary_pc_percent,

        "device_switches":
            device_switches[user],

        "night_login_count":
            night_logins,

        "offhour_percentage":
            offhour
            / total_sessions
            * 100,

        "weekend_logins":
            temp["is_weekend"].sum(),

        "weekday_logins":
            (~temp["is_weekend"]).sum(),

        "first_login":
            temp["login_time"].min(),

        "last_login":
            temp["logout_time"].max()

    })

baseline = pd.DataFrame(baseline)

#part-5
# =====================================================
# Save Baseline
# =====================================================

baseline = baseline.fillna(0)

baseline.to_csv(
    OUTPUT_PATH,
    index=False
)

print("\nBaseline Generated Successfully!\n")

print(baseline.head(10))

print("\nColumns Created")
print("=" * 60)

for col in baseline.columns:
    print(col)

print("\nTotal Users :", len(baseline))

print("\nSaved to")

print(OUTPUT_PATH)
