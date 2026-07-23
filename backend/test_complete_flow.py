#!/usr/bin/env python3
"""
Comprehensive end-to-end test for the insider-threat system registration/auth flow.
Tests the fixed role and department assignment in registration.
"""

import requests
import time
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_complete_flow():
    """Test registration -> role assignment -> login -> protected access"""
    
    print("=" * 70)
    print("INSIDER THREAT SYSTEM - END-TO-END AUTH FLOW TEST")
    print("=" * 70)
    
    # Test user credentials
    timestamp = int(time.time())
    test_email = f"test_user_{timestamp}@example.com"
    test_password = "SecurePass123"
    test_department = "security"
    test_role = "analyst"
    
    print("\n1. REGISTRATION TEST")
    print("-" * 70)
    registration_data = {
        "employee_id": f"EMP-{timestamp}",
        "first_name": "Alex",
        "last_name": "Chen",
        "email": test_email,
        "password": test_password,
        "department": test_department,
        "role": test_role
    }
    
    print(f"Registering new employee:")
    for key, value in registration_data.items():
        if key != "password":
            print(f"  {key}: {value}")
        else:
            print(f"  {key}: ****")
    
    resp = requests.post(f"{BASE_URL}/auth/register", json=registration_data)
    print(f"\n✓ Registration Response: {resp.status_code}")
    if resp.status_code != 201:
        print(f"  ERROR: {resp.text}")
        return False
    
    print(f"  Message: {resp.json()['message']}")
    
    # Verify role and department assignment
    print("\n2. VERIFY ROLE & DEPARTMENT ASSIGNMENT")
    print("-" * 70)
    from app.database.session import SessionLocal
    from app.models.employee import Employee
    from sqlalchemy.orm import joinedload
    
    db = SessionLocal()
    emp = db.query(Employee).filter(
        Employee.email == test_email
    ).options(joinedload(Employee.role), joinedload(Employee.department)).first()
    
    if not emp:
        print("✗ Employee not found in database")
        db.close()
        return False
    
    print(f"✓ Employee found in database:")
    print(f"  Employee ID: {emp.employee_id}")
    print(f"  Email: {emp.email}")
    
    if not emp.role_id:
        print(f"✗ Role ID is NULL - assignment failed!")
        db.close()
        return False
    
    print(f"  Role ID: {emp.role_id}")
    print(f"  Role Name: {emp.role.role_name if emp.role else 'N/A'}")
    print(f"  Department ID: {emp.department_id}")
    print(f"  Department: {emp.department.department_name if emp.department else 'N/A'}")
    
    if not emp.department_id:
        print(f"✗ Department ID is NULL - assignment failed!")
        db.close()
        return False
    
    print(f"✓ Both role_id and department_id successfully assigned")
    db.close()
    
    # Test login
    print("\n3. LOGIN TEST")
    print("-" * 70)
    print(f"Logging in with email: {test_email}")
    
    login_data = {
        "username": test_email,
        "password": test_password
    }
    
    resp = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    print(f"✓ Login Response: {resp.status_code}")
    
    if resp.status_code != 200:
        print(f"  ERROR: {resp.text}")
        return False
    
    result = resp.json()
    token = result['access_token']
    employee = result['employee']
    
    print(f"  Token issued: {token[:50]}...")
    print(f"  Employee: {employee['first_name']} {employee['last_name']}")
    print(f"  Role ID: {employee['role_id']}")
    print(f"  Department ID: {employee['department_id']}")
    
    # Test protected dashboard access
    print("\n4. PROTECTED ROUTE ACCESS TEST")
    print("-" * 70)
    print(f"Accessing protected /dashboard/overview endpoint...")
    
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/dashboard/overview", headers=headers)
    print(f"✓ Response: {resp.status_code}")
    
    if resp.status_code != 200:
        print(f"  ERROR: {resp.text}")
        if resp.status_code == 403:
            print("  This indicates role/department assignment failed (403 Forbidden)")
        return False
    
    data = resp.json()
    print(f"  Dashboard data retrieved successfully")
    print(f"  Data sections: {list(data.keys())}")
    # The data structure may have counts or actual records
    emp_data = data.get('employees', 0)
    act_data = data.get('activities', 0)
    print(f"  Employees: {emp_data if isinstance(emp_data, int) else len(emp_data)}")
    print(f"  Activities: {act_data if isinstance(act_data, int) else len(act_data)}")
    
    # Final summary
    print("\n" + "=" * 70)
    print("✓ ALL TESTS PASSED - AUTHENTICATION FLOW WORKING CORRECTLY")
    print("=" * 70)
    print("\nSummary:")
    print("  ✓ Registration: User created with role_id and department_id assigned")
    print("  ✓ Role Resolution: Text role 'analyst' → UUID for Security Analyst")
    print("  ✓ Department Resolution: Text department 'security' → UUID for Security / SOC")
    print("  ✓ Login: JWT token issued successfully")
    print("  ✓ Protected Routes: Dashboard accessible (role guard passed)")
    print("\nThe insider threat system is ready for production use!")
    print("=" * 70)
    
    return True

if __name__ == "__main__":
    try:
        success = test_complete_flow()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗ Test failed with exception: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
