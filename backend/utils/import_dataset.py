"""
Dataset Ingestion Script: Imports LDAP employees and a slice of real event logs
from the CERT Insider Threat Dataset into PostgreSQL.
Run with: python -m backend.utils.import_dataset
"""

import csv
import os
import asyncio
from datetime import datetime
from sqlalchemy import select
from backend.core.database import AsyncSessionLocal, engine, Base
from backend.models.user import User
from backend.models.activity_log import ActivityLog
from backend.models.dataset import Employee, LogonEvent, DeviceEvent, FileEvent, EmailEvent, HttpEvent

CERT_DIR = r"d:\insider-threat-behavioral-intelligence-system\dataset\CERT Insider Threat Dataset"
LDAP_PATH = os.path.join(CERT_DIR, "r4.2", "LDAP", "2010-01.csv")
LOGON_PATH = os.path.join(CERT_DIR, "r4.2", "logon.csv")
DEVICE_PATH = os.path.join(CERT_DIR, "r4.2", "device.csv")
FILE_PATH = os.path.join(CERT_DIR, "r4.2", "file.csv")
EMAIL_PATH = os.path.join(CERT_DIR, "r4.2", "email.csv")
HTTP_PATH = os.path.join(CERT_DIR, "r4.2", "http.csv")
INSIDERS_PATH = os.path.join(CERT_DIR, "answers", "insiders.csv")


def load_insider_ids():
    """Load listed malicious user IDs from insiders.csv."""
    insiders = set()
    if not os.path.exists(INSIDERS_PATH):
        print(f"[WARN] Insiders file not found at: {INSIDERS_PATH}")
        return insiders

    with open(INSIDERS_PATH, mode='r', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row in reader:
            if not row or len(row) < 4:
                continue
            user_id = row[3].strip()
            if user_id and user_id != 'user':
                insiders.add(user_id)
    print(f"[OK] Loaded {len(insiders)} malicious insider IDs")
    return insiders


async def import_employees(session, insiders):
    """Import employees from LDAP csv."""
    if not os.path.exists(LDAP_PATH):
        print(f"[ERROR] LDAP directory file not found at: {LDAP_PATH}")
        return {}

    employees_map = {}
    with open(LDAP_PATH, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        count = 0
        for row in reader:
            emp_id = row['user_id']
            # We import all insiders + a random slice of normal users to cap it around 200 users
            is_insider = emp_id in insiders
            if not is_insider and count > 150:
                continue

            # Check duplicate in DB
            result = await session.execute(select(Employee).where(Employee.employee_id == emp_id))
            if result.scalar_one_or_none():
                employees_map[emp_id] = True
                continue

            # Assign a realistic risk score (insiders get higher scores)
            risk_score = 0
            if is_insider:
                import random
                risk_score = random.randint(65, 95)
            else:
                import random
                risk_score = random.randint(0, 35)

            emp = Employee(
                employee_id=emp_id,
                full_name=row['employee_name'],
                email=row['email'],
                role=row['role'],
                department=row['department'],
                designation=row['role'],
                manager=row['supervisor'],
                risk_score=risk_score,
                is_active=True
            )
            session.add(emp)
            employees_map[emp_id] = True
            if not is_insider:
                count += 1

    await session.commit()
    print(f"[OK] Seeded {len(employees_map)} employees in database")
    return employees_map


async def import_logons(session, employees_map):
    """Import logon/logoff events for imported employees, capped at 5000."""
    if not os.path.exists(LOGON_PATH):
        print("[WARN] logon.csv not found")
        return

    print("Importing Logon events...")
    with open(LOGON_PATH, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        count = 0
        batch = []
        for row in reader:
            emp_id = row['user']
            if emp_id not in employees_map:
                continue

            ts = datetime.strptime(row['date'], "%m/%d/%Y %H:%M:%S")
            event = LogonEvent(
                event_id=row['id'],
                timestamp=ts,
                employee_id=emp_id,
                pc=row['pc'],
                activity=row['activity']
            )
            batch.append(event)
            count += 1
            if len(batch) >= 1000:
                session.add_all(batch)
                await session.flush()
                batch = []

            if count >= 5000:
                break

        if batch:
            session.add_all(batch)
        await session.commit()
    print(f"[OK] Seeded {count} Logon events")


async def import_devices(session, employees_map):
    """Import device events, capped at 3000."""
    if not os.path.exists(DEVICE_PATH):
        print("[WARN] device.csv not found")
        return

    print("Importing Device events...")
    with open(DEVICE_PATH, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        count = 0
        batch = []
        for row in reader:
            emp_id = row['user']
            if emp_id not in employees_map:
                continue

            ts = datetime.strptime(row['date'], "%m/%d/%Y %H:%M:%S")
            event = DeviceEvent(
                event_id=row['id'],
                timestamp=ts,
                employee_id=emp_id,
                pc=row['pc'],
                activity=row['activity']
            )
            batch.append(event)
            count += 1
            if len(batch) >= 1000:
                session.add_all(batch)
                await session.flush()
                batch = []

            if count >= 3000:
                break

        if batch:
            session.add_all(batch)
        await session.commit()
    print(f"[OK] Seeded {count} Device events")


async def import_files(session, employees_map):
    """Import file events, capped at 2000."""
    if not os.path.exists(FILE_PATH):
        print("[WARN] file.csv not found")
        return

    print("Importing File events...")
    with open(FILE_PATH, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        count = 0
        batch = []
        for row in reader:
            emp_id = row['user']
            if emp_id not in employees_map:
                continue

            ts = datetime.strptime(row['date'], "%m/%d/%Y %H:%M:%S")
            event = FileEvent(
                event_id=row['id'],
                timestamp=ts,
                employee_id=emp_id,
                pc=row['pc'],
                filename=row['filename'],
                content=row['content']
            )
            batch.append(event)
            count += 1
            if len(batch) >= 500:
                session.add_all(batch)
                await session.flush()
                batch = []

            if count >= 2000:
                break

        if batch:
            session.add_all(batch)
        await session.commit()
    print(f"[OK] Seeded {count} File events")


async def import_emails(session, employees_map):
    """Import email events, capped at 2000."""
    if not os.path.exists(EMAIL_PATH):
        print("[WARN] email.csv not found")
        return

    print("Importing Email events...")
    with open(EMAIL_PATH, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        count = 0
        batch = []
        for row in reader:
            emp_id = row['user']
            if emp_id not in employees_map:
                continue

            ts = datetime.strptime(row['date'], "%m/%d/%Y %H:%M:%S")
            event = EmailEvent(
                event_id=row['id'],
                timestamp=ts,
                employee_id=emp_id,
                pc=row['pc'],
                to_address=row['to'],
                from_address=row['from'],
                size=int(row['size']),
                attachments=int(row['attachments']),
                content=row['content']
            )
            batch.append(event)
            count += 1
            if len(batch) >= 500:
                session.add_all(batch)
                await session.flush()
                batch = []

            if count >= 2000:
                break

        if batch:
            session.add_all(batch)
        await session.commit()
    print(f"[OK] Seeded {count} Email events")


async def import_http(session, employees_map):
    """Import http events, capped at 2000."""
    if not os.path.exists(HTTP_PATH):
        print("[WARN] http.csv not found")
        return

    print("Importing Http events...")
    with open(HTTP_PATH, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        count = 0
        batch = []
        for row in reader:
            emp_id = row['user']
            if emp_id not in employees_map:
                continue

            ts = datetime.strptime(row['date'], "%m/%d/%Y %H:%M:%S")
            event = HttpEvent(
                event_id=row['id'],
                timestamp=ts,
                employee_id=emp_id,
                pc=row['pc'],
                url=row['url'],
                content=row['content']
            )
            batch.append(event)
            count += 1
            if len(batch) >= 500:
                session.add_all(batch)
                await session.flush()
                batch = []

            if count >= 2000:
                break

        if batch:
            session.add_all(batch)
        await session.commit()
    print(f"[OK] Seeded {count} Http events")


async def main():
    # Make sure all tables are created
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[OK] Database tables verified/created")

    async with AsyncSessionLocal() as session:
        insiders = load_insider_ids()
        employees_map = await import_employees(session, insiders)
        
        if employees_map:
            await import_logons(session, employees_map)
            await import_devices(session, employees_map)
            await import_files(session, employees_map)
            await import_emails(session, employees_map)
            await import_http(session, employees_map)

    print("[SUCCESS] CERT dataset ingestion successfully completed!")


if __name__ == "__main__":
    asyncio.run(main())
