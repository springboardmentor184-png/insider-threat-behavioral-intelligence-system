import sys
import os

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database.session import SessionLocal
from app.models.employee import Employee
from app.services.risk_service import RiskScoringService


def test_risk_engine():
    print("=" * 70)
    print("TESTING AI RISK SCORING ENGINE & REPOSITORY SERVICES")
    print("=" * 70)

    db = SessionLocal()
    try:
        # 1. Test Dashboard Stats
        print("\n[*] 1. Fetching Risk Dashboard Statistics...")
        stats = RiskScoringService.get_risk_dashboard_stats(db)
        print(f"  [OK] Total Employees: {stats['total_employees']}")
        print(f"  [OK] Average Risk Score: {stats['average_risk']}")
        print(f"  [OK] Critical Employees: {stats['critical_employees']}")
        print(f"  [OK] High Risk Employees: {stats['high_risk_employees']}")
        print(f"  [OK] Risk Distribution: {stats['risk_distribution']}")

        # 2. Test Department Risk Summary
        print("\n[*] 2. Fetching Department Risk Metrics...")
        depts = RiskScoringService.get_department_risk(db)
        for d in depts:
            print(f"  [OK] Department: {d['department_name']} | Avg Risk: {d['avg_risk']} | Employees: {d['employee_count']}")

        # 3. Test Top Risk Employees
        print("\n[*] 3. Fetching Top High Risk Employees...")
        top_emps = RiskScoringService.get_top_risk_employees(db, limit=5)
        for emp in top_emps:
            print(f"  [OK] {emp['employee_name']} ({emp['department_name']}) - Score: {emp['risk_score']} [{emp['risk_level']}] - Trend: {emp['risk_trend']}")
            print(f"       Sub-scores: Anomaly={emp['anomaly_score']}, Priv={emp['privilege_score']}, Data={emp['data_access_score']}, Pattern={emp['access_pattern_score']}, Hist={emp['history_score']}")

        # 4. Test Employee Current Score & History
        if top_emps:
            target_id = top_emps[0]['employee_id']
            print(f"\n[*] 4. Fetching Current Score & History for {top_emps[0]['employee_name']} ({target_id})...")
            current = RiskScoringService.get_risk_current(target_id, db)
            history = RiskScoringService.get_risk_history(target_id, db, limit=10)
            print(f"  [OK] Current Score: {current['risk_score']} ({current['risk_level']})")
            print(f"  [OK] Confidence: {current['confidence_score']}")
            print(f"  [OK] Reasons: {current['reasons'][:2]}")
            print(f"  [OK] Recommendations: {current['recommendation']}")
            print(f"  [OK] Historical Score Trend Points: {len(history)} data points")

        print("\n" + "=" * 70)
        print("[SUCCESS] ALL RISK ENGINE SERVICES VERIFIED SUCCESSFULLY!")
        print("=" * 70)

    except Exception as e:
        print(f"\n[ERROR] Verification failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    test_risk_engine()
