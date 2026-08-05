import sys
import os
import uuid
from datetime import datetime, timedelta

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database.session import SessionLocal, engine
from app.database.base import Base
from app.models.employee import Employee
from app.models.ueba import (
    BehaviorBaseline,
    PeerComparison,
    BehaviorDeviation,
    BehaviorDrift,
    PredictionHistory,
    EntityBaseline,
    EntityRiskAssessment,
)
from app.services.ueba_service import UEBAService
from seed_db import seed_database
from seed_risk_data import seed_risk_assessments


def seed_ueba_analytics():
    """
    Populates initial User and Entity Behavior Analytics (UEBA) data across all active employees.
    Calculates baselines, peer group ratios, deviations, 4-week drift trends, predictions, and entity risk telemetry.
    """
    print("=" * 60)
    print("Starting UEBA Engine Database Seeding...")
    print("=" * 60)

    # 1. Ensure tables exist
    Base.metadata.create_all(bind=engine)

    # 2. Run base seeds
    seed_database()
    seed_risk_assessments()

    db = SessionLocal()
    try:
        employees = db.query(Employee).filter(Employee.is_active == True).all()
        if not employees:
            print("[!] No active employees found for UEBA seeding.")
            return

        print(f"[*] Found {len(employees)} active employees. Running UEBA calculation pipelines...")

        total_users = 0
        for emp in employees:
            UEBAService.recalculate_employee_ueba(emp.id, db)
            total_users += 1

        print(f"[SUCCESS] Recalculated UEBA baselines, peer group ratios, deviations, drift, and predictions for {total_users} employees!")

        # 3. Seed Entity Telemetry & Analytics
        print("[*] Seeding Entity Behavior Analytics for Devices, Servers, VPNs, USBs, and Cloud Services...")
        entities = UEBAService.seed_entity_analytics(db)
        print(f"[SUCCESS] Seeded {len(entities)} entity risk assessment records!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error during UEBA seeding: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    seed_ueba_analytics()
