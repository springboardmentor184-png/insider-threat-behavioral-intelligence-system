import pandas as pd


print("Loading dataset...")

# Load only 100000 records for training
df = pd.read_csv(
    "ml/datasets/email.csv",
    nrows=100000
)

print("Dataset Loaded Successfully!")
print(df.head())


# -----------------------------
# Feature 1 - Email Size
# -----------------------------
df["email_size"] = df["size"]


# -----------------------------
# Feature 2 - Number of Attachments
# -----------------------------
df["attachment_count"] = df["attachments"]


# -----------------------------
# Feature 3 - Email Hour
# -----------------------------
df["date"] = pd.to_datetime(
    df["date"],
    format="%m/%d/%Y %H:%M:%S"
)

df["hour"] = df["date"].dt.hour


# -----------------------------
# Feature 4 - Day of Week
# -----------------------------
df["day_of_week"] = df["date"].dt.dayofweek


# -----------------------------
# Feature 5 - Email Length
# -----------------------------
df["content_length"] = df["content"].str.len()


# -----------------------------
# Final Features
# -----------------------------
features = df[
    [
        "email_size",
        "attachment_count",
        "hour",
        "day_of_week",
        "content_length"
    ]
]

print("\nBehavioral Features\n")
print(features.head())


# Save engineered features
features.to_csv(
    "ml/datasets/features.csv",
    index=False
)

print("\nFeature engineering completed successfully!")