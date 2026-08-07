# backend/app/ml/feature_engineer.py

import pandas as pd
import numpy as np
from typing import Dict, List

class FeatureEngineer:
    """
    Extract behavioral features from raw activity logs
    """
    
    def create_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create features from merged DataFrame
        """
        if df.empty:
            return pd.DataFrame()
        
        features_list = []
        
        for user_id in df["user"].unique():
            user_data = df[df["user"] == user_id]
            
            features = {
                "user_id": user_id,
                "total_activities": len(user_data),
                "unique_sources": user_data["source"].nunique(),
            }
            
            # Time-based features
            if "date" in user_data.columns:
                user_data["date"] = pd.to_datetime(user_data["date"])
                days = (user_data["date"].max() - user_data["date"].min()).days
                features["activity_span_days"] = days
                features["avg_activities_per_day"] = len(user_data) / max(1, days)
                
                user_data["hour"] = user_data["date"].dt.hour
                features["avg_hour"] = user_data["hour"].mean()
                features["night_ratio"] = len(user_data[user_data["hour"].between(22, 5)]) / len(user_data)
                features["weekend_ratio"] = len(user_data[user_data["date"].dt.dayofweek >= 5]) / len(user_data)
            
            # Logon features
            if "logon" in user_data["source"].values:
                logon_data = user_data[user_data["source"] == "logon"]
                features["logon_count"] = len(logon_data)
                if "activity" in logon_data.columns:
                    features["failed_logons"] = len(logon_data[logon_data["activity"] == "failed"])
                else:
                    features["failed_logons"] = 0
            else:
                features["logon_count"] = 0
                features["failed_logons"] = 0
            
            # File features
            if "file" in user_data["source"].values:
                file_data = user_data[user_data["source"] == "file"]
                features["file_access_count"] = len(file_data)
            else:
                features["file_access_count"] = 0
            
            # Email features
            if "email" in user_data["source"].values:
                email_data = user_data[user_data["source"] == "email"]
                features["email_count"] = len(email_data)
            else:
                features["email_count"] = 0
            
            # Device diversity
            if "pc" in user_data.columns:
                features["unique_pcs"] = user_data["pc"].nunique()
            else:
                features["unique_pcs"] = 0
            
            features_list.append(features)
        
        return pd.DataFrame(features_list)