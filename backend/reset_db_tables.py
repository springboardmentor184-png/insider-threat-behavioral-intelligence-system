import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database.session import SessionLocal, engine
from app.database.base import Base

# Import all models to ensure complete metadata registration
from app.models.employee import Employee
from app.models.department import Department
from app.models.role import Role
from app.models.activity import ActivityLog
from app.models.behavior_profile import BehaviorProfile
from app.models.risk import RiskAssessment
from app.models.ueba import (
    BehaviorBaseline,
    PeerComparison,
    BehaviorDeviation,
    BehaviorDrift,
    PredictionHistory,
    EntityBaseline,
    EntityRiskAssessment,
)
from app.models.investigation import (
    Investigation,
    InvestigationEvidence,
    InvestigationTimeline,
    InvestigationNote,
    InvestigationAudit,
)
from app.models.incident import (
    Alert,
    Incident,
    SOARPlaybook,
    PlaybookExecutionLog,
)

from seed_db import seed_database
from seed_risk_data import seed_risk_assessments
from seed_ueba_data import seed_ueba_analytics
from seed_investigation_data import seed_investigations
from seed_incident_data import seed_incident_soar_data
from fix_user_roles import fix_roles


def reset_and_seed_all():
    print("=" * 70)
    print("RECREATING DATABASE TABLES WITH UPDATED SCHEMAS & SEEDING...")
    print("=" * 70)

    # 1. Drop existing tables and recreate cleanly
    print("[*] 1. Dropping old tables to align SQLite columns...")
    Base.metadata.drop_all(bind=engine)

    print("[*] 2. Recreating all database tables...")
    Base.metadata.create_all(bind=engine)

    # 2. Run seeds
    print("[*] 3. Seeding Roles, Departments, Admin Account, Employees...")
    seed_database()

    print("[*] 4. Seeding AI Risk Assessments...")
    seed_risk_assessments()

    print("[*] 5. Seeding UEBA User & Entity Analytics...")
    seed_ueba_analytics()

    print("[*] 6. Seeding Threat Investigation Cases...")
    seed_investigations()

    print("[*] 7. Seeding Alerts, Incidents & SOAR Playbooks...")
    seed_incident_soar_data()

    print("[*] 8. Assigning Administrator privileges to all accounts...")
    fix_roles()

    print("=" * 70)
    print("[SUCCESS] DATABASE FULLY RESET, RECREATED, AND SEEDED CLEANLY!")
    print("=" * 70)


if __name__ == "__main__":
    reset_and_seed_all()
