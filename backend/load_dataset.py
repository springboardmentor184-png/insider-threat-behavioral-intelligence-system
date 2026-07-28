import pandas as pd
from app.database import SessionLocal
from app.models import ActivityLog
ACTIVITY_MAP = {
    "Logon": "Login",
    "Login": "Login",
    "Logoff": "Logout",
    "Connect": "USB Connect",
    "Disconnect": "USB Disconnect",
    "www visit": "Web Access",
    "www download": "Web Download",
    "www upload": "Web Upload",
}
def normalize_activity(raw_activity: str) -> str:
    return ACTIVITY_MAP.get(raw_activity, raw_activity)

def bulk_insert(db, records, batch_size=5000):
    for i in range(0, len(records), batch_size):
        db.bulk_save_objects(records[i:i + batch_size])
        db.commit()
        print(f"  ...{min(i + batch_size, len(records))}/{len(records)} inserted")

def load_logon_data(db):
    df = pd.read_csv("../dataset/CERT/logon.csv")
    df["date"] = pd.to_datetime(df["date"], format="%m/%d/%Y %H:%M:%S")
    records = [
        ActivityLog(
            employee=row["user"],
            activity=normalize_activity(row["activity"]),
            device=row["pc"],
            ip_address=None,
            timestamp=row["date"]
        )
        for _, row in df.iterrows()
    ]
    bulk_insert(db, records)
    print(f"Inserted {len(records)} logon records")


def load_device_data(db):
    df = pd.read_csv("../dataset/CERT/device.csv")
    df["date"] = pd.to_datetime(df["date"], format="%m/%d/%Y %H:%M:%S")
    records = [
        ActivityLog(
            employee=row["user"],
            activity=normalize_activity(row["activity"]),
            device=row["pc"],
            ip_address=None,
            timestamp=row["date"]
        )
        for _, row in df.iterrows()
    ]
    bulk_insert(db, records)
    print(f"Inserted {len(records)} device records")


def load_email_data(db, limit=None):
    df = pd.read_csv("../dataset/CERT/email.csv", nrows=limit)
    df["date"] = pd.to_datetime(df["date"], format="%m/%d/%Y %H:%M:%S")
    records = [
        ActivityLog(
            employee=row["user"],
            activity="Email Sent" if row["user"] == row["from"] else "Email Received",
            device=row.get("pc"),
            ip_address=None,
            timestamp=row["date"]
        )
        for _, row in df.iterrows()
    ]
    bulk_insert(db, records)
    print(f"Inserted {len(records)} email records")


def load_http_data(db, limit=None):
    df = pd.read_csv("../dataset/CERT/http.csv", nrows=limit)
    df["date"] = pd.to_datetime(df["date"], format="%m/%d/%Y %H:%M:%S")
    has_activity_col = "activity" in df.columns
    records = [
        ActivityLog(
            employee=row["user"],
            activity=normalize_activity(row["activity"]) if has_activity_col else "Web Access",
            device=row.get("pc"),
            ip_address=None,
            timestamp=row["date"]
        )
        for _, row in df.iterrows()
    ]
    bulk_insert(db, records)
    print(f"Inserted {len(records)} http records")

if __name__ == "__main__":
    db = SessionLocal()
    load_logon_data(db)
    load_device_data(db)
    load_email_data(db, limit=100000)
    load_http_data(db, limit=200000)
    db.close()
    print("Dataset loaded successfully into activity_logs")