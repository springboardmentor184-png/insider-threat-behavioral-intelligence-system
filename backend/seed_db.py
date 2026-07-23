#!/usr/bin/env python3
"""
Database Seeding and Migration Script
Initializes roles, departments, and ensures at least one admin account exists.
Fixes existing users with NULL role_id by assigning Administrator role.
"""

import uuid
from app.database.session import SessionLocal, engine
from app.database.base import Base
from app.models.role import Role
from app.models.department import Department
from app.models.employee import Employee
from sqlalchemy.orm import joinedload

def seed_database():
    """Main seeding function"""
    db = SessionLocal()
    
    try:
        print("=" * 80)
        print("DATABASE SEED & MIGRATION SCRIPT")
        print("=" * 80)
        
        # ======================================================================
        # STEP 1: Ensure all roles exist
        # ======================================================================
        print("\n[1/5] Seeding Roles...")
        roles_config = [
            {"name": "Administrator", "desc": "System administrator with full access"},
            {"name": "Security Analyst", "desc": "Security analyst for threat detection"},
            {"name": "Manager", "desc": "Business manager and team lead"},
            {"name": "Standard Employee", "desc": "Standard employee with basic access"},
        ]
        
        roles_created = 0
        roles_map = {}
        
        for role_cfg in roles_config:
            existing = db.query(Role).filter_by(role_name=role_cfg["name"]).first()
            if existing:
                print(f"  ✓ Role '{role_cfg['name']}' already exists")
                roles_map[role_cfg["name"]] = existing
            else:
                new_role = Role(
                    id=uuid.uuid4(),
                    role_name=role_cfg["name"],
                    description=role_cfg["desc"],
                    permissions={}
                )
                db.add(new_role)
                db.commit()
                print(f"  ✓ Created role '{role_cfg['name']}'")
                roles_map[role_cfg["name"]] = new_role
                roles_created += 1
        
        print(f"  Summary: {roles_created} roles created, {len(roles_config) - roles_created} already exist")
        
        # ======================================================================
        # STEP 2: Ensure all departments exist
        # ======================================================================
        print("\n[2/5] Seeding Departments...")
        departments_config = [
            {"name": "Engineering", "code": "engineering", "desc": "Engineering team"},
            {"name": "Security / SOC", "code": "security", "desc": "Security operations center"},
            {"name": "Human Resources", "code": "hr", "desc": "Human resources team"},
            {"name": "IT Administration", "code": "it", "desc": "Information technology administration"},
            {"name": "Management", "code": "management", "desc": "Management and executive leadership"},
        ]
        
        depts_created = 0
        depts_map = {}
        
        for dept_cfg in departments_config:
            existing = db.query(Department).filter_by(department_code=dept_cfg["code"]).first()
            if existing:
                print(f"  ✓ Department '{dept_cfg['name']}' already exists")
                depts_map[dept_cfg["code"]] = existing
            else:
                new_dept = Department(
                    id=uuid.uuid4(),
                    department_name=dept_cfg["name"],
                    department_code=dept_cfg["code"],
                    description=dept_cfg["desc"]
                )
                db.add(new_dept)
                db.commit()
                print(f"  ✓ Created department '{dept_cfg['name']}'")
                depts_map[dept_cfg["code"]] = new_dept
                depts_created += 1
        
        print(f"  Summary: {depts_created} departments created, {len(departments_config) - depts_created} already exist")
        
        # ======================================================================
        # STEP 3: Ensure admin account exists
        # ======================================================================
        print("\n[3/5] Seeding Admin Account...")
        admin_email = "admin@insidershield.com"
        existing_admin = db.query(Employee).filter_by(email=admin_email).first()
        
        if existing_admin:
            print(f"  ✓ Admin account already exists: {existing_admin.email}")
        else:
            from app.core.security import get_password_hash
            admin_employee = Employee(
                id=uuid.uuid4(),
                employee_id="ADMIN001",
                first_name="System",
                last_name="Administrator",
                email=admin_email,
                password_hash=get_password_hash("Admin@123"),
                role_id=roles_map["Administrator"].id,
                department_id=depts_map["it"].id,
                is_active=True,
                created_at=None,
                updated_at=None
            )
            db.add(admin_employee)
            db.commit()
            print(f"  ✓ Created admin account:")
            print(f"    Email: {admin_email}")
            print(f"    Password: Admin@123")
            print(f"    Role: Administrator")
            print(f"    Department: IT Administration")
        
        # ======================================================================
        # STEP 4: Fix existing users with NULL role_id
        # ======================================================================
        print("\n[4/5] Migrating Users with NULL role_id...")
        admin_role = roles_map["Administrator"]
        it_dept = depts_map["it"]
        
        users_without_role = db.query(Employee).filter(
            Employee.role_id == None
        ).all()
        
        users_fixed = 0
        for user in users_without_role:
            user.role_id = admin_role.id
            if user.department_id is None:
                user.department_id = it_dept.id
                action = f"assigned role={admin_role.role_name} & department={it_dept.department_name}"
            else:
                action = f"assigned role={admin_role.role_name}"
            db.add(user)
            db.commit()
            users_fixed += 1
            print(f"  ✓ {user.first_name} {user.last_name} ({user.email}): {action}")
        
        if users_fixed == 0:
            print(f"  ✓ All users already have roles assigned")
        else:
            print(f"  Summary: {users_fixed} users migrated")
        
        # ======================================================================
        # STEP 5: Verify final state
        # ======================================================================
        print("\n[5/5] Verification...")
        
        total_roles = db.query(Role).count()
        total_depts = db.query(Department).count()
        total_users = db.query(Employee).count()
        users_with_role = db.query(Employee).filter(Employee.role_id != None).count()
        users_with_dept = db.query(Employee).filter(Employee.department_id != None).count()
        admin_count = db.query(Employee).filter(Employee.role_id == admin_role.id).count()
        
        print(f"  • Total Roles: {total_roles} (expected: 4) ✓" if total_roles == 4 else f"  • Total Roles: {total_roles} (expected: 4) ✗")
        print(f"  • Total Departments: {total_depts} (expected: 5) ✓" if total_depts == 5 else f"  • Total Departments: {total_depts} (expected: 5) ✗")
        print(f"  • Total Employees: {total_users}")
        print(f"  • Users with role_id: {users_with_role}/{total_users} ✓" if users_with_role == total_users else f"  • Users with role_id: {users_with_role}/{total_users} ✗")
        print(f"  • Users with department_id: {users_with_dept}/{total_users} ✓" if users_with_dept == total_users else f"  • Users with department_id: {users_with_dept}/{total_users} ✗")
        print(f"  • Administrator accounts: {admin_count}")
        
        print("\n" + "=" * 80)
        print("✓ DATABASE SEEDING COMPLETE")
        print("=" * 80 + "\n")
        
    except Exception as e:
        print(f"\n✗ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
