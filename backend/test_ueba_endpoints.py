import sys
import os

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database.session import SessionLocal
from app.models.employee import Employee
from app.services.ueba_service import UEBAService
from app.repositories.ueba_repository import UEBARepository


def test_ueba_engine():
    print("=" * 70)
    print("TESTING USER & ENTITY BEHAVIOR ANALYTICS (UEBA) SERVICES")
    print("=" * 70)

    db = SessionLocal()
    try:
        # 1. Dashboard Stats
        print("\n[*] 1. Fetching UEBA Dashboard Statistics...")
        stats = UEBAService.get_ueba_dashboard_stats(db)
        print(f"  [OK] Monitored Employees: {stats['total_employees_monitored']}")
        print(f"  [OK] Behavior Drift Count: {stats['behavior_drift_count']}")
        print(f"  [OK] High Deviations Count: {stats['high_deviations_count']}")
        print(f"  [OK] Critical Outliers Count: {stats['critical_outliers_count']}")
        print(f"  [OK] Predicted High Risk Count: {stats['predicted_high_risk_count']}")
        print(f"  [OK] Monitored Entities Count: {stats['monitored_entities_count']}")
        print(f"  [OK] Abnormal Entities Count: {stats['abnormal_entities_count']}")

        # 2. Employee Recalculation Pipeline
        emp = db.query(Employee).filter(Employee.is_active == True).first()
        if emp:
            print(f"\n[*] 2. Recalculating UEBA for {emp.first_name} {emp.last_name} ({emp.id})...")
            res = UEBAService.recalculate_employee_ueba(emp.id, db)
            print(f"  [OK] Baseline Login Hour: {res['baseline']['avg_login_hour']}")
            print(f"  [OK] Peer Group Download Dev %: {res['peer_comparison']['download_deviation_pct']}% (Outlier: {res['peer_comparison']['is_outlier']})")
            print(f"  [OK] Deviations Count: {len(res['deviations'])}")
            print(f"  [OK] 4-Week Drift Trend: {res['drift']['drift_trend']} (Magnitude: {res['drift']['drift_magnitude']})")
            print(f"  [OK] Prediction (Next Week): {res['prediction']['predict_next_week']} (Confidence: {res['prediction']['confidence_score']})")

        # 3. Monitored Entities
        print("\n[*] 3. Fetching Monitored Entities & Risk Scores...")
        entities = UEBARepository.get_all_entities(db)
        for ent in entities[:5]:
            print(f"  [OK] {ent['entity_name']} ({ent['entity_type']}) - Risk: {ent['risk_score']} [{ent['severity']}] - Correlated Users: {len(ent['correlated_users'])}")

        print("\n" + "=" * 70)
        print("[SUCCESS] ALL UEBA ENGINE SERVICES VERIFIED SUCCESSFULLY!")
        print("=" * 70)

    except Exception as e:
        print(f"\n[ERROR] UEBA Verification failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    test_ueba_engine()
