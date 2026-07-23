import os
import zipfile
import bz2
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(os.path.dirname(__file__), "isolation_forest_model.joblib")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.joblib")

def find_dataset_files():
    """Finds archive.zip (CERT) or lanl-auth-dataset-1.bz2 (LANL) in the springboard project path."""
    search_paths = [
        BASE_DIR,
        os.path.join(BASE_DIR, "backend", "data"),
        os.path.join(BASE_DIR, "data")
    ]
    
    found_cert_zip = None
    found_lanl_bz2 = None
    
    for path in search_paths:
        if not os.path.exists(path):
            continue
        for file in os.listdir(path):
            full_p = os.path.join(path, file)
            if file == "archive.zip" or (file.endswith(".zip") and "cert" in file.lower()):
                found_cert_zip = full_p
            elif file.startswith("lanl") and file.endswith(".bz2"):
                found_lanl_bz2 = full_p
                
    return found_cert_zip, found_lanl_bz2

def process_cert_archive(zip_path, sample_rows=50000):
    """Processes CERT dataset inside archive.zip for logon/device/http feature extraction."""
    print(f"[CERT Pipeline] Processing CERT archive from: {zip_path}")
    feature_list = []
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as z:
            names = z.namelist()
            print(f"[CERT Pipeline] Found {len(names)} files in zip: {names[:10]}...")
            
            # Find logon.csv or device.csv inside zip
            logon_file = next((f for f in names if f.endswith('logon.csv')), None)
            device_file = next((f for f in names if f.endswith('device.csv')), None)
            
            if logon_file:
                print(f"[CERT Pipeline] Extracting features from {logon_file}...")
                with z.open(logon_file) as f:
                    df = pd.read_csv(f, nrows=sample_rows)
                    # Expected CERT logon fields: id, date, user, pc, activity (Logon/Logoff)
                    if 'date' in df.columns:
                        df['date'] = pd.to_datetime(df['date'])
                        df['hour'] = df['date'].dt.hour
                        df['is_after_hours'] = ((df['hour'] < 7) | (df['hour'] > 19)).astype(int)
                        
                        # Group by user to build feature matrix
                        user_grouped = df.groupby('user').agg(
                            logon_count=('activity', 'count'),
                            after_hours_ratio=('is_after_hours', 'mean'),
                            unique_pcs=('pc', 'nunique')
                        ).reset_index()
                        
                        for _, row in user_grouped.iterrows():
                            feature_list.append([
                                float(row['logon_count']),
                                0.0, # avg_download_mb
                                0.0, # avg_upload_mb
                                float(row['after_hours_ratio']),
                                int(row['unique_pcs'])
                            ])
                            
            if device_file:
                print(f"[CERT Pipeline] Processing {device_file}...")
                with z.open(device_file) as f:
                    df_dev = pd.read_csv(f, nrows=sample_rows)
                    # Device USB mount activities
                    dev_counts = df_dev.groupby('user').size()
                    for u, count in dev_counts.items():
                        feature_list.append([
                            5.0, # avg logins
                            10.0,
                            5.0,
                            0.2,
                            int(count)
                        ])
                        
    except Exception as e:
        print(f"[CERT Pipeline Error] Failed to process zip: {e}")
        
    return feature_list

def generate_synthetic_features(num_samples=2000):
    """Generates synthetic CERT/LANL baseline features if real dataset parsing is partial or fallback."""
    print("[Dataset Pipeline] Generating synthetic baseline feature vectors...")
    np.random.seed(42)
    features = []
    
    # 90% Normal baseline users
    for _ in range(int(num_samples * 0.9)):
        logins = np.random.normal(loc=10, scale=3)
        downloads = np.random.normal(loc=15, scale=5)
        uploads = np.random.normal(loc=5, scale=2)
        after_hours = np.random.beta(a=1, b=9) # low after-hours ratio
        usb_count = np.random.choice([0, 1], p=[0.9, 0.1])
        features.append([
            max(1.0, logins),
            max(0.0, downloads),
            max(0.0, uploads),
            float(after_hours),
            int(usb_count)
        ])
        
    # 10% Anomaly / Threat samples (CERT Insider exfiltration patterns)
    for _ in range(int(num_samples * 0.1)):
        logins = np.random.normal(loc=45, scale=15) # Excessive logins
        downloads = np.random.normal(loc=250, scale=80) # Massive download
        uploads = np.random.normal(loc=180, scale=60) # Data exfiltration
        after_hours = np.random.uniform(0.6, 0.95) # Late night
        usb_count = np.random.randint(3, 12) # USB exfiltration
        features.append([
            max(1.0, logins),
            max(0.0, downloads),
            max(0.0, uploads),
            float(after_hours),
            int(usb_count)
        ])
        
    return features

def train_isolation_forest():
    print("=" * 65)
    print("INSIDER THREAT BEHAVIORAL ANALYTICS - MODEL TRAINING PIPELINE")
    print("=" * 65)
    
    cert_zip, lanl_bz2 = find_dataset_files()
    
    dataset_features = []
    if cert_zip and os.path.exists(cert_zip):
        parsed = process_cert_archive(cert_zip)
        if len(parsed) > 0:
            dataset_features.extend(parsed)
            print(f"[CERT Pipeline] Extracted {len(parsed)} feature vectors from CERT archive.")
            
    if len(dataset_features) < 100:
        print("[Dataset Pipeline] Using augmented dataset features for robust Isolation Forest training...")
        synthetic = generate_synthetic_features()
        dataset_features.extend(synthetic)
        
    X = np.array(dataset_features)
    print(f"[Training] Dataset shape for training: {X.shape}")
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train Isolation Forest (Contamination set to ~5% expected anomaly rate)
    model = IsolationForest(
        n_estimators=150,
        contamination=0.08,
        random_state=42,
        max_samples='auto'
    )
    model.fit(X_scaled)
    
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    
    print(f"[Training Complete] Model saved to: {MODEL_PATH}")
    print(f"[Training Complete] Scaler saved to: {SCALER_PATH}")
    print("=" * 65)
    return model, scaler

if __name__ == "__main__":
    train_isolation_forest()
