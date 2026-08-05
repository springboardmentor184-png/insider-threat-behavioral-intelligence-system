import sys
import random
import uuid
from pathlib import Path
from datetime import datetime, timedelta

import pandas as pd

from sqlalchemy.orm import Session

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(BASE_DIR))

from app.database.base import Base
from app.database.session import engine, SessionLocal

from app.models.department import Department
from app.models.role import Role
from app.models.employee import Employee

from app.models.activity import (
    ActivityLog,
    ActivityType,
    Severity,
)

from app.models.behavior_profile import BehaviorProfile

from app.models.risk import (
    RiskAssessment,
    RiskLevel,
)

from app.core.security import get_password_hash


# ==========================================================
# DATASET PATHS
# ==========================================================

DATASET = BASE_DIR / "dataset"

PSYCHOMETRIC = DATASET / "psychometric.csv"
LOGON = DATASET / "logon.csv"
DEVICE = DATASET / "device.csv"
FILE = DATASET / "file.csv"
EMAIL = DATASET / "email.csv"
HTTP = DATASET / "http.csv"

db: Session = SessionLocal()

Base.metadata.create_all(bind=engine)


# ==========================================================
# GENERAL HELPERS
# ==========================================================

BROWSERS = [
    "Chrome",
    "Firefox",
    "Edge",
    "Safari"
]

OPERATING_SYSTEMS = [
    "Windows 11",
    "Windows 10",
    "Ubuntu",
    "macOS"
]

LOCATIONS = [
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Mumbai",
    "Pune",
    "Delhi",
    "Mysore"
]


def split_name(full_name):

    full_name = str(full_name).strip()

    parts = full_name.split()

    if len(parts) == 1:
        return parts[0], ""

    return parts[0], " ".join(parts[1:])


def random_phone():
    return "9" + "".join(random.choices("0123456789", k=9))


def random_join_date():

    start = datetime(2020, 1, 1)
    end = datetime(2024, 12, 31)

    return start + timedelta(
        days=random.randint(0, (end - start).days)
    )


def parse_datetime(value):

    try:
        return pd.to_datetime(value)

    except Exception:
        return datetime.utcnow()


def random_ip():

    return ".".join(
        str(random.randint(1, 255))
        for _ in range(4)
    )


def random_browser():
    return random.choice(BROWSERS)


def random_os():
    return random.choice(OPERATING_SYSTEMS)


def random_location():
    return random.choice(LOCATIONS)


def random_session():

    return str(uuid.uuid4())


def existing_departments():
    return db.query(Department).all()


def existing_roles():
    return db.query(Role).all()


# Cache employee IDs after employee import
EMPLOYEE_CACHE = {}


def load_employee_cache():

    global EMPLOYEE_CACHE

    EMPLOYEE_CACHE = {
        emp.employee_id: emp.id
        for emp in db.query(Employee).all()
    }

    print(f"Loaded {len(EMPLOYEE_CACHE)} employees into cache.")
    # ==========================================================
# DEPARTMENTS
# ==========================================================

def seed_departments():

    print("\nSeeding Departments...")

    departments = [

        ("Human Resources", "HR"),
        ("Finance", "FIN"),
        ("Information Technology", "IT"),
        ("Sales", "SAL"),
        ("Operations", "OPS")

    ]

    all_depts = db.query(Department).all()
    existing_codes = {d.department_code.lower() for d in all_depts}
    existing_names = {d.department_name.lower() for d in all_depts}

    for name, code in departments:

        if code.lower() in existing_codes or name.lower() in existing_names:
            continue

        db.add(
            Department(
                department_name=name,
                department_code=code.lower(),
                description=f"{name} Department"
            )
        )

    db.commit()

    print("Departments Ready")



# ==========================================================
# ROLES
# ==========================================================

def seed_roles():

    print("\nSeeding Roles...")

    roles = [

        ("Administrator", {"all": True}),
        ("Manager", {"approve": True, "view": True}),
        ("HR", {"employees": True}),
        ("Security Analyst", {"risk": True}),
        ("Employee", {"self": True}),
        ("Intern", {}),
        ("Auditor", {"audit": True}),
        ("Executive", {"reports": True})

    ]

    existing = {
        r.role_name
        for r in db.query(Role).all()
    }

    for role_name, permissions in roles:

        if role_name in existing:
            continue

        db.add(
            Role(
                role_name=role_name,
                description=role_name,
                permissions=permissions
            )
        )

    db.commit()

    print("Roles Ready")


# ==========================================================
# EMPLOYEES
# ==========================================================

def seed_employees(limit=300):

    print("\nReading psychometric.csv...")

    df = pd.read_csv(PSYCHOMETRIC)

    departments = existing_departments()
    roles = existing_roles()

    inserted = 0

    for _, row in df.iterrows():

        if inserted >= limit:
            break

        employee_code = str(row["user_id"]).strip()

        if db.query(Employee).filter(
            Employee.employee_id == employee_code
        ).first():
            continue

        first_name, last_name = split_name(
            row["employee_name"]
        )

        department = departments[
            inserted % len(departments)
        ]

        role = roles[
            inserted % len(roles)
        ]

        employee = Employee(

            employee_id=employee_code,

            first_name=first_name,

            last_name=last_name,

            email=f"{employee_code.lower()}@technova.com",

            phone=random_phone(),

            department_id=department.id,

            role_id=role.id,

            job_title=role.role_name,

            manager_name="System Manager",

            password_hash=get_password_hash("Password@123"),

            status="Active",

            date_joined=random_join_date(),

            last_login=None

        )

        db.add(employee)

        inserted += 1

        if inserted % 50 == 0:

            db.commit()

            print(f"{inserted} Employees Imported")

    db.commit()

    print(f"\nSuccessfully Imported {inserted} Employees")

    load_employee_cache()

    print("Employee Cache Loaded")
    # ==========================================================
# ACTIVITY IMPORT HELPERS (CERT R4.2)
# ==========================================================

CHUNK_SIZE = 5000


def read_dataset(path):
    """
    Read CERT datasets safely in chunks.
    """

    return pd.read_csv(
        path,
        chunksize=CHUNK_SIZE,
        low_memory=False,
        encoding="utf-8",
        on_bad_lines="skip",
    )


def employee_db_id(user):

    if pd.isna(user):
        return None

    return EMPLOYEE_CACHE.get(str(user).strip())


def batch_commit(counter):

    if counter % 1000 == 0:

        db.commit()

        print(f"{counter:,} rows inserted...")


def activity_exists(emp_id, activity_type, timestamp):

    return db.query(ActivityLog).filter(

        ActivityLog.employee_id == emp_id,

        ActivityLog.activity_type == activity_type,

        ActivityLog.timestamp == timestamp

    ).first()


def create_activity(

    employee_id,
    activity_type,
    description,
    severity,
    timestamp,

    device_name=None,
    device_id=None,

    browser=None,
    operating_system=None,

    application_name=None,

    ip_address=None,

    location=None,

    vpn_used=False,

    resource_name=None,

    upload_size=0,
    download_size=0,
    data_transferred=0,

    session_duration=0,

    anomaly_score=0.0

):

    ts = parse_datetime(timestamp)

    if activity_exists(employee_id, activity_type, ts):
        return

    db.add(

        ActivityLog(

            employee_id=employee_id,

            activity_type=activity_type,

            description=str(description),

            severity=severity,

            timestamp=ts,

            device_name=device_name,

            device_id=device_id,

            browser=browser,

            operating_system=operating_system,

            application_name=application_name,

            ip_address=ip_address,

            location=location,

            vpn_used=vpn_used,

            is_after_hours=(ts.hour < 8 or ts.hour > 18),

            is_weekend=(ts.weekday() >= 5),

            session_id=random_session(),

            session_duration=session_duration,

            resource_name=resource_name,

            upload_size=upload_size,

            download_size=download_size,

            data_transferred=data_transferred,

            anomaly_score=anomaly_score

        )

    )
 # ==========================================================
# LOGON DATASET (CERT R4.2)
# ==========================================================

def seed_logon():

    print("\nImporting LOGON dataset...")

    inserted = 0

    for chunk in read_dataset(LOGON):

        for _, row in chunk.iterrows():

            employee = employee_db_id(row["user"])

            if employee is None:
                continue

            action = str(row["activity"]).strip().lower()

            activity = (
                ActivityType.LOGOUT
                if "logoff" in action
                else ActivityType.LOGIN
            )

            severity = Severity.LOW

            if "failed" in action:
                severity = Severity.MEDIUM

            create_activity(

                employee_id=employee,

                activity_type=activity,

                description=action,

                severity=severity,

                timestamp=row["date"],

                device_name=str(row["pc"]),

                device_id=str(row["pc"]),

                browser=random_browser(),

                operating_system=random_os(),

                application_name="Windows Logon",

                ip_address=random_ip(),

                location=random_location(),

                vpn_used=False,

                session_duration=random.randint(300,28800),

                anomaly_score=round(
                    random.uniform(0.01,0.20),2
                )

            )

            inserted += 1

            batch_commit(inserted)

    db.commit()

    print(f"Inserted {inserted:,} Logon Activities")


# ==========================================================
# DEVICE DATASET (CERT R4.2)
# ==========================================================

def seed_device():

    print("\nImporting DEVICE dataset...")

    inserted = 0

    for chunk in read_dataset(DEVICE):

        for _, row in chunk.iterrows():

            employee = employee_db_id(row["user"])

            if employee is None:
                continue

            action = str(row["activity"]).lower()

            if "disconnect" in action:

                activity = ActivityType.USB_REMOVED

            else:

                activity = ActivityType.USB_CONNECTED

            severity = Severity.MEDIUM

            if "connect" in action:

                anomaly = random.uniform(0.08,0.35)

            else:

                anomaly = random.uniform(0.02,0.18)

            create_activity(

                employee_id=employee,

                activity_type=activity,

                description=action,

                severity=severity,

                timestamp=row["date"],

                device_name=str(row["pc"]),

                device_id=str(row["pc"]),

                browser=random_browser(),

                operating_system=random_os(),

                application_name="USB Device",

                ip_address=random_ip(),

                location=random_location(),

                vpn_used=False,

                resource_name="USB Device",

                session_duration=0,

                anomaly_score=round(anomaly,2)

            )

            inserted += 1

            batch_commit(inserted)

    db.commit()

    print(f"Inserted {inserted:,} Device Activities")
    # ==========================================================
# FILE DATASET (CERT R4.2)
# ==========================================================

def seed_file():

    print("\nImporting FILE dataset...")

    inserted = 0

    for chunk in read_dataset(FILE):

        for _, row in chunk.iterrows():

            employee = employee_db_id(row["user"])

            if employee is None:
                continue

            filename = str(row.get("filename", "Unknown"))

            filename_lower = filename.lower()

            activity = ActivityType.FILE_ACCESS
            severity = Severity.LOW

            anomaly = random.uniform(0.03, 0.20)

            if filename_lower.endswith(
                (".zip", ".rar", ".7z")
            ):

                activity = ActivityType.FILE_DOWNLOAD
                severity = Severity.MEDIUM
                anomaly = random.uniform(0.20, 0.50)

            if any(
                keyword in filename_lower
                for keyword in [
                    "secret",
                    "confidential",
                    "salary",
                    "finance",
                    "payroll",
                    "hr",
                    "password"
                ]
            ):

                activity = ActivityType.SENSITIVE_FILE_ACCESS
                severity = Severity.HIGH
                anomaly = random.uniform(0.60, 0.95)

            filesize = random.randint(
                10_000,
                2_000_000
            )

            create_activity(

                employee_id=employee,

                activity_type=activity,

                description=filename,

                severity=severity,

                timestamp=row["date"],

                device_name=str(row["pc"]),

                device_id=str(row["pc"]),

                browser=random_browser(),

                operating_system=random_os(),

                application_name="Windows Explorer",

                ip_address=random_ip(),

                location=random_location(),

                resource_name=filename,

                upload_size=filesize,

                download_size=filesize,

                data_transferred=filesize,

                anomaly_score=round(anomaly, 2)

            )

            inserted += 1

            batch_commit(inserted)

    db.commit()

    print(f"Inserted {inserted:,} File Activities")


# ==========================================================
# EMAIL DATASET (CERT R4.2)
# ==========================================================

def seed_email():

    print("\nImporting EMAIL dataset...")

    inserted = 0

    for chunk in pd.read_csv(
    EMAIL,
    sep="\t",
    chunksize=CHUNK_SIZE,
    low_memory=False,
    encoding="utf-8",
    on_bad_lines="skip",
):

        for _, row in chunk.iterrows():

            employee = employee_db_id(row["user"])

            if employee is None:
                continue

            recipients = str(row.get("to", ""))

            attachments = str(
                row.get("attachments", "")
            )

            severity = Severity.LOW
            anomaly = random.uniform(0.05, 0.25)

            if attachments:

                severity = Severity.MEDIUM
                anomaly = random.uniform(0.25, 0.50)

            if attachments.lower().endswith(
                (
                    ".zip",
                    ".rar",
                    ".7z",
                    ".exe",
                    ".bat",
                    ".ps1"
                )
            ):

                severity = Severity.HIGH
                anomaly = random.uniform(0.70, 0.98)

            create_activity(

                employee_id=employee,

                activity_type=ActivityType.EMAIL_ACTIVITY,

                description=f"Email sent to {recipients}",

                severity=severity,

                timestamp=row["date"],

                device_name=str(row["pc"]),

                device_id=str(row["pc"]),

                browser="Outlook",

                operating_system=random_os(),

                application_name="Microsoft Outlook",

                ip_address=random_ip(),

                location=random_location(),

                resource_name=attachments,

                upload_size=random.randint(
                    5_000,
                    500_000
                ),

                data_transferred=random.randint(
                    10_000,
                    1_000_000
                ),

                anomaly_score=round(anomaly, 2)

            )

            inserted += 1

            batch_commit(inserted)

    db.commit()

    print(f"Inserted {inserted:,} Email Activities")
    # ==========================================================
# HTTP DATASET (CERT R4.2)
# ==========================================================

def seed_http():

    print("\nImporting HTTP dataset...")

    inserted = 0

    suspicious_sites = [

        "dropbox",
        "mega",
        "drive.google",
        "onedrive",
        "pastebin",
        "github",
        "wetransfer",
        "box.com"

    ]

    for chunk in pd.read_csv(
    HTTP,
    sep="\t",
    chunksize=CHUNK_SIZE,
    low_memory=False,
    encoding="utf-8",
    on_bad_lines="skip",
):

        for _, row in chunk.iterrows():

            employee = employee_db_id(row["user"])

            if employee is None:
                continue

            url = str(row.get("url", "")).strip()

            activity = ActivityType.WEBSITE_ACCESS
            severity = Severity.LOW
            anomaly = random.uniform(0.02, 0.20)

            if any(site in url.lower() for site in suspicious_sites):

                activity = ActivityType.CLOUD_UPLOAD
                severity = Severity.HIGH
                anomaly = random.uniform(0.70, 0.98)

            elif any(site in url.lower() for site in [
                "facebook",
                "instagram",
                "youtube",
                "reddit",
                "twitter",
                "x.com"
            ]):

                severity = Severity.MEDIUM
                anomaly = random.uniform(0.20, 0.45)

            create_activity(

                employee_id=employee,

                activity_type=activity,

                description=url,

                severity=severity,

                timestamp=row["date"],

                device_name=str(row["pc"]),

                device_id=str(row["pc"]),

                browser=random.choice(
                    [
                        "Chrome",
                        "Edge",
                        "Firefox"
                    ]
                ),

                operating_system=random_os(),

                application_name="Web Browser",

                ip_address=random_ip(),

                location=random_location(),

                vpn_used=random.choice([True, False]),

                resource_name=url,

                download_size=random.randint(
                    5000,
                    1000000
                ),

                data_transferred=random.randint(
                    50000,
                    5000000
                ),

                anomaly_score=round(anomaly,2)

            )

            inserted += 1

            batch_commit(inserted)

    db.commit()

    print(f"Inserted {inserted:,} HTTP Activities")


# ==========================================================
# IMPORT ALL ACTIVITY DATASETS
# ==========================================================

def seed_activity_logs():

    print("\n")
    print("=" * 60)
    print("IMPORTING CERT R4.2 ACTIVITY DATASETS")
    print("=" * 60)

    load_employee_cache()

    seed_logon()

    seed_device()

    seed_file()

    seed_email()

    seed_http()

    total = db.query(ActivityLog).count()

    print("\n")
    print("=" * 60)
    print(f"TOTAL ACTIVITY LOGS : {total:,}")
    print("=" * 60)
    # ==========================================================
# BEHAVIOR PROFILE GENERATION (OPTIMIZED)
# ==========================================================

def generate_behavior_profiles():

    print("\n")
    print("=" * 60)
    print("GENERATING BEHAVIOR PROFILES")
    print("=" * 60)

    employees = db.query(Employee).all()

    created = 0

    for employee in employees:

        # Skip if profile already exists
        if db.query(BehaviorProfile).filter(
            BehaviorProfile.employee_id == employee.id
        ).first():
            continue

        activities = db.query(ActivityLog).filter(
            ActivityLog.employee_id == employee.id
        ).all()

        if not activities:
            continue

        login_hours = []
        browser_count = {}
        device_count = {}
        os_count = {}

        total_anomaly = 0

        unique_days = set()

        for activity in activities:

            if activity.timestamp:
                login_hours.append(activity.timestamp.hour)
                unique_days.add(activity.timestamp.date())

            if activity.browser:
                browser_count[activity.browser] = (
                    browser_count.get(activity.browser, 0) + 1
                )

            if activity.device_name:
                device_count[activity.device_name] = (
                    device_count.get(activity.device_name, 0) + 1
                )

            if activity.operating_system:
                os_count[activity.operating_system] = (
                    os_count.get(activity.operating_system, 0) + 1
                )

            total_anomaly += activity.anomaly_score or 0

        avg_login_hour = (
            round(sum(login_hours) / len(login_hours), 2)
            if login_hours else 9.0
        )

        preferred_browser = (
            max(browser_count, key=browser_count.get)
            if browser_count else "Chrome"
        )

        preferred_device = (
            max(device_count, key=device_count.get)
            if device_count else "Office-PC"
        )

        preferred_os = (
            max(os_count, key=os_count.get)
            if os_count else "Windows 11"
        )

        avg_daily = (
            round(len(activities) / len(unique_days), 2)
            if unique_days else len(activities)
        )

        avg_anomaly = total_anomaly / len(activities)

        profile_score = round(
            max(
                0,
                min(
                    100,
                    (1 - avg_anomaly) * 100
                )
            ),
            2
        )

        profile = BehaviorProfile(

            employee_id=employee.id,

            avg_login_hour=avg_login_hour,

            preferred_device=preferred_device,

            preferred_browser=preferred_browser,

            preferred_operating_system=preferred_os,

            avg_daily_activities=avg_daily,

            profile_score=profile_score

        )

        db.add(profile)

        created += 1

        if created % 50 == 0:

            db.commit()

            print(f"{created} Profiles Generated")

    db.commit()

    print("\n")
    print("=" * 60)
    print(f"TOTAL BEHAVIOR PROFILES : {created}")
    print("=" * 60)
   # ==========================================================
# RISK ASSESSMENT GENERATION (OPTIMIZED)
# ==========================================================

def generate_risk_assessments():

    print("\n")
    print("=" * 60)
    print("GENERATING RISK ASSESSMENTS")
    print("=" * 60)

    employees = db.query(Employee).all()

    created = 0

    for employee in employees:

        # Skip existing assessment
        if db.query(RiskAssessment).filter(
            RiskAssessment.employee_id == employee.id
        ).first():
            continue

        activities = db.query(ActivityLog).filter(
            ActivityLog.employee_id == employee.id
        ).all()

        if not activities:
            continue

        total = len(activities)

        avg_anomaly = (
            sum(a.anomaly_score or 0 for a in activities)
            / total
        )

        high_events = sum(
            1
            for a in activities
            if a.severity in (
                Severity.HIGH,
                Severity.CRITICAL
            )
        )

        medium_events = sum(
            1
            for a in activities
            if a.severity == Severity.MEDIUM
        )

        after_hours = sum(
            1
            for a in activities
            if a.is_after_hours
        )

        weekend = sum(
            1
            for a in activities
            if a.is_weekend
        )

        vpn_usage = sum(
            1
            for a in activities
            if a.vpn_used
        )

        # -----------------------------
        # Weighted Risk Score
        # -----------------------------

        score = (

            avg_anomaly * 45 +

            (high_events / total) * 25 +

            (medium_events / total) * 10 +

            (after_hours / total) * 10 +

            (weekend / total) * 5 +

            (vpn_usage / total) * 5

        )

        score = round(min(score * 100, 100), 2)

        # -----------------------------
        # Risk Level
        # -----------------------------

        if score >= 85:

            level = RiskLevel.CRITICAL

        elif score >= 65:

            level = RiskLevel.HIGH

        elif score >= 35:

            level = RiskLevel.MEDIUM

        else:

            level = RiskLevel.LOW

        anomaly_detected = (
            level in (
                RiskLevel.HIGH,
                RiskLevel.CRITICAL
            )
        )

        # -----------------------------
        # Recommendation
        # -----------------------------

        if level == RiskLevel.CRITICAL:

            recommendation = (
                "Immediately suspend access and initiate a security investigation."
            )

        elif level == RiskLevel.HIGH:

            recommendation = (
                "Conduct detailed behavioral analysis and monitor continuously."
            )

        elif level == RiskLevel.MEDIUM:

            recommendation = (
                "Increase monitoring and review recent activities."
            )

        else:

            recommendation = (
                "Normal employee behavior. Continue routine monitoring."
            )

        # -----------------------------
        # Risk Reasons
        # -----------------------------

        reasons = []

        if high_events:
            reasons.append(f"{high_events} high-severity events")

        if medium_events:
            reasons.append(f"{medium_events} medium-severity events")

        if after_hours:
            reasons.append("After-hours activity")

        if weekend:
            reasons.append("Weekend activity")

        if vpn_usage:
            reasons.append("VPN usage")

        if avg_anomaly >= 0.60:
            reasons.append("High anomaly score")

        assessment = RiskAssessment(

            employee_id=employee.id,

            risk_score=score,

            risk_level=level,

            anomaly_detected=anomaly_detected,

            recommendation=recommendation,

            risk_reason=", ".join(reasons),

            confidence_score=round(
                random.uniform(0.85, 0.99),
                2
            ),

            last_analyzed=datetime.utcnow()

        )

        db.add(assessment)

        created += 1

        if created % 50 == 0:

            db.commit()

            print(f"{created} Risk Assessments Generated")

    db.commit()

    print("\n")
    print("=" * 60)
    print(f"TOTAL RISK ASSESSMENTS : {created}")
    print("=" * 60)
   # ==========================================================
# DATABASE SUMMARY
# ==========================================================

def database_summary():

    print("\n")
    print("=" * 70)
    print("DATABASE SUMMARY")
    print("=" * 70)

    summary = {
        "Departments": db.query(Department).count(),
        "Roles": db.query(Role).count(),
        "Employees": db.query(Employee).count(),
        "Activity Logs": db.query(ActivityLog).count(),
        "Behavior Profiles": db.query(BehaviorProfile).count(),
        "Risk Assessments": db.query(RiskAssessment).count(),
    }

    for key, value in summary.items():
        print(f"{key:<22}: {value:,}")

    print("=" * 70)


# ==========================================================
# MAIN
# ==========================================================

def main():

    try:

        print("\n")
        print("=" * 70)
        print("INSIDER THREAT BEHAVIORAL INTELLIGENCE SYSTEM")
        print("DATABASE SEEDER v2")
        print("=" * 70)

        print("\nCreating Database Tables...")
        Base.metadata.create_all(bind=engine)
        print("✓ Tables Ready")

        print("\nStep 1/6 - Departments")
        seed_departments()

        print("\nStep 2/6 - Roles")
        seed_roles()

        print("\nStep 3/6 - Employees")
        seed_employees(limit=300)

        print("\nStep 4/6 - Activity Logs")
        seed_activity_logs()

        print("\nStep 5/6 - Behavior Profiles")
        generate_behavior_profiles()

        print("\nStep 6/6 - Risk Assessments")
        generate_risk_assessments()

        database_summary()

        print("\n")
        print("=" * 70)
        print("DATABASE SEEDED SUCCESSFULLY")
        print("=" * 70)

    except Exception as e:

        db.rollback()

        print("\n")
        print("=" * 70)
        print("DATABASE SEED FAILED")
        print("=" * 70)

        print(f"Error Type : {type(e).__name__}")
        print(f"Error      : {e}")

        raise

    finally:

        db.close()


# ==========================================================
# ENTRY POINT
# ==========================================================

if __name__ == "__main__":
    main()  