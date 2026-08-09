import pandas as pd
from app.database import SessionLocal
from app.models import ActivityLog, PsychometricProfile


ACTIVITY_MAP = {
    "Logon": "Login",
    "Login": "Login",
    "Logoff": "Logout",
    "Connect": "USB Connect",
    "Disconnect": "USB Disconnect",
    "www visit": "Web Access",
    "www download": "Web Download",
    "www upload": "Web Upload",
    "File Open": "File Access",
    "File Write": "File Write",
    "File Delete": "File Delete",
    "File Copy": "File Copy",
}


def normalize_activity(raw_activity: str) -> str:
    return ACTIVITY_MAP.get(raw_activity, raw_activity)


def bulk_insert(db, records, batch_size=5000):
    for i in range(0, len(records), batch_size):
        db.bulk_save_objects(records[i:i + batch_size])
        db.commit()

        print(
            f"    ...{min(i + batch_size, len(records))}/"
            f"{len(records)} inserted"
        )


def _to_bool(value) -> bool:
    """CERT removable-media flags may be bool, strings, or 1/0."""
    if isinstance(value, bool):
        return value

    if pd.isna(value):
        return False

    return str(value).strip().lower() in ("true", "1", "yes")


def load_logon_data(db):
    df = pd.read_csv("../dataset/CERT/logon.csv")

    df["date"] = pd.to_datetime(
        df["date"],
        format="%m/%d/%Y %H:%M:%S"
    )

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

    df["date"] = pd.to_datetime(
        df["date"],
        format="%m/%d/%Y %H:%M:%S"
    )

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
    df = pd.read_csv(
        "../dataset/CERT/email.csv",
        nrows=limit
    )

    df["date"] = pd.to_datetime(
        df["date"],
        format="%m/%d/%Y %H:%M:%S"
    )

    records = [
        ActivityLog(
            employee=row["user"],
            activity=(
                "Email Sent"
                if row["user"] == row["from"]
                else "Email Received"
            ),
            device=row.get("pc"),
            ip_address=None,
            timestamp=row["date"]
        )
        for _, row in df.iterrows()
    ]

    bulk_insert(db, records)

    print(f"Inserted {len(records)} email records")


def load_http_data(db, limit=None):
    df = pd.read_csv(
        "../dataset/CERT/http.csv",
        nrows=limit
    )

    df["date"] = pd.to_datetime(
        df["date"],
        format="%m/%d/%Y %H:%M:%S"
    )

    has_activity_col = "activity" in df.columns

    records = [
        ActivityLog(
            employee=row["user"],
            activity=(
                normalize_activity(row["activity"])
                if has_activity_col
                else "Web Access"
            ),
            device=row.get("pc"),
            ip_address=None,
            timestamp=row["date"]
        )
        for _, row in df.iterrows()
    ]

    bulk_insert(db, records)

    print(f"Inserted {len(records)} http records")


def load_file_data(db, limit=None):
    """
    Loads file.csv — critical for data exfiltration /
    excessive file transfer detection.

    to_removable_media / from_removable_media flags are
    the key insider-threat signal here.
    """

    df = pd.read_csv(
        "../dataset/CERT/file.csv",
        nrows=limit
    )

    df["date"] = pd.to_datetime(
        df["date"],
        format="%m/%d/%Y %H:%M:%S"
    )

    has_to_removable = "to_removable_media" in df.columns
    has_from_removable = "from_removable_media" in df.columns

    records = []

    for _, row in df.iterrows():

        to_removable = (
            _to_bool(row.get("to_removable_media"))
            if has_to_removable
            else False
        )

        from_removable = (
            _to_bool(row.get("from_removable_media"))
            if has_from_removable
            else False
        )

        if to_removable:
            activity = "File Copy to Removable Media"

        elif from_removable:
            activity = "File Copy from Removable Media"

        else:
            activity = normalize_activity(
                row.get("activity", "File Access")
            )

        records.append(
            ActivityLog(
                employee=row["user"],
                activity=activity,
                device=row.get("pc"),
                ip_address=None,
                timestamp=row["date"]
            )
        )

    bulk_insert(db, records)

    print(f"Inserted {len(records)} file records")


def load_psychometric_data(db):
    """
    Loads psychometric.csv — Big Five (OCEAN)
    personality scores per employee.

    This is static per-employee data, not a time-series
    activity log, so it goes into PsychometricProfile.
    """

    df = pd.read_csv(
        "../dataset/CERT/psychometric.csv"
    )

    # Standard CERT columns:
    # employee_name, user_id, O, C, E, A, N

    records = []

    for _, row in df.iterrows():

        records.append(
            PsychometricProfile(
                employee_id=row["user_id"],
                employee_name=row.get("employee_name"),
                openness=row.get("O"),
                conscientiousness=row.get("C"),
                extraversion=row.get("E"),
                agreeableness=row.get("A"),
                neuroticism=row.get("N"),
            )
        )

    bulk_insert(db, records)

    print(
        f"Inserted {len(records)} psychometric profiles"
    )


if __name__ == "__main__":

    db = SessionLocal()

    try:
        load_logon_data(db)
        load_device_data(db)
        load_email_data(db, limit=100000)
        load_http_data(db, limit=200000)
        load_file_data(db, limit=200000)
        load_psychometric_data(db)

    finally:
        db.close()

    print(
        "Dataset loaded successfully into "
        "activity_logs and psychometric_profiles"
    )