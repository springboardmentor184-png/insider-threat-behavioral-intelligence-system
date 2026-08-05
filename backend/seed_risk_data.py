import sys
import os
import uuid
import random
from datetime import datetime, timedelta

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database.session import SessionLocal, engine
from app.database.base import Base
from app.models.employee import Employee
from app.models.department import Department
from app.models.role import Role
from app.models.activity import ActivityLog, ActivityType, Severity
from app.models.behavior_profile import BehaviorProfile
from app.models.risk import RiskAssessment, RiskLevel
from app.core.security import get_password_hash
from app.services.risk_service import RiskScoringService
from seed_db import seed_database


def seed_risk_assessments():
    """
    Populates historical Risk Assessments for all employees in the database.
    Ensures active employees with varied activity patterns exist, then calculates
    deterministic current scores and creates realistic chronological trend points.
    """
    print("=" * 60)
    print("Starting AI Risk Engine Database Seeding...")
    print("=" * 60)

    # 1. Ensure tables exist
    Base.metadata.create_all(bind=engine)

    # 2. Run baseline seed
    seed_database()

    db = SessionLocal()
    try:
        # Check active employees
        employees = db.query(Employee).filter(Employee.is_active == True).all()

        # If only admin exists, seed sample enterprise employees with realistic activity profiles
        if len(employees) <= 1:
            print("[*] Seeding enterprise sample employees with realistic activity patterns...")
            depts = {d.department_code: d.id for d in db.query(Department).all()}
            roles = {r.role_name: r.id for r in db.query(Role).all()}
            default_role = list(roles.values())[0] if roles else None
            default_dept = list(depts.values())[0] if depts else None

            sample_emps = [
                {
                    "code": "EMP101",
                    "first": "Marcus",
                    "last": "Vance",
                    "email": "marcus.vance@insidershield.com",
                    "title": "Lead DevOps Engineer",
                    "dept": depts.get("engineering", default_dept),
                    "role": roles.get("Standard Employee", default_role),
                    "high_risk": True,
                },
                {
                    "code": "EMP102",
                    "first": "Elena",
                    "last": "Rostova",
                    "email": "elena.rostova@insidershield.com",
                    "title": "Senior SOC Analyst",
                    "dept": depts.get("security", default_dept),
                    "role": roles.get("Security Analyst", default_role),
                    "high_risk": False,
                },
                {
                    "code": "EMP103",
                    "first": "David",
                    "last": "Chen",
                    "email": "david.chen@insidershield.com",
                    "title": "HR Administrator",
                    "dept": depts.get("hr", default_dept),
                    "role": roles.get("Standard Employee", default_role),
                    "high_risk": True,
                },
                {
                    "code": "EMP104",
                    "first": "Sophia",
                    "last": "Alvarez",
                    "email": "sophia.alvarez@insidershield.com",
                    "title": "System Administrator",
                    "dept": depts.get("it", default_dept),
                    "role": roles.get("Administrator", default_role),
                    "high_risk": False,
                },
                {
                    "code": "EMP105",
                    "first": "James",
                    "last": "Wilson",
                    "email": "james.wilson@insidershield.com",
                    "title": "Product Manager",
                    "dept": depts.get("management", default_dept),
                    "role": roles.get("Manager", default_role),
                    "high_risk": False,
                },
            ]

            now = datetime.utcnow()

            for se in sample_emps:
                emp_id = uuid.uuid4()
                emp = Employee(
                    id=emp_id,
                    employee_id=se["code"],
                    first_name=se["first"],
                    last_name=se["last"],
                    email=se["email"],
                    password_hash=get_password_hash("Employee@123"),
                    department_id=se["dept"],
                    role_id=se["role"],
                    job_title=se["title"],
                    is_active=True,
                    failed_login_attempts=4 if se["high_risk"] else 0,
                    date_joined=now - timedelta(days=120),
                    last_login=now - timedelta(hours=2),
                )
                db.add(emp)

                # Create baseline behavior profile
                profile = BehaviorProfile(
                    id=uuid.uuid4(),
                    employee_id=emp_id,
                    avg_login_hour=9.0,
                    preferred_device="Windows-Workstation-01",
                    preferred_browser="Chrome 120.0",
                    preferred_operating_system="Windows 11",
                    avg_daily_activities=45,
                    profile_score=75.0 if se["high_risk"] else 15.0,
                )
                db.add(profile)

                # Create activity logs (anomalies for high risk)
                for i in range(15):
                    act_time = now - timedelta(days=random.randint(0, 10), hours=random.randint(0, 23))
                    is_exfil = se["high_risk"] and (i % 3 == 0)
                    act = ActivityLog(
                        id=uuid.uuid4(),
                        employee_id=emp_id,
                        activity_type=ActivityType.FILE_DOWNLOAD if is_exfil else ActivityType.LOGIN,
                        severity=Severity.HIGH if is_exfil else Severity.LOW,
                        description="Bulk Sensitive Customer Data Export" if is_exfil else "Normal System Login",
                        ip_address="192.168.1.105" if not is_exfil else "198.51.100.42",
                        device_name="Windows-Workstation-01" if not is_exfil else "Unknown-Linux-Terminal",
                        operating_system="Windows 11" if not is_exfil else "Linux",
                        download_size=500000000 if is_exfil else 0,
                        is_after_hours=(act_time.hour < 7 or act_time.hour > 19),
                        timestamp=act_time,
                    )
                    db.add(act)

            db.commit()
            employees = db.query(Employee).filter(Employee.is_active == True).all()

        print(f"[*] Found {len(employees)} active employees. Calculating deterministic risk assessments...")

        total_seeded = 0
        now = datetime.utcnow()

        for emp in employees:
            current_risk = RiskScoringService.calculate_risk(emp.id, db)
            base_score = current_risk["risk_score"]

            timestamps = [
                now - timedelta(days=28),
                now - timedelta(days=21),
                now - timedelta(days=14),
                now - timedelta(days=7),
                now - timedelta(days=1),
                now,
            ]

            for idx, ts in enumerate(timestamps):
                delta = (idx - 3) * 1.5
                hist_score = round(min(100.0, max(5.0, base_score + delta)), 1)

                if hist_score >= 76.0:
                    hist_level = RiskLevel.CRITICAL
                elif hist_score >= 51.0:
                    hist_level = RiskLevel.HIGH
                elif hist_score >= 26.0:
                    hist_level = RiskLevel.MEDIUM
                else:
                    hist_level = RiskLevel.LOW

                trend = "UP" if delta > 1.0 else ("DOWN" if delta < -1.0 else "STABLE")

                assessment = RiskAssessment(
                    id=uuid.uuid4(),
                    employee_id=emp.id,
                    risk_score=hist_score,
                    risk_level=hist_level,
                    anomaly_score=round(current_risk["anomaly_score"] * (0.8 + (idx * 0.04)), 1),
                    privilege_score=round(current_risk["privilege_score"] * (0.85 + (idx * 0.03)), 1),
                    data_access_score=round(current_risk["data_access_score"] * (0.8 + (idx * 0.04)), 1),
                    access_pattern_score=round(current_risk["access_pattern_score"], 1),
                    history_score=round(current_risk["history_score"], 1),
                    confidence_score=current_risk["confidence_score"],
                    reasons=current_risk["reasons"],
                    triggering_events=current_risk["triggering_events"],
                    recommendation=current_risk["recommendation"],
                    risk_trend=trend,
                    anomaly_detected=(hist_score > 30.0),
                    created_at=ts,
                    updated_at=ts,
                )
                db.add(assessment)
                total_seeded += 1

        db.commit()
        print(f"[SUCCESS] Successfully seeded {total_seeded} historical risk assessment records for {len(employees)} employees!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error during risk assessment seeding: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    seed_risk_assessments()
