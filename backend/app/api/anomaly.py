from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
import os
from ..core.database import get_db
from ..core.security import require_roles
from ..models import models

router = APIRouter(prefix="/anomaly", tags=["Anomaly Detection"])

# Load the dataset (you can improve this by loading from DB later)
DATASET_PATH = r'D:\ai-insider-threat-system\data\raw\insider\insider.csv'

@router.get("/detect")
async def detect_anomalies(
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager", "SOC Engineer"]))
):
    # Load dataset
    df = pd.read_csv(DATASET_PATH)
    
    # Calculate department baselines
    dept_baseline = df.groupby('employee_department').agg({
        'total_printed_pages': 'mean',
        'total_files_burned': 'mean',
        'num_entries': 'mean',
        'late_exit_flag': 'mean',
        'entry_during_weekend': 'mean'
    }).round(2)
    
    # Detect anomalies
    anomalies = []
    employee_profiles = df.groupby(['employee_department', 'employee_campus']).agg({
        'total_printed_pages': 'mean',
        'total_files_burned': 'mean',
        'num_entries': 'mean',
        'late_exit_flag': 'mean',
        'entry_during_weekend': 'mean'
    }).reset_index()
    
    for _, row in employee_profiles.iterrows():
        dept = row['employee_department']
        dept_avg = dept_baseline.loc[dept]
        
        # Check for anomalies
        if row['total_printed_pages'] > dept_avg['total_printed_pages'] * 2:
            anomalies.append({
                'department': dept,
                'campus': row['employee_campus'],
                'metric': 'High Printing',
                'value': float(row['total_printed_pages']),
                'baseline': float(dept_avg['total_printed_pages'])
            })
    
    return {
        'total_anomalies': len(anomalies),
        'anomalies': anomalies,
        'message': 'Anomaly detection complete'
    }