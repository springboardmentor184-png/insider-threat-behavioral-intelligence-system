import os
import pickle
import pandas as pd
from sklearn.ensemble import IsolationForest

PROCESSED_DIR = "e:\\Insider-Threat-Behavioral-Intelligence-System\\ml-engine\\data"
MODEL_DIR = "e:\\Insider-Threat-Behavioral-Intelligence-System\\ml-engine\\models"

def train_model():
    os.makedirs(MODEL_DIR, exist_ok=True)
    input_path = os.path.join(PROCESSED_DIR, "ml_features.csv")
    if not os.path.exists(input_path):
        print(f"Features file not found at {input_path}. Please run feature engineering first.")
        return False
        
    df = pd.read_csv(input_path)
    print("Training Isolation Forest anomaly detection model...")

    # Define training features
    feature_cols = [
        'late_login', 'weekend_login', 'multiple_devices', 'usb_usage',
        'mass_file_access', 'large_file_transfer', 'external_email_ratio',
        'job_search_websites', 'failed_logins', 'login_frequency',
        'average_session_duration', 'activity_after_hours'
    ]
    
    X = df[feature_cols].fillna(0.0)
    
    # Train Isolation Forest
    # contamination = 0.05 (assume 5% of profiles are anomalous/outliers)
    clf = IsolationForest(contamination=0.05, random_state=42)
    clf.fit(X)
    
    # Save the model
    model_path = os.path.join(MODEL_DIR, "isolation_forest.pkl")
    with open(model_path, 'wb') as f:
        pickle.dump(clf, f)
        
    print(f"Model training complete. Saved model pickle file to {model_path}")
    return True

if __name__ == "__main__":
    train_model()
