import sys
import os
sys.path.append(os.path.dirname(__file__))

import pandas as pd
from app.database import SessionLocal
from app.models import ActivityLog
from app.services.preprocessing import DataPreprocessing
from app.services.anomaly_detection import AnomalyDetection

BATCH_SIZE = 10000  # rows per chunk, safe for low-RAM machines

db = SessionLocal()
preprocessor = DataPreprocessing()
anomaly_service = AnomalyDetection()

total_rows = db.query(ActivityLog).count()
print(f"Total activity log rows in database: {total_rows}")

all_chunks = []
offset = 0

while offset < total_rows:
    batch = (
        db.query(ActivityLog)
        .order_by(ActivityLog.id)
        .offset(offset)
        .limit(BATCH_SIZE)
        .all()
    )

    if not batch:
        break

    chunk_df = pd.DataFrame([{
        "employee_id": l.employee,
        "action": l.activity,
        "device_id": l.device,
        "timestamp": l.timestamp
    } for l in batch])

    all_chunks.append(chunk_df)
    offset += BATCH_SIZE
    print(f"Loaded {min(offset, total_rows)} / {total_rows} rows...")

raw = pd.concat(all_chunks, ignore_index=True)
del all_chunks  # free memory

print("Building employee features...")
features = preprocessor.build_employee_features(raw)
del raw  # free memory

print(f"Built features for {len(features)} employees")

feature_cols = features.drop(columns=["employee_id"])
anomaly_service.train(feature_cols)

print("Model retrained and saved successfully.")
print("Feature columns used:", list(feature_cols.columns))

db.close()