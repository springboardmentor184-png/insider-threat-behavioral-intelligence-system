import os
import sys
import pickle
import pandas as pd
from datetime import datetime

# Add backend path to import models
sys.path.append("e:\\Insider-Threat-Behavioral-Intelligence-System\\backend")
from app import create_app
from database.db import db
from models.behavioral_feature import BehaviorFeature
from models.anomaly import Anomaly
from models.risk_score import RiskScore

PROCESSED_DIR = "e:\\Insider-Threat-Behavioral-Intelligence-System\\ml-engine\\data"
MODEL_DIR = "e:\\Insider-Threat-Behavioral-Intelligence-System\\ml-engine\\models"

def run_predictions():
    model_path = os.path.join(MODEL_DIR, "isolation_forest.pkl")
    input_path = os.path.join(PROCESSED_DIR, "ml_features.csv")
    if not os.path.exists(model_path) or not os.path.exists(input_path):
        print("Required model or features file not found. Ensure training has completed.")
        return False
        
    # Load model and features
    with open(model_path, 'rb') as f:
        clf = pickle.load(f)
    df = pd.read_csv(input_path)
    
    feature_cols = [
        'late_login', 'weekend_login', 'multiple_devices', 'usb_usage',
        'mass_file_access', 'large_file_transfer', 'external_email_ratio',
        'job_search_websites', 'failed_logins', 'login_frequency',
        'average_session_duration', 'activity_after_hours'
    ]
    
    X = df[feature_cols].fillna(0.0)
    
    print("Evaluating anomalies and scoring user behaviors...")
    predictions = clf.predict(X) # -1 for anomaly, 1 for normal
    decision_scores = clf.decision_function(X) # lower = more anomalous
    
    # Calculate normalized risk score: 0 to 100
    # Map decision scores to [0, 100] where lowest decision score = 100, highest = 0
    min_d = min(decision_scores)
    max_d = max(decision_scores)
    d_range = max_d - min_d if max_d != min_d else 1.0
    
    risk_scores = [float(100.0 * (1.0 - (s - min_d) / d_range)) for s in decision_scores]

    app = create_app()
    with app.app_context():
        count = 0
        for idx, row in df.iterrows():
            code = row['employee_code']
            is_anomaly = bool(predictions[idx] == -1)
            raw_score = float(decision_scores[idx])
            risk_val = float(risk_scores[idx])
            
            # 1. Sync BehaviorFeature
            bf = BehaviorFeature.query.filter_by(employee_code=code).first()
            if not bf:
                bf = BehaviorFeature(employee_code=code)
                db.session.add(bf)
            bf.late_login = float(row['late_login'])
            bf.weekend_login = float(row['weekend_login'])
            bf.multiple_devices = int(row['multiple_devices'])
            bf.usb_usage = float(row['usb_usage'])
            bf.mass_file_access = float(row['mass_file_access'])
            bf.large_file_transfer = float(row['large_file_transfer'])
            bf.external_email_ratio = float(row['external_email_ratio'])
            bf.job_search_websites = int(row['job_search_websites'])
            bf.failed_logins = int(row['failed_logins'])
            bf.login_frequency = float(row['login_frequency'])
            bf.average_session_duration = float(row['average_session_duration'])
            bf.activity_after_hours = float(row['activity_after_hours'])
            bf.last_updated = datetime.utcnow()

            # 2. Sync RiskScore
            rs = RiskScore.query.filter_by(employee_code=code).first()
            if not rs:
                rs = RiskScore(employee_code=code)
                db.session.add(rs)
            rs.risk_score = risk_val
            rs.last_updated = datetime.utcnow()

            # 3. Save Anomaly record
            # We save anomaly occurrences in a history table
            # Check if this anomaly was already logged recently, to avoid spam
            anom = Anomaly.query.filter_by(employee_code=code).order_by(Anomaly.detected_at.desc()).first()
            if is_anomaly:
                if not anom or (datetime.utcnow() - anom.detected_at).days >= 1:
                    # Log details of why it is an anomaly
                    details_parts = []
                    if row['late_login'] > 1.0: details_parts.append("Late login deviations")
                    if row['weekend_login'] > 0: details_parts.append(f"Weekend login activity ({int(row['weekend_login'])} logons)")
                    if row['usb_usage'] > 2: details_parts.append(f"Frequent USB access ({int(row['usb_usage'])} connects)")
                    if row['mass_file_access'] > 20: details_parts.append(f"High volume file interactions ({int(row['mass_file_access'])} files)")
                    if row['large_file_transfer'] > 5: details_parts.append("Large file copies detected")
                    if row['external_email_ratio'] > 0.5: details_parts.append("High ratio of external emails")
                    if row['job_search_websites'] > 0: details_parts.append("Job search portal browsing detected")
                    
                    details_str = ", ".join(details_parts) if details_parts else "General behavioral baseline deviation"
                    
                    new_anom = Anomaly(
                        employee_code=code,
                        score=raw_score,
                        is_anomaly=True,
                        detected_at=datetime.utcnow(),
                        details=details_str
                    )
                    db.session.add(new_anom)
            count += 1
            
        db.session.commit()
        print(f"Predictions synced successfully for {count} employees.")
    return True

if __name__ == "__main__":
    run_predictions()
