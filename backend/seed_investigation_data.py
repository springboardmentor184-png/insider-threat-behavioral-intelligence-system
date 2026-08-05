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
from app.models.role import Role
from app.models.investigation import (
    Investigation,
    InvestigationEvidence,
    InvestigationTimeline,
    InvestigationNote,
    InvestigationAudit,
    CaseStatus,
    CaseSeverity,
    CasePriority,
)
from app.services.investigation_service import InvestigationService
from seed_db import seed_database
from seed_risk_data import seed_risk_assessments
from seed_ueba_data import seed_ueba_analytics


def seed_investigations():
    """
    Populates realistic Threat Investigation Cases with unified timelines,
    harvested evidence, analyst assignments, collaborative notes, and audit trails.
    """
    print("=" * 60)
    print("Starting Threat Investigation Engine Database Seeding...")
    print("=" * 60)

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    # Run preceding seeds
    seed_database()
    seed_risk_assessments()
    seed_ueba_analytics()

    db = SessionLocal()
    try:
        employees = db.query(Employee).filter(Employee.is_active == True).all()
        if not employees:
            print("[!] No active employees found for investigation seeding.")
            return

        # Find SOC analyst for assignment
        sec_role = db.query(Role).filter(Role.role_name.ilike("%Security%")).first()
        analyst = db.query(Employee).filter(Employee.role_id == sec_role.id).first() if sec_role else employees[0]

        print(f"[*] Found {len(employees)} active employees. Creating realistic investigation cases...")

        now = datetime.utcnow()
        sample_cases = [
            {
                "title": "Suspicious Bulk Database Exfiltration & Off-Hours VPN Access",
                "desc": "Marcus Vance exhibited severe data exfiltration indicators after hours from unapproved subnet.",
                "emp": employees[0],
                "severity": "Critical",
                "priority": "P1 - Immediate",
                "status": "Investigating",
                "root_cause": "Unauthorized secondary VPN connection using compromised admin credentials.",
                "resolution": None,
            },
            {
                "title": "Unauthorized USB Device Connection & Mass Download",
                "desc": "David Chen attached unauthorized USB mass storage device following elevated download activity.",
                "emp": employees[1] if len(employees) > 1 else employees[0],
                "severity": "High",
                "priority": "P2 - High",
                "status": "Escalated",
                "root_cause": "Attempted backup of HR employee payroll files to local removable device.",
                "resolution": None,
            },
            {
                "title": "Anomalous Cloud S3 Bucket Export Spikes",
                "desc": "Elena Rostova performed unexpected bulk S3 bucket downloads outside normal business hours.",
                "emp": employees[2] if len(employees) > 2 else employees[0],
                "severity": "Medium",
                "priority": "P3 - Moderate",
                "status": "Assigned",
                "root_cause": None,
                "resolution": None,
            },
            {
                "title": "Repeated Failed Administrative Sudo Attempts",
                "desc": "Sophia Alvarez attempted multiple unauthorized privilege escalation commands.",
                "emp": employees[3] if len(employees) > 3 else employees[0],
                "severity": "Low",
                "priority": "P4 - Routine",
                "status": "Resolved",
                "root_cause": "Accidental syntax error in automated deployment script.",
                "resolution": "Verified deployment script configuration with system administrator. Case closed.",
            },
        ]

        total_seeded = 0
        for sc in sample_cases:
            emp = sc["emp"]
            case_detail = InvestigationService.create_investigation(
                employee_id=emp.id,
                title=sc["title"],
                description=sc["desc"],
                severity=sc["severity"],
                priority=sc["priority"],
                assigned_analyst_id=analyst.id if analyst else None,
                db=db,
            )

            case_id = uuid.UUID(case_detail["id"])

            # Update status if resolved/closed
            if sc["status"] in ["Investigating", "Escalated", "Resolved"]:
                InvestigationService.update_status(
                    case_id=case_id,
                    new_status=sc["status"],
                    root_cause=sc["root_cause"],
                    resolution_summary=sc["resolution"],
                    performed_by=f"{analyst.first_name} {analyst.last_name}" if analyst else "SOC Lead",
                    db=db,
                )

            # Add collaborative notes
            InvestigationService.add_note(
                case_id=case_id,
                author_name=f"{analyst.first_name} {analyst.last_name}" if analyst else "SOC Analyst",
                comment="Initial forensic triage completed. Aggregated telemetry timeline and harvested evidence items.",
                db=db,
            )

            total_seeded += 1

        print(f"[SUCCESS] Successfully seeded {total_seeded} Threat Investigation Cases with unified timelines, evidence items, and analyst notes!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error during investigation seeding: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    seed_investigations()
