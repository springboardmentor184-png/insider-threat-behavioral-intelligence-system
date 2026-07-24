import os
import sys
import pandas as pd
from datetime import datetime

# Add backend directory to path to import models
sys.path.append("e:\\Insider-Threat-Behavioral-Intelligence-System\\backend")
from app import create_app
from database.db import db
from models.behavior_baseline import BehaviorBaseline

PROCESSED_DIR = "e:\\Insider-Threat-Behavioral-Intelligence-System\\ml-engine\\data"

def populate_baselines():
    input_path = os.path.join(PROCESSED_DIR, "behavioral_aggregates.csv")
    if not os.path.exists(input_path):
        print(f"Aggregates file not found at {input_path}. Please run preprocessing first.")
        return False
        
    df = pd.read_csv(input_path)
    print("Syncing behavioral baselines with the database...")

    app = create_app()
    with app.app_context():
        count = 0
        for idx, row in df.iterrows():
            code = row['employee_code']
            
            # Check if baseline already exists, if so update it, otherwise create new
            baseline = BehaviorBaseline.query.filter_by(employee_code=code).first()
            if not baseline:
                baseline = BehaviorBaseline(employee_code=code)
                db.session.add(baseline)
                
            baseline.normal_login_hour = float(row['avg_login_time'])
            baseline.normal_logout_hour = float(row['avg_logout_time'])
            
            # Normalize over simulated 30-day window
            baseline.avg_usb_per_day = float(row['usb_usage'] / 30.0)
            baseline.avg_files_per_day = float(row['files_accessed'] / 30.0)
            baseline.avg_emails_per_day = float(row['total_emails'] / 30.0)
            baseline.avg_websites_per_day = float(row['web_browsing'] / 30.0)
            baseline.last_updated = datetime.utcnow()
            count += 1
            
        db.session.commit()
        print(f"Successfully populated/updated {count} BehaviorBaseline records in the database.")
    return True

if __name__ == "__main__":
    populate_baselines()
