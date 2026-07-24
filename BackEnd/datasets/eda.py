import pandas as pd
import matplotlib.pyplot as plt
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

INPUT_FILE = os.path.join(
    BASE_DIR,
    "processed",
    "logon_cleaned_1000.csv"
)

EDA_DIR = os.path.join(
    BASE_DIR,
    "processed",
    "eda"
)

os.makedirs(EDA_DIR, exist_ok=True)

df = pd.read_csv(INPUT_FILE)

print("Dataset Shape:")
print(df.shape)

print("\nDataset Columns:")
print(df.columns.tolist())

print("\nDataset Information:")
print(df.info())

print("\nStatistical Summary:")
print(df.describe(include="all"))

print("\nMissing Values:")
print(df.isnull().sum())

print("\nDuplicate Rows:")
print(df.duplicated().sum())

if "activity" in df.columns:

    print("\nActivity Distribution:")
    print(df["activity"].value_counts())

    df["activity"].value_counts().plot(
        kind="bar"
    )

    plt.title("Login Activity Distribution")
    plt.xlabel("Activity")
    plt.ylabel("Count")
    plt.tight_layout()

    plt.savefig(
        os.path.join(
            EDA_DIR,
            "activity_distribution.png"
        )
    )

    plt.close()


if "user" in df.columns:

    user_activity = df["user"].value_counts().head(20)

    user_activity.plot(
        kind="bar"
    )

    plt.title("Top 20 Most Active Users")
    plt.xlabel("User")
    plt.ylabel("Activity Count")
    plt.xticks(rotation=45)

    plt.tight_layout()

    plt.savefig(
        os.path.join(
            EDA_DIR,
            "user_activity.png"
        )
    )

    plt.close()


if "pc" in df.columns:

    pc_activity = df["pc"].value_counts().head(20)

    pc_activity.plot(
        kind="bar"
    )

    plt.title("Top 20 Most Used Computers")
    plt.xlabel("Computer")
    plt.ylabel("Activity Count")
    plt.xticks(rotation=45)

    plt.tight_layout()

    plt.savefig(
        os.path.join(
            EDA_DIR,
            "computer_activity.png"
        )
    )

    plt.close()


if "date" in df.columns:

    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    )

    df["hour"] = df["date"].dt.hour

    df["hour"].value_counts().sort_index().plot(
        kind="bar"
    )

    plt.title("Login Activity by Hour")
    plt.xlabel("Hour")
    plt.ylabel("Activity Count")

    plt.tight_layout()

    plt.savefig(
        os.path.join(
            EDA_DIR,
            "login_time_distribution.png"
        )
    )

    plt.close()


print("\nEDA COMPLETED")

print(f"EDA results saved to: {EDA_DIR}")