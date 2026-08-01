from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
import json

from app.models.employee import Employee
from app.models.activity import Activity
from app.models.alert import Alert
from app.models.incident import Incident
from app.models.user import User
from app.core.security import hash_password

def seed_telemetry_data(db: Session):
    # 1. Clear existing activities, alerts, incidents (to have a clean slate)
    db.query(Alert).delete()
    db.query(Incident).delete()
    db.query(Activity).delete()
    db.query(Employee).delete()
    db.commit()

    # 2. Seed Default User Accounts for testing if they don't exist
    users = [
        {"username": "admin", "email": "admin@company.com", "full_name": "System Admin", "role": "Administrator"},
        {"username": "analyst", "email": "analyst@company.com", "full_name": "Sarah Analyst", "role": "Security Analyst"},
        {"username": "soc", "email": "soc@company.com", "full_name": "Steve SOC", "role": "SOC Engineer"},
        {"username": "manager", "email": "manager@company.com", "full_name": "Mike Manager", "role": "Security Manager"}
    ]

    for u_data in users:
        exists = db.query(User).filter(User.email == u_data["email"]).first()
        if not exists:
            new_user = User(
                username=u_data["username"],
                email=u_data["email"],
                full_name=u_data["full_name"],
                role=u_data["role"],
                hashed_password=hash_password("password123"),
                is_active=True,
                is_verified=True
            )
            db.add(new_user)
    db.commit()

    # 3. Create mock employees
    employees_data = [
        {"employee_id": "EMP001", "full_name": "John Doe", "email": "john.doe@company.com", "department": "Engineering", "designation": "Software Engineer", "manager": "Alice Williams", "risk_score": 0},
        {"employee_id": "EMP002", "full_name": "Jane Smith", "email": "jane.smith@company.com", "department": "Human Resources", "designation": "HR Specialist", "manager": "Alice Williams", "risk_score": 0},
        {"employee_id": "EMP003", "full_name": "Bob Johnson", "email": "bob.johnson@company.com", "department": "Finance", "designation": "Financial Analyst", "manager": "Mike Manager", "risk_score": 0},
        {"employee_id": "EMP004", "full_name": "Alice Williams", "email": "alice.williams@company.com", "department": "Engineering", "designation": "Engineering Director", "manager": "Mike Manager", "risk_score": 0},
        {"employee_id": "EMP005", "full_name": "Charlie Brown", "email": "charlie.brown@company.com", "department": "Security", "designation": "Junior Analyst", "manager": "Mike Manager", "risk_score": 0}
    ]

    employees = []
    for emp_data in employees_data:
        emp = Employee(**emp_data)
        db.add(emp)
        employees.append(emp)
    db.commit()

    # 4. Generate activities over the last 14 days
    now = datetime.utcnow()
    activities_to_add = []

    # Helper to create timestamps
    def get_time_on_day(day_offset, hour, minute):
        date = now - timedelta(days=day_offset)
        return date.replace(hour=hour, minute=minute, second=0, microsecond=0)

    # Let's seed normal working baselines for days 3 to 14
    for day in range(3, 15):
        # Skip weekends for standard baseline, mostly working Monday-Friday (offsets are days ago)
        check_date = now - timedelta(days=day)
        if check_date.weekday() >= 5: # 5 = Saturday, 6 = Sunday
            continue

        for emp in employees:
            # Login Event (morning)
            login_hour = random.randint(8, 10)
            login_min = random.randint(0, 59)
            activities_to_add.append(Activity(
                activity_name="login",
                performed_by=emp.email,
                status="SUCCESS",
                description=json.dumps({
                    "ip_address": f"192.168.1.{random.randint(10, 99)}",
                    "device_id": f"DEV-{emp.employee_id}",
                    "location": "HQ-Office",
                    "auth_method": "Password + OTP"
                }),
                timestamp=get_time_on_day(day, login_hour, login_min)
            ))

            # Normal File Access
            for _ in range(random.randint(3, 8)):
                access_hour = random.randint(10, 16)
                access_min = random.randint(0, 59)
                file_size_kb = random.randint(50, 2000)
                activities_to_add.append(Activity(
                    activity_name="file_access",
                    performed_by=emp.email,
                    status="SUCCESS",
                    description=json.dumps({
                        "file_name": f"project_doc_{random.randint(1, 10)}.docx",
                        "file_path": f"/shared/{emp.department.lower()}/documents/",
                        "action": "READ",
                        "file_size_kb": file_size_kb
                    }),
                    timestamp=get_time_on_day(day, access_hour, access_min)
                ))

            # Normal Email activity
            for _ in range(random.randint(2, 5)):
                email_hour = random.randint(10, 17)
                email_min = random.randint(0, 59)
                activities_to_add.append(Activity(
                    activity_name="email",
                    performed_by=emp.email,
                    status="SUCCESS",
                    description=json.dumps({
                        "recipient": f"colleague{random.randint(1, 5)}@company.com",
                        "subject": "Status Update",
                        "has_attachments": random.choice([True, False]),
                        "attachment_size_kb": random.randint(100, 1500) if random.choice([True, False]) else 0
                    }),
                    timestamp=get_time_on_day(day, email_hour, email_min)
                ))

            # Normal Logout Event
            logout_hour = random.randint(17, 19)
            logout_min = random.randint(0, 59)
            activities_to_add.append(Activity(
                activity_name="logout",
                performed_by=emp.email,
                status="SUCCESS",
                description=json.dumps({
                    "device_id": f"DEV-{emp.employee_id}"
                }),
                timestamp=get_time_on_day(day, logout_hour, logout_min)
            ))

    # 5. Ingest Suspicious / Threat Scenario Activities in the last 2 days
    
    # --- Scenario A: John Doe (EMP001) - Data Exfiltration ---
    # Day 1: Late night login + massive file download
    activities_to_add.append(Activity(
        activity_name="login",
        performed_by="john.doe@company.com",
        status="SUCCESS",
        description=json.dumps({
            "ip_address": "203.0.113.5", # Unusual external IP
            "device_id": "DEV-EMP001",
            "location": "Unknown-External",
            "auth_method": "Password Only"
        }),
        timestamp=get_time_on_day(1, 23, 14) # 11:14 PM
    ))

    activities_to_add.append(Activity(
        activity_name="file_access",
        performed_by="john.doe@company.com",
        status="SUCCESS",
        description=json.dumps({
            "file_name": "source_code_master_backup.tar.gz",
            "file_path": "/secure/codebase/v2/",
            "action": "DOWNLOAD",
            "file_size_kb": 8500000 # 8.5 GB (Abnormal)
        }),
        timestamp=get_time_on_day(1, 23, 25)
    ))

    activities_to_add.append(Activity(
        activity_name="usb_device",
        performed_by="john.doe@company.com",
        status="SUCCESS",
        description=json.dumps({
            "device_name": "UltraSpeed 64GB USB Drive",
            "action": "PLUG_IN",
            "serial_number": "USB-9988-XYZ"
        }),
        timestamp=get_time_on_day(1, 23, 35)
    ))

    activities_to_add.append(Activity(
        activity_name="file_access",
        performed_by="john.doe@company.com",
        status="SUCCESS",
        description=json.dumps({
            "file_name": "source_code_master_backup.tar.gz",
            "file_path": "E:/Backups/", # Copying to USB drive E:
            "action": "WRITE",
            "file_size_kb": 8500000
        }),
        timestamp=get_time_on_day(1, 23, 40)
    ))

    # --- Scenario B: Jane Smith (EMP002) - Privilege Abuse / Unauthorized Access Attempts ---
    # Day 2: Repeated failed logins and unauthorized access attempts to Finance systems
    for attempt in range(5):
        activities_to_add.append(Activity(
            activity_name="login",
            performed_by="jane.smith@company.com",
            status="FAILED",
            description=json.dumps({
                "ip_address": "198.51.100.12", # Strange IP
                "device_id": "UNKNOWN-DEV",
                "reason": "Incorrect password",
                "location": "Russia"
            }),
            timestamp=get_time_on_day(2, 4, 10 + attempt * 2) # 4:10 AM
        ))

    # Successful login, but then trying to access finance server
    activities_to_add.append(Activity(
        activity_name="login",
        performed_by="jane.smith@company.com",
        status="SUCCESS",
        description=json.dumps({
            "ip_address": "198.51.100.12",
            "device_id": "DEV-EMP002",
            "location": "Russia"
        }),
        timestamp=get_time_on_day(2, 4, 25)
    ))

    activities_to_add.append(Activity(
        activity_name="file_access",
        performed_by="jane.smith@company.com",
        status="FAILED",
        description=json.dumps({
            "file_name": "payroll_2026_q2.xlsx",
            "file_path": "/secure/finance/payroll/",
            "action": "READ",
            "reason": "Access Denied - Role restriction (HR Associate does not have finance role)"
        }),
        timestamp=get_time_on_day(2, 4, 30)
    ))

    # --- Scenario C: Bob Johnson (EMP003) - Unusual working hours & Privilege Changes ---
    # Day 1: Sunday login and remote session from strange location, modifying system roles
    activities_to_add.append(Activity(
        activity_name="login",
        performed_by="bob.johnson@company.com",
        status="SUCCESS",
        description=json.dumps({
            "ip_address": "192.168.10.45",
            "device_id": "DEV-EMP003",
            "location": "VPN-Home",
            "auth_method": "Password Only"
        }),
        timestamp=get_time_on_day(1, 2, 45) # 2:45 AM (Sunday/Off-hours)
    ))

    activities_to_add.append(Activity(
        activity_name="privilege_change",
        performed_by="bob.johnson@company.com",
        status="SUCCESS",
        description=json.dumps({
            "target_user": "bob.johnson@company.com",
            "action": "GRANT_ROLE",
            "role": "SuperAdmin",
            "modified_by": "bob.johnson@company.com"
        }),
        timestamp=get_time_on_day(1, 2, 50)
    ))

    # Add all activities
    db.add_all(activities_to_add)
    db.commit()

    return {
        "success": True,
        "message": f"Successfully cleared tables and seeded default users, {len(employees)} employees, and {len(activities_to_add)} activity log entries."
    }
