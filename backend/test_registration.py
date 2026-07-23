import json
import requests
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"
test_data = {
    "employee_id": "TEST-REG-" + str(int(time.time())),
    "first_name": "John",
    "last_name": "Doe",
    "email": f"john{int(time.time())}@example.com",
    "password": "TestPass123",
    "department": "engineering",
    "role": "analyst"
}

print("Registering:", test_data)
resp = requests.post(f"{BASE_URL}/auth/register", json=test_data)
print(f"Registration: {resp.status_code}")
print(resp.text)

# Now query the employee to check role assignment
from app.database.session import SessionLocal
from app.models.employee import Employee
from sqlalchemy.orm import joinedload
db = SessionLocal()
emp = db.query(Employee).filter(Employee.email == test_data['email']).options(joinedload(Employee.role), joinedload(Employee.department)).first()
if emp:
    print(f"\nEmployee created:")
    print(f"  Email: {emp.email}")
    print(f"  Employee ID: {emp.employee_id}")
    print(f"  Role ID: {emp.role_id}")
    print(f"  Role Name: {emp.role.role_name if emp.role else None}")
    print(f"  Department: {emp.department.department_name if emp.department else None}")
else:
    print("Employee not found!")
db.close()
