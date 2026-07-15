"""
Ingests CERT dataset CSV files (logon.csv, device.csv) into the activity_logs table.

Usage:
    python ingest_logs.py

Notes:
- Reads files in chunks to avoid loading huge CSVs fully into memory.
- http.csv (14GB+) is intentionally skipped for now - too large for Milestone 1.
- Run this AFTER the backend tables have been created (i.e. after uvicorn has run once).
"""

import pandas as pd
from datetime import datetime

from database import SessionLocal, engine, Base
from models import ActivityLog

# Make sure tables exist
Base.metadata.create_all(bind=engine)

CHUNK_SIZE = 50_000  # rows per batch - keeps memory usage low

DATA_DIR = "data/cert_data/r4.2"


def ingest_logon_csv(db):
    """
    logon.csv columns: id, date, user, pc, activity
    activity is either 'Logon' or 'Logoff'
    """
    path = f"{DATA_DIR}/logon.csv"
    total_inserted = 0

    for chunk in pd.read_csv(path, chunksize=CHUNK_SIZE):
        records = []
        for _, row in chunk.iterrows():
            records.append(
                ActivityLog(
                    employee_id=row["user"],
                    event_type="logon" if row["activity"].lower() == "logon" else "logoff",
                    timestamp=datetime.strptime(row["date"], "%m/%d/%Y %H:%M:%S"),
                    pc=row["pc"],
                    source_file="logon.csv",
                )
            )
        db.bulk_save_objects(records)
        db.commit()
        total_inserted += len(records)
        print(f"  logon.csv: {total_inserted} rows inserted so far...")

    print(f"Done with logon.csv - total {total_inserted} rows.")


def ingest_device_csv(db):
    """
    device.csv columns: id, date, user, pc, file_tree, activity
    activity is either 'Connect' or 'Disconnect'
    """
    path = f"{DATA_DIR}/device.csv"
    total_inserted = 0

    for chunk in pd.read_csv(path, chunksize=CHUNK_SIZE):
        records = []
        for _, row in chunk.iterrows():
            records.append(
                ActivityLog(
                    employee_id=row["user"],
                    event_type="device_connect" if row["activity"].lower() == "connect" else "device_disconnect",
                    timestamp=datetime.strptime(row["date"], "%m/%d/%Y %H:%M:%S"),
                    pc=row["pc"],
                    source_file="device.csv",
                )
            )
        db.bulk_save_objects(records)
        db.commit()
        total_inserted += len(records)
        print(f"  device.csv: {total_inserted} rows inserted so far...")

    print(f"Done with device.csv - total {total_inserted} rows.")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        print("Starting ingestion...")
        ingest_logon_csv(db)
        ingest_device_csv(db)
        print("Ingestion complete!")
    finally:
        db.close()