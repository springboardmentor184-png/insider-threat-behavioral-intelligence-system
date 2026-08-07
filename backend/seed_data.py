# backend/seed_data.py
import sys
import os
import uuid
import asyncio
from datetime import datetime, timedelta
import random

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models import models
from app.core.security import hash_password
from app.core.mongodb import activity_collection, fallback_collection

DEFAULT_EMPLOYEE_ID = '33901353-84ca-11f1-9e39-e4fd457b80cb'

def seed_sql_data():
    print("[INFO] Initializing SQL Database & Schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        roles_dict = {}
        roles_to_create = [
            ("Administrator", "System Administrator with full permissions"),
            ("Security Manager", "Manager overseeing threat posture and reports"),
            ("SOC Engineer", "SOC analyst monitoring live events and security feeds"),
            ("Security Analyst", "Analyst investigating alerts and insider anomalies")
        ]
        
        for r_name, r_desc in roles_to_create:
            role = db.query(models.Role).filter(models.Role.role_name == r_name).first()
            if not role:
                role = models.Role(role_name=r_name, description=r_desc)
                db.add(role)
                db.commit()
                db.refresh(role)
                print(f"  [+] Added Role: {r_name}")
            roles_dict[r_name] = role.role_id
            
        users_to_create = [
            ("admin", "admin@insiderthreat.io", "admin123", "Administrator", "John", "Doe", DEFAULT_EMPLOYEE_ID, "Cybersecurity", "Chief Information Security Officer"),
            ("analyst", "analyst@insiderthreat.io", "analyst123", "Security Analyst", "Alice", "Smith", "44801353-84ca-11f1-9e39-e4fd457b80cc", "SOC Operations", "Senior Security Analyst"),
            ("soc_engineer", "soc@insiderthreat.io", "soc123", "SOC Engineer", "Bob", "Johnson", "55701353-84ca-11f1-9e39-e4fd457b80cd", "Infrastructure", "Lead SOC Engineer"),
            ("manager", "manager@insiderthreat.io", "manager123", "Security Manager", "Carol", "Williams", "66601353-84ca-11f1-9e39-e4fd457b80ce", "Executive", "Security Operations Manager")
        ]
        
        for uname, uemail, upass, rname, fname, lname, empid, dept, desig in users_to_create:
            usr = db.query(models.User).filter(models.User.username == uname).first()
            if not usr:
                usr = models.User(
                    username=uname,
                    email=uemail,
                    password_hash=hash_password(upass),
                    role_id=roles_dict[rname]
                )
                db.add(usr)
                db.commit()
                db.refresh(usr)
                print(f"  [+] Added User: {uname} ({rname})")
            
            emp = db.query(models.Employee).filter(models.Employee.employee_id == empid).first()
            if not emp:
                emp = models.Employee(
                    employee_id=empid,
                    user_id=usr.user_id,
                    first_name=fname,
                    last_name=lname,
                    email=uemail,
                    department=dept,
                    designation=desig,
                    status="active"
                )
                db.add(emp)
                db.commit()
                print(f"  [+] Added Employee: {fname} {lname} ({empid})")
                
    except Exception as e:
        print(f"[-] SQL Seeding Error: {e}")
        db.rollback()
    finally:
        db.close()

async def seed_activity_logs():
    print("[INFO] Seeding Activity Monitoring & Behavioral Telemetry...")
    
    employees = [
        DEFAULT_EMPLOYEE_ID,
        "44801353-84ca-11f1-9e39-e4fd457b80cc",
        "55701353-84ca-11f1-9e39-e4fd457b80cd",
        "66601353-84ca-11f1-9e39-e4fd457b80ce"
    ]
    
    event_pool = [
        ("LOGIN_SUCCESS", "AUTH_SERVER", "192.168.1.45", "INFO"),
        ("FILE_DOWNLOAD", "SHAREPOINT", "192.168.1.45", "INFO"),
        ("APPLICATION_USAGE", "VISUAL_STUDIO", "192.168.1.45", "INFO"),
        ("NETWORK_TRAFFIC", "INTERNAL_GATEWAY", "192.168.1.45", "INFO"),
        ("EMAIL_SENT", "EXCHANGE_MAIL", "192.168.1.45", "INFO"),
        ("FILE_UPLOAD", "CLOUD_STORAGE", "192.168.1.45", "WARNING"),
        ("USB_INSERTION", "ENDPOINT_AGENT", "192.168.1.45", "WARNING"),
        ("PRIVILEGE_CHANGE", "ACTIVE_DIRECTORY", "192.168.1.99", "CRITICAL"),
        ("UNUSUAL_LOGIN_TIME", "VPN_GATEWAY", "10.8.0.12", "CRITICAL"),
        ("EXCESSIVE_DATA_TRANSFER", "INTERNAL_FTP", "192.168.1.180", "CRITICAL")
    ]
    
    activities = []
    now = datetime.utcnow()
    
    for emp_id in employees:
        for i in range(40):
            days_ago = random.randint(0, 14)
            hours_ago = random.randint(0, 23)
            timestamp = now - timedelta(days=days_ago, hours=hours_ago)
            
            if i < 28:
                event_type, source_system, ip_addr, severity = random.choice(event_pool[:5])
            elif i < 35:
                event_type, source_system, ip_addr, severity = random.choice(event_pool[5:7])
            else:
                event_type, source_system, ip_addr, severity = random.choice(event_pool[7:])
                
            activities.append({
                "employee_id": emp_id,
                "event_type": event_type,
                "source_system": source_system,
                "severity": severity,
                "ip_address": ip_addr,
                "metadata": {
                    "bytes_transferred": random.randint(500, 5000000),
                    "file_name": "confidential_project_spec.pdf" if "FILE" in event_type else None,
                    "location": "Remote / VPN" if "VPN" in source_system else "HQ Office"
                },
                "timestamp": timestamp,
                "created_by": "system_ingest"
            })

    # Always seed into fallback collection (JSON storage) for offline reliability
    await fallback_collection.insert_many(activities)
    print(f"  [+] Seeded {len(activities)} activity logs into JSON telemetry store!")
    try:
        await activity_collection.insert_many(activities)
        print(f"  [+] Seeded {len(activities)} activity logs into MongoDB!")
    except Exception as e:
        print(f"  [-] MongoDB offline: using persistent JSON store.")

def main():
    seed_sql_data()
    asyncio.run(seed_activity_logs())
    print("[SUCCESS] Database seeding completed successfully!")

if __name__ == "__main__":
    main()
