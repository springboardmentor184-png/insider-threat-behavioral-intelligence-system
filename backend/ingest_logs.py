"""
Ingests CERT dataset CSV files (logon.csv, device.csv) into the activity_logs table.

Usage:
    python ingest_logs.py

Notes:
- Reads files in chunks to avoid loading huge CSVs fully into memory.
- http.csv (14GB+) is intentionally skipped for now - too large for Milestone 1.
- Run this AFTER the backend tables have been created (i.e. after uvicorn has run once).
"""

import os
import pandas as pd

from database import SessionLocal, engine, Base
from models import ActivityLog

# Make sure tables exist
Base.metadata.create_all(bind=engine)

CHUNK_SIZE = 50_000  # rows per batch - keeps memory usage low

DATA_DIR = "data/cert_data/r4.2"


def _ingest_csv(db, filename: str, event_types: dict[str, str]):
    """Ingest a CERT CSV in batches without a per-row ORM loop.

    Set CERT_INGEST_LIMIT_PER_SOURCE for a smaller local demo dataset. The
    default is the full supplied file, so production ingestion remains full.
    """
    path = f"{DATA_DIR}/{filename}"
    limit = int(os.getenv("CERT_INGEST_LIMIT_PER_SOURCE", "0"))
    inserted = 0
    for chunk in pd.read_csv(path, chunksize=CHUNK_SIZE):
        if limit:
            remaining = limit - inserted
            if remaining <= 0:
                break
            chunk = chunk.head(remaining)
        chunk["date"] = pd.to_datetime(chunk["date"], format="%m/%d/%Y %H:%M:%S")
        mappings = [
            {
                "employee_id": row.user,
                "event_type": event_types[row.activity.lower()],
                "timestamp": row.date.to_pydatetime(),
                "pc": row.pc,
                "source_file": filename,
            }
            for row in chunk.itertuples(index=False)
        ]
        db.bulk_insert_mappings(ActivityLog, mappings)
        db.commit()
        inserted += len(mappings)
        print(f"  {filename}: {inserted:,} rows inserted so far...")
    print(f"Done with {filename} - total {inserted:,} rows.")


def ingest_logon_csv(db):
    """
    logon.csv columns: id, date, user, pc, activity
    activity is either 'Logon' or 'Logoff'
    """
    _ingest_csv(db, "logon.csv", {"logon": "logon", "logoff": "logoff"})


def ingest_device_csv(db):
    """
    device.csv columns: id, date, user, pc, file_tree, activity
    activity is either 'Connect' or 'Disconnect'
    """
    _ingest_csv(db, "device.csv", {"connect": "device_connect", "disconnect": "device_disconnect"})


if __name__ == "__main__":
    db = SessionLocal()
    try:
        print("Starting ingestion...")
        ingest_logon_csv(db)
        ingest_device_csv(db)
        print("Ingestion complete!")
    finally:
        db.close()
