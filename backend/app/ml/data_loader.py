# backend/app/ml/data_loader.py

import pandas as pd
import os
import json
from typing import Dict, Optional

class CERTDataLoader:
    """
    Load and process CERT Insider Threat Dataset or activity telemetry
    """
    
    def __init__(self, data_path: str = "data/raw/"):
        self.data_path = data_path
        self.datasets = {}

    def load_activity_logs(self) -> pd.DataFrame:
        """Load activity telemetry from JSON storage fallback or DB"""
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        json_path = os.path.join(backend_dir, "activity_logs.json")
        
        if os.path.exists(json_path):
            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    logs = json.load(f)
                    if logs:
                        rows = []
                        for log in logs:
                            rows.append({
                                "user": log.get("employee_id", "user_1"),
                                "date": log.get("timestamp", "2026-08-06T12:00:00"),
                                "source": "logon" if "LOGIN" in log.get("event_type", "") else ("file" if "FILE" in log.get("event_type", "") else "email"),
                                "activity": log.get("event_type", "LOGIN_SUCCESS"),
                                "pc": log.get("ip_address", "192.168.1.1")
                            })
                        df = pd.DataFrame(rows)
                        print(f"[ML] Loaded {len(df)} telemetry logs from activity_logs.json")
                        return df
            except Exception as e:
                print(f"[ML] Error reading activity_logs.json: {e}")
        return pd.DataFrame()
    
    def load_logon_data(self) -> pd.DataFrame:
        file_path = os.path.join(self.data_path, "logon.csv")
        if os.path.exists(file_path):
            df = pd.read_csv(file_path)
            print(f"Loaded logon data: {len(df)} rows")
            return df
        return pd.DataFrame()
    
    def load_file_data(self) -> pd.DataFrame:
        file_path = os.path.join(self.data_path, "file.csv")
        if os.path.exists(file_path):
            df = pd.read_csv(file_path)
            print(f"Loaded file data: {len(df)} rows")
            return df
        return pd.DataFrame()
    
    def load_email_data(self) -> pd.DataFrame:
        file_path = os.path.join(self.data_path, "email.csv")
        if os.path.exists(file_path):
            df = pd.read_csv(file_path)
            print(f"Loaded email data: {len(df)} rows")
            return df
        return pd.DataFrame()
    
    def load_all_data(self) -> Dict[str, pd.DataFrame]:
        logon_df = self.load_logon_data()
        file_df = self.load_file_data()
        email_df = self.load_email_data()

        if logon_df.empty and file_df.empty and email_df.empty:
            telemetry_df = self.load_activity_logs()
            if not telemetry_df.empty:
                self.datasets = {
                    "logon": telemetry_df[telemetry_df["source"] == "logon"],
                    "file": telemetry_df[telemetry_df["source"] == "file"],
                    "email": telemetry_df[telemetry_df["source"] == "email"]
                }
                return self.datasets

        self.datasets = {
            "logon": logon_df,
            "file": file_df,
            "email": email_df
        }
        return self.datasets