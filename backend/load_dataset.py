import pandas as pd
from app.database import SessionLocal
from app.models import ActivityLog

def load_logon_data(db):
    df = pd.read_csv("../dataset/logon_sample.csv")
    df["date"] = pd.to_datetime(df["date"], format="%m/%d/%Y %H:%M:%S")
    count = 0
    for _, row in df.iterrows():
        db.add(ActivityLog(
            employee=row["user"],
            activity=row["activity"],
            device=row["pc"],
            ip_address=None,
            timestamp=row["date"]
        ))
        count += 1
    db.commit()
    print(f"Inserted {count} logon records")


def load_device_data(db):
    df = pd.read_csv("../dataset/device_sample.csv")
    df["date"] = pd.to_datetime(df["date"], format="%m/%d/%Y %H:%M:%S")
    count = 0
    for _, row in df.iterrows():
        db.add(ActivityLog(
            employee=row["user"],
            activity=row["activity"],
            device=row["pc"],
            ip_address=None,
            timestamp=row["date"]
        ))
        count += 1
    db.commit()
    print(f"Inserted {count} device records")

if __name__ == "__main__":
    db = SessionLocal()
    load_logon_data(db)
    load_device_data(db)
    db.close()
    print("Dataset loaded successfully into activity_logs")