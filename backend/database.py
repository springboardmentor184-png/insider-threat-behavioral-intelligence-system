import sqlite3
import os
from datetime import datetime, timedelta
import random

DB_PATH = os.path.join(os.path.dirname(__file__), "insider_threat.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")

    # Drop existing tables to ensure clean state if database file exists
    cursor.execute("DROP TABLE IF EXISTS emails;")
    cursor.execute("DROP TABLE IF EXISTS alerts;")
    cursor.execute("DROP TABLE IF EXISTS activities;")
    cursor.execute("DROP TABLE IF EXISTS employees;")

    # Create Employees Table
    cursor.execute("""
    CREATE TABLE employees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        privilege_level TEXT NOT NULL,
        risk_score REAL NOT NULL DEFAULT 0.0,
        status TEXT NOT NULL DEFAULT 'Active'
    );
    """)

    # Create Activities Table
    cursor.execute("""
    CREATE TABLE activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        activity_type TEXT NOT NULL,
        description TEXT NOT NULL,
        severity TEXT NOT NULL,
        risk_score_contribution REAL NOT NULL,
        FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE
    );
    """)

    # Create Alerts Table
    cursor.execute("""
    CREATE TABLE alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id TEXT NOT NULL,
        threat_type TEXT NOT NULL,
        risk_score REAL NOT NULL,
        severity TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Open',
        FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE
    );
    """)

    # Create Emails Table (Mock Inbox)
    cursor.execute("""
    CREATE TABLE emails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipient TEXT NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        timestamp TEXT NOT NULL
    );
    """)

    conn.commit()
    seed_data(conn)
    conn.close()

def seed_data(conn):
    cursor = conn.cursor()
    
    # 1. Seed Employees
    employees = [
        ("ESC1389", "Edward Vance", "Engineering", "Administrator", 62.87, "Active"),
        ("CCA0846", "Carol Campbell", "Finance", "Standard User", 60.05, "Active"),
        ("GTD0719", "George Thompson", "HR", "Standard User", 59.82, "Active"),
        ("AOK0844", "Alice O'Connor", "Engineering", "Standard User", 55.64, "Active"),
        ("ESC0012", "John Doe", "Sales", "Standard User", 25.4, "Active"),
        ("ESC0054", "Sarah Smith", "Engineering", "Standard User", 12.5, "Active"),
        ("ESC0999", "Manager User", "Management", "Administrator", 5.0, "Active")
    ]
    cursor.executemany("""
    INSERT INTO employees (id, name, department, privilege_level, risk_score, status)
    VALUES (?, ?, ?, ?, ?, ?);
    """, employees)

    # 2. Seed Alerts
    # We want to match the numbers in the user image:
    # Total Alerts: 151
    # Critical: 0
    # High: 13
    # Medium: 138
    now = datetime.now()

    # Generate some alerts
    alerts = []
    
    # Generate High Alerts (13 alerts)
    high_reasons = [
        "Multiple unauthorized access attempts to source code repository.",
        "Unusual remote login location detected outside of normal working hours.",
        "Exfiltration of sensitive finance document via external USB drive.",
        "Attempted privilege escalation by running restricted scripts.",
        "Accessing corporate network using an unrecognized VPN configuration."
    ]
    high_threat_types = ["Insider Threat", "Compromised Credentials", "Privilege Abuse", "Exfiltration Risk"]
    
    for i in range(13):
        emp = random.choice(employees[:4])  # Choose one of the high-risk employees
        timestamp = (now - timedelta(days=random.randint(0, 10), hours=random.randint(1, 23))).isoformat()
        reason = random.choice(high_reasons)
        threat_type = random.choice(high_threat_types)
        risk_score = round(random.uniform(70.0, 89.0), 2)
        alerts.append((emp[0], threat_type, risk_score, "High", timestamp, reason, "Open"))

    # Generate Medium Alerts (138 alerts)
    medium_reasons = [
        "Access to restricted folders containing non-project documents.",
        "Downloading larger than normal data volumes from internal fileserver.",
        "Unusual application usage patterns detected during working hours.",
        "Sending email attachments with archive file extensions (.zip, .rar).",
        "Multiple failed password attempts on secondary developer machine."
    ]
    medium_threat_types = ["Behavioral Anomaly", "Data Access Deviation", "System Activity Anomaly"]
    
    for i in range(138):
        emp = random.choice(employees)
        timestamp = (now - timedelta(days=random.randint(0, 30), hours=random.randint(1, 23))).isoformat()
        reason = random.choice(medium_reasons)
        threat_type = random.choice(medium_threat_types)
        risk_score = round(random.uniform(40.0, 69.0), 2)
        alerts.append((emp[0], threat_type, risk_score, "Medium", timestamp, reason, "Open"))

    cursor.executemany("""
    INSERT INTO alerts (employee_id, threat_type, risk_score, severity, timestamp, reason, status)
    VALUES (?, ?, ?, ?, ?, ?, ?);
    """, alerts)

    # 3. Seed Activities for our high-risk employees to make the timelines look good
    activities = []
    
    # Edward Vance (ESC1389) activities
    ev_activities = [
        ("ESC1389", (now - timedelta(hours=8)).isoformat(), "Login Event", "Remote login from unusual IP address in Ukraine", "Medium", 15.0),
        ("ESC1389", (now - timedelta(hours=6)).isoformat(), "Privilege Change", "Modified security configuration settings on production node", "High", 25.0),
        ("ESC1389", (now - timedelta(hours=4)).isoformat(), "File Access", "Accessed source code repositories not assigned to project", "Medium", 10.0),
        ("ESC1389", (now - timedelta(hours=2)).isoformat(), "Data Transfer", "Downloaded 4.5 GB of compressed repository files", "High", 20.0),
    ]
    activities.extend(ev_activities)

    # Carol Campbell (CCA0846) activities
    cc_activities = [
        ("CCA0846", (now - timedelta(days=1, hours=5)).isoformat(), "Login Event", "Late night login at 2:15 AM EST", "Low", 5.0),
        ("CCA0846", (now - timedelta(days=1, hours=3)).isoformat(), "File Access", "Opened confidential Q3 financial statement", "Medium", 15.0),
        ("CCA0846", (now - timedelta(days=1, hours=1)).isoformat(), "Data Transfer", "Copied financial statement to local Desktop directory", "Medium", 15.0),
        ("CCA0846", (now - timedelta(hours=10)).isoformat(), "Email Activity", "Sent email to personal Gmail address with encrypted attachment", "High", 25.0),
    ]
    activities.extend(cc_activities)

    # Add general low risk activities for standard users
    for emp in employees:
        activities.append((emp[0], (now - timedelta(days=2)).isoformat(), "Login Event", "Successful system login", "Low", 1.0))
        activities.append((emp[0], (now - timedelta(days=2, hours=4)).isoformat(), "Application Usage", "Accessed internal chat platform", "Low", 0.5))

    cursor.executemany("""
    INSERT INTO activities (employee_id, timestamp, activity_type, description, severity, risk_score_contribution)
    VALUES (?, ?, ?, ?, ?, ?);
    """, activities)

    conn.commit()

if __name__ == "__main__":
    init_db()
    print("Database initialized and seeded successfully!")
