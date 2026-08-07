# backend/app/ml/model_trainer.py

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os
from typing import Dict, Any

class ModelTrainer:
    """
    Train and save machine learning models
    """
    
    def __init__(self, model_path: str = "models/"):
        self.model_path = model_path
        os.makedirs(model_path, exist_ok=True)
        self.model = None
        self.scaler = None
        self.feature_names = []
    
    def train_isolation_forest(self, features_df: pd.DataFrame, contamination: float = 0.1) -> Dict[str, Any]:
        """Train Isolation Forest model"""
        if features_df.empty:
            return {"status": "error", "message": "No features provided"}
        
        exclude_cols = ["user_id"]
        feature_cols = [col for col in features_df.columns if col not in exclude_cols and pd.api.types.is_numeric_dtype(features_df[col])]
        
        if not feature_cols:
            return {"status": "error", "message": "No numeric features found"}
        
        self.feature_names = feature_cols
        X = features_df[feature_cols].fillna(0)
        
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        self.model = IsolationForest(contamination=contamination, random_state=42, n_estimators=100)
        self.model.fit(X_scaled)
        
        joblib.dump(self.model, os.path.join(self.model_path, "isolation_forest.pkl"))
        joblib.dump(self.scaler, os.path.join(self.model_path, "scaler.pkl"))
        joblib.dump(self.feature_names, os.path.join(self.model_path, "feature_names.pkl"))
        
        predictions = self.model.predict(X_scaled)
        anomaly_count = sum(predictions == -1)
        
        return {
            "status": "success",
            "samples": len(features_df),
            "features": len(feature_cols),
            "feature_names": feature_cols,
            "anomalies_detected": int(anomaly_count),
            "anomaly_rate": round(anomaly_count / len(features_df) * 100, 2)
        }
    
    def predict(self, features_df: pd.DataFrame) -> pd.DataFrame:
        """Predict anomalies"""
        if self.model is None:
            self.load_model()
        
        if self.model is None or self.scaler is None:
            return pd.DataFrame()
        
        feature_cols = [col for col in self.feature_names if col in features_df.columns]
        if not feature_cols:
            return pd.DataFrame()
        
        X = features_df[feature_cols].fillna(0)
        X_scaled = self.scaler.transform(X)
        
        predictions = self.model.predict(X_scaled)
        scores = self.model.decision_function(X_scaled)
        
        min_score, max_score = scores.min(), scores.max()
        if max_score > min_score:
            anomaly_percentages = (1.0 - ((scores - min_score) / (max_score - min_score))) * 100.0
        else:
            anomaly_percentages = np.where(predictions == -1, 85.0, 15.0)
        
        return pd.DataFrame({
            "user_id": features_df["user_id"],
            "is_anomaly": predictions == -1,
            "anomaly_score": np.round(anomaly_percentages, 1)
        })
    
    def load_model(self):
        """Load saved model"""
        model_file = os.path.join(self.model_path, "isolation_forest.pkl")
        scaler_file = os.path.join(self.model_path, "scaler.pkl")
        features_file = os.path.join(self.model_path, "feature_names.pkl")
        
        if all(os.path.exists(f) for f in [model_file, scaler_file, features_file]):
            self.model = joblib.load(model_file)
            self.scaler = joblib.load(scaler_file)
            self.feature_names = joblib.load(features_file)
            return True
        return False