import random
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.database import SessionLocal
from app.models import EmployeeProfile

def patch():
    print("=== STARTING POSTGRESQL EMPLOYEE DEPARTMENTS PATCH ===")
    session = SessionLocal()
    try:
        # Fetch all profiles with Unassigned department
        unassigned_profiles = session.query(EmployeeProfile).filter(EmployeeProfile.department == "Unassigned").all()
        print(f"Found {len(unassigned_profiles)} profiles with 'Unassigned' department.")
        
        if not unassigned_profiles:
            print("No profiles require patching.")
            return

        depts = ["Engineering", "Finance", "Operations", "Research & Development", "Human Resources", "Sales & Marketing"]
        
        for profile in unassigned_profiles:
            # Assign a random valid department
            profile.department = random.choice(depts)
            
        session.commit()
        print(f"[OK] Successfully patched and assigned departments to {len(unassigned_profiles)} employee profiles!")
    except Exception as e:
        session.rollback()
        print(f"[FAIL] Error patching database: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    patch()
