from app.database.session import SessionLocal
from app.models.employee import Employee
from app.models.role import Role
from app.models.department import Department
from sqlalchemy.orm import joinedload

db = SessionLocal()

print("=" * 80)
print("CURRENT DATABASE STATE")
print("=" * 80)

print("\nROLES IN DATABASE:")
roles = db.query(Role).all()
for role in roles:
    print(f"  • {role.role_name} (ID: {str(role.id)[:8]}...)")

print("\nDEPARTMENTS IN DATABASE:")
depts = db.query(Department).all()
for dept in depts:
    print(f"  • {dept.department_name} (ID: {str(dept.id)[:8]}..., Code: {dept.department_code})")

print("\nEXISTING EMPLOYEES:")
employees = db.query(Employee).options(joinedload(Employee.role), joinedload(Employee.department)).all()
for emp in employees:
    role_name = emp.role.role_name if emp.role else "NO ROLE (NULL)"
    dept_name = emp.department.department_name if emp.department else "NO DEPT (NULL)"
    print(f"  • {emp.first_name} {emp.last_name} (ID: {emp.employee_id})")
    print(f"    Email: {emp.email}")
    print(f"    Role: {role_name} (role_id: {emp.role_id})")
    print(f"    Dept: {dept_name} (dept_id: {emp.department_id})")

db.close()
