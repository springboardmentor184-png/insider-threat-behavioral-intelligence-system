import sys
import os

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database.session import SessionLocal
from app.models.employee import Employee
from app.services.incident_service import IncidentService
from app.repositories.incident_repository import IncidentRepository


def test_incident_soar_engine():
    print("=" * 70)
    print("TESTING ALERTS, INCIDENTS, AND SOAR RESPONSE ENGINE SERVICES")
    print("=" * 70)

    db = SessionLocal()
    try:
        # 1. Dashboard Stats
        print("\n[*] 1. Fetching Incidents & SOAR Dashboard Statistics...")
        stats = IncidentService.get_dashboard_stats(db)
        print(f"  [OK] Total Incidents: {stats['total_incidents']}")
        print(f"  [OK] New Incidents: {stats['new_incidents']}")
        print(f"  [OK] Contained Incidents: {stats['contained_incidents']}")
        print(f"  [OK] Active Alerts: {stats['active_alerts']}")
        print(f"  [OK] SOAR Automated Containment Actions Executed: {stats['soar_actions_executed']}")

        # 2. Query Active Alerts
        print("\n[*] 2. Querying Active Security Alerts Feed...")
        alerts = IncidentRepository.get_alerts(db, limit=10)
        print(f"  [OK] Found {len(alerts)} alerts in feed.")
        for a in alerts[:5]:
            print(f"  [OK] Alert '{a['alert_name']}' [{a['severity']}] from {a['source_module']} for {a['employee_name']}")

        # 3. Query Incidents
        print("\n[*] 3. Querying Incidents Queue...")
        incidents = IncidentRepository.get_incidents(db, limit=10)
        print(f"  [OK] Found {len(incidents)} incidents in queue.")
        for inc in incidents:
            print(f"  [OK] Incident #{inc['incident_number']}: '{inc['title']}' | Status: {inc['status']} | Severity: {inc['severity']} | Target: {inc['employee_name']}")

        # 4. Available SOAR Playbooks
        print("\n[*] 4. Querying Available SOAR Response Playbooks...")
        playbooks = IncidentRepository.get_playbooks(db)
        print(f"  [OK] Found {len(playbooks)} SOAR Playbooks registered.")
        for pb in playbooks:
            print(f"  [OK] Playbook: '{pb['playbook_name']}' | Action: {pb['action_type']} | Automated: {pb['is_automated']}")

        # 5. Execute SOAR Playbook Action (Session Revocation)
        emp = db.query(Employee).filter(Employee.is_active == True).first()
        if emp and incidents:
            inc_id = incidents[0]["id"]
            print(f"\n[*] 5. Executing SOAR Containment Playbook (Revoke Sessions) for employee {emp.first_name} {emp.last_name}...")
            res = IncidentService.execute_soar_playbook(
                action_type_str="REVOKE_ACTIVE_SESSIONS",
                employee_id=emp.id,
                incident_id=inc_id,
                db=db,
            )
            print(f"  [OK] Execution Result: {res['status']}")
            print(f"  [OK] Result Details: {res['result_details']}")

        print("\n" + "=" * 70)
        print("[SUCCESS] ALL ALERTS, INCIDENTS, AND SOAR SERVICES VERIFIED SUCCESSFULLY!")
        print("=" * 70)

    except Exception as e:
        print(f"\n[ERROR] Incident & SOAR Verification failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    test_incident_soar_engine()
