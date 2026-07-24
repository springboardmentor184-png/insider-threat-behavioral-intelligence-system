# backend/seed_roles.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models import models

def seed_roles():
    db = SessionLocal()
    try:
        roles = ["Admin", "SOC Engineer", "Security Manager", "Analyst"]
        for role_name in roles:
            existing = db.query(models.Role).filter(models.Role.role_name == role_name).first()
            if not existing:
                new_role = models.Role(role_name=role_name, description=f"{role_name} role")
                db.add(new_role)
                print(f"✅ Added role: {role_name}")
            else:
                print(f"⏩ Role already exists: {role_name}")
        db.commit()
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_roles()