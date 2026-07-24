import pandas as pd
import os

# Load the data
csv_path = r'D:\ai-insider-threat-system\data\raw\insider\insider.csv'
df = pd.read_csv(csv_path)

print("📊 Behavioral Baseline Generation\n")
print("="*50)

# --- Department Level Patterns ---
dept_patterns = df.groupby('employee_department').agg({
    'total_printed_pages': 'mean',
    'total_files_burned': 'mean',
    'num_entries': 'mean',
    'late_exit_flag': 'mean',
    'entry_during_weekend': 'mean',
    'is_malicious': 'mean'
}).round(2)

print("\n📋 Department Behavioral Patterns:")
print(dept_patterns)

# --- Position Level Patterns ---
position_patterns = df.groupby('employee_position').agg({
    'total_printed_pages': 'mean',
    'total_files_burned': 'mean',
    'num_entries': 'mean',
    'late_exit_flag': 'mean',
    'entry_during_weekend': 'mean',
    'is_malicious': 'mean'
}).round(2)

print("\n📋 Position Behavioral Patterns:")
print(position_patterns)

# --- Employee Level Profiles (NEW) ---
print("\n📋 Sample Employee Behavioral Profiles (First 10):")
employee_samples = df.groupby(['employee_department', 'employee_campus']).agg({
    'total_printed_pages': 'mean',
    'total_files_burned': 'mean',
    'num_entries': 'mean',
    'late_exit_flag': 'mean',
    'entry_during_weekend': 'mean',
    'is_malicious': 'mean'
}).reset_index().head(10)

print(employee_samples.to_string(index=False))

print("\n✅ Employee-level baseline ready!")
print("📊 Now we can compare individual behavior against department norms.")