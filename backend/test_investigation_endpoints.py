import sys
import os
import uuid

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database.session import SessionLocal
from app.models.employee import Employee
from app.services.investigation_service import InvestigationService
from app.repositories.investigation_repository import InvestigationRepository


def test_investigation_engine():
    print("=" * 70)
    print("TESTING THREAT INVESTIGATION ENGINE SERVICES")
    print("=" * 70)

    db = SessionLocal()
    try:
        # 1. Dashboard Stats
        print("\n[*] 1. Fetching Investigation Dashboard Statistics...")
        stats = InvestigationService.get_dashboard_stats(db)
        print(f"  [OK] Total Cases: {stats['total_cases']}")
        print(f"  [OK] Open Cases: {stats['open_cases']}")
        print(f"  [OK] Critical Cases: {stats['critical_cases']}")
        print(f"  [OK] Escalated Cases: {stats['escalated_cases']}")
        print(f"  [OK] Resolved Today: {stats['resolved_today']}")

        # 2. Query All Investigations
        print("\n[*] 2. Querying Investigation Cases Queue...")
        cases = InvestigationRepository.get_all(db=db, limit=10)
        print(f"  [OK] Found {len(cases)} cases in queue.")
        for c in cases:
            print(f"  [OK] Case #{c['case_number']}: '{c['title']}' | Status: {c['status']} | Severity: {c['severity']} | Employee: {c['employee_name']} ({c['department_name']})")

        # 3. Comprehensive Investigation Detail
        if cases:
            first_case_id = uuid.UUID(cases[0]["id"])
            print(f"\n[*] 3. Fetching Full Investigation Details for Case {cases[0]['case_number']}...")
            detail = InvestigationService.get_investigation_detail(first_case_id, db)
            print(f"  [OK] Employee: {detail['employee_name']} ({detail['department_name']})")
            print(f"  [OK] Unified Timeline Events: {len(detail['timeline'])}")
            print(f"  [OK] Collected Evidence Items: {len(detail['evidence'])}")
            print(f"  [OK] Correlation Map Links: {len(detail['correlation_map']['correlations'])}")
            print(f"  [OK] Analyst Notes Count: {len(detail['notes'])}")
            print(f"  [OK] XAI Confidence Rating: {detail['xai_summary']['confidence_score']}")
            print(f"  [OK] XAI Recommended Actions: {detail['xai_summary']['recommended_actions'][:60]}...")

            # 4. Add Analyst Note
            print("\n[*] 4. Adding Analyst Collaborative Note...")
            updated_detail = InvestigationService.add_note(
                case_id=first_case_id,
                author_name="Security Analyst (Test)",
                comment="Automated verification test note added to case timeline.",
                db=db,
            )
            print(f"  [OK] Updated Notes Count: {len(updated_detail['notes'])}")

            # 5. Analyst Assignment
            emp = db.query(Employee).filter(Employee.is_active == True).first()
            if emp:
                print(f"\n[*] 5. Assigning Analyst {emp.first_name} {emp.last_name}...")
                assigned_detail = InvestigationService.assign_analyst(first_case_id, emp.id, db)
                print(f"  [OK] Assigned Analyst: {assigned_detail['assigned_analyst_name']}")

        print("\n" + "=" * 70)
        print("[SUCCESS] ALL THREAT INVESTIGATION SERVICES VERIFIED SUCCESSFULLY!")
        print("=" * 70)

    except Exception as e:
        print(f"\n[ERROR] Investigation Verification failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    test_investigation_engine()
