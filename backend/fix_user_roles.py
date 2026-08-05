import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database.session import SessionLocal
from app.models.employee import Employee
from app.models.role import Role

def fix_roles():
    db = SessionLocal()
    try:
        admin_role = db.query(Role).filter(Role.role_name == "Administrator").first()
        if not admin_role:
            print("Administrator role not found!")
            return
            
        employees = db.query(Employee).all()
        updated = 0
        for emp in employees:
            if not emp.role_id or emp.role_id != admin_role.id:
                emp.role_id = admin_role.id
                updated += 1
        db.commit()
        print(f"Updated {updated} employees to Administrator role!")
    finally:
        db.close()

if __name__ == "__main__":
    fix_roles()
