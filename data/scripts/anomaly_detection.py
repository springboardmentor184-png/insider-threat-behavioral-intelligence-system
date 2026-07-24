import pandas as pd
import numpy as np

# Load the data
csv_path = r'D:\ai-insider-threat-system\data\raw\insider\insider.csv'
df = pd.read_csv(csv_path)

print("🔍 Anomaly Detection\n")
print("="*50)

# Calculate department-level averages (baselines)
dept_baseline = df.groupby('employee_department').agg({
    'total_printed_pages': 'mean',
    'total_files_burned': 'mean',
    'num_entries': 'mean',
    'late_exit_flag': 'mean',
    'entry_during_weekend': 'mean'
}).round(2)

print("\n📋 Department Baselines (Normal Behavior):")
print(dept_baseline)

# Find anomalies - employees with behavior significantly different from their department
print("\n🚨 Employees with Anomalous Behavior:\n")

# Group by employee (department + campus as proxy)
employee_profiles = df.groupby(['employee_department', 'employee_campus']).agg({
    'total_printed_pages': 'mean',
    'total_files_burned': 'mean',
    'num_entries': 'mean',
    'late_exit_flag': 'mean',
    'entry_during_weekend': 'mean'
}).reset_index()

# Flag anomalies (using department-level baselines)
anomalies = []
for idx, row in employee_profiles.iterrows():
    dept = row['employee_department']
    
    # Get department baseline
    dept_avg_printing = dept_baseline.loc[dept, 'total_printed_pages']
    dept_avg_files = dept_baseline.loc[dept, 'total_files_burned']
    dept_avg_entries = dept_baseline.loc[dept, 'num_entries']
    
    # Check if employee deviates significantly (2x baseline)
    if row['total_printed_pages'] > dept_avg_printing * 2:
        anomalies.append({
            'department': dept,
            'campus': row['employee_campus'],
            'metric': 'High Printing',
            'value': row['total_printed_pages'],
            'baseline': dept_avg_printing
        })
    
    if row['total_files_burned'] > dept_avg_files * 2:
        anomalies.append({
            'department': dept,
            'campus': row['employee_campus'],
            'metric': 'High File Transfers',
            'value': row['total_files_burned'],
            'baseline': dept_avg_files
        })

if anomalies:
    print("🚨 Anomalies Detected:")
    for a in anomalies:
        print(f"  - {a['department']} ({a['campus']}): {a['metric']} = {a['value']:.2f} (Baseline: {a['baseline']:.2f})")
else:
    print("✅ No anomalies detected!")

print("\n✅ Anomaly detection complete!")