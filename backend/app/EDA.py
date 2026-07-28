import pandas as pd
import matplotlib.pyplot as plt
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

print("Running aggregated queries directly in MySQL (fast, low memory)...")

with engine.connect() as conn:

    total_rows = conn.execute(text("SELECT COUNT(*) FROM activity_logs")).scalar()
    total_employees = conn.execute(text("SELECT COUNT(DISTINCT employee) FROM activity_logs")).scalar()
    print(f"\nTotal rows: {total_rows}")
    print(f"Total unique employees: {total_employees}")

    print("\n--- ACTIVITY TYPE COUNTS (overall) ---")
    activity_counts = pd.read_sql(text("""
        SELECT activity, COUNT(*) as count
        FROM activity_logs
        GROUP BY activity
        ORDER BY count DESC
    """), conn)
    print(activity_counts)

    print("\n--- LOGS PER EMPLOYEE (summary stats) ---")
    logs_per_employee = pd.read_sql(text("""
        SELECT employee, COUNT(*) as total_logs
        FROM activity_logs
        GROUP BY employee
    """), conn)
    print(logs_per_employee['total_logs'].describe())

    print("\n--- LOGIN HOUR DISTRIBUTION (across all logins) ---")
    login_hours = pd.read_sql(text("""
        SELECT HOUR(timestamp) as hour, COUNT(*) as count
        FROM activity_logs
        WHERE activity = 'Login'
        GROUP BY HOUR(timestamp)
        ORDER BY hour
    """), conn)
    print(login_hours)

    print("\n--- USB ACTIVITY PER EMPLOYEE (summary stats) ---")
    usb_per_employee = pd.read_sql(text("""
        SELECT employee, COUNT(*) as usb_count
        FROM activity_logs
        WHERE activity IN ('USB Connect', 'USB Disconnect')
        GROUP BY employee
    """), conn)
    print(usb_per_employee['usb_count'].describe())

plt.figure(figsize=(10, 5))
plt.bar(login_hours['hour'], login_hours['count'])
plt.title('Login Activity by Hour of Day (All Employees)')
plt.xlabel('Hour (24hr)')
plt.ylabel('Number of Logins')
plt.tight_layout()
plt.savefig('eda_login_hours.png')
print("\nSaved chart: eda_login_hours.png")

plt.figure(figsize=(10, 5))
logs_per_employee['total_logs'].plot(kind='hist', bins=30)
plt.title('Distribution of Total Logs per Employee')
plt.xlabel('Number of Logs')
plt.ylabel('Number of Employees')
plt.tight_layout()
plt.savefig('eda_logs_per_employee.png')
print("Saved chart: eda_logs_per_employee.png")

plt.figure(figsize=(10, 5))
usb_per_employee['usb_count'].plot(kind='hist', bins=30)
plt.title('Distribution of USB Activity per Employee')
plt.xlabel('Number of USB Events')
plt.ylabel('Number of Employees')
plt.tight_layout()
plt.savefig('eda_usb_activity.png')
print("Saved chart: eda_usb_activity.png")

print("\nEDA complete. Check the generated .png files in this folder.")