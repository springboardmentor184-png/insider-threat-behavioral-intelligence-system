#!/usr/bin/env python3
"""
COMPREHENSIVE SEEDING & RBAC VERIFICATION TEST
Tests the complete database seeding, role assignment, and protected route access.
"""

import requests
import time
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000/api/v1"

def print_header(title):
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)

def print_section(title):
    print(f"\n{title}")
    print("-" * 80)

print_header("🛡️  DATABASE SEEDING & RBAC VERIFICATION TEST")
print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"Backend: {BASE_URL}")

# ============================================================================
# TEST 1: Admin Account Exists and Can Login
# ============================================================================
print_section("[TEST 1] Admin Account (admin@insidershield.com)")

admin_login = {
    "username": "admin@insidershield.com",
    "password": "Admin@123"
}

resp = requests.post(f"{BASE_URL}/auth/login", data=admin_login)
if resp.status_code == 200:
    result = resp.json()
    admin_token = result['access_token']
    admin_employee = result['employee']
    print(f"✓ Admin Login: 200 OK")
    print(f"  Name: {admin_employee['first_name']} {admin_employee['last_name']}")
    print(f"  Email: {admin_employee['email']}")
    print(f"  Role ID: {admin_employee['role_id']}")
    print(f"  Department ID: {admin_employee['department_id']}")
    admin_success = True
else:
    print(f"✗ Admin Login: {resp.status_code}")
    print(f"  Response: {resp.text}")
    admin_success = False

# ============================================================================
# TEST 2: Check /auth/me Returns User with role_id
# ============================================================================
if admin_success:
    print_section("[TEST 2] /auth/me Endpoint (Admin User)")
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    
    if resp.status_code == 200:
        user = resp.json()
        print(f"✓ /auth/me: 200 OK")
        print(f"  Employee ID: {user['employee_id']}")
        print(f"  Name: {user['first_name']} {user['last_name']}")
        print(f"  Email: {user['email']}")
        print(f"  Role ID: {user['role_id']}")
        print(f"  Department ID: {user['department_id']}")
        
        if user['role_id']:
            print(f"  ✓ role_id is populated (NOT NULL)")
            auth_me_success = True
        else:
            print(f"  ✗ role_id is NULL")
            auth_me_success = False
    else:
        print(f"✗ /auth/me: {resp.status_code}")
        auth_me_success = False

    # ========================================================================
    # TEST 3: Dashboard Access (Protected Route)
    # ========================================================================
    print_section("[TEST 3] Protected Route: /dashboard/overview (Admin User)")
    
    resp = requests.get(f"{BASE_URL}/dashboard/overview", headers=headers)
    
    if resp.status_code == 200:
        data = resp.json()
        print(f"✓ Dashboard Access: 200 OK")
        print(f"  Employees: {data.get('employees', 0)}")
        print(f"  Activities: {data.get('activities', 0)}")
        print(f"  Risk: {data.get('risk', 0)}")
        print(f"  Departments: {data.get('departments', 0)}")
        dashboard_success = True
    else:
        print(f"✗ Dashboard Access: {resp.status_code}")
        print(f"  Response: {resp.text}")
        dashboard_success = False

# ============================================================================
# TEST 4: New User Registration (Fresh User)
# ============================================================================
print_section("[TEST 4] New User Registration (Test Fresh User)")

timestamp = int(time.time())
new_email = f"test_fresh_{timestamp}@example.com"

reg_payload = {
    "employee_id": f"EMP-FRESH-{timestamp}",
    "first_name": "Fresh",
    "last_name": "User",
    "email": new_email,
    "password": "TestPass123",
    "department": "engineering",
    "role": "analyst"
}

resp = requests.post(f"{BASE_URL}/auth/register", json=reg_payload)
if resp.status_code == 201:
    print(f"✓ Registration: 201 Created")
    
    # Verify new user can login
    login_data = {"username": new_email, "password": "TestPass123"}
    resp = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    
    if resp.status_code == 200:
        result = resp.json()
        new_token = result['access_token']
        new_employee = result['employee']
        
        print(f"✓ New User Login: 200 OK")
        print(f"  Name: {new_employee['first_name']} {new_employee['last_name']}")
        print(f"  Role ID: {new_employee['role_id']}")
        print(f"  Department ID: {new_employee['department_id']}")
        
        # Test new user access to dashboard
        headers = {"Authorization": f"Bearer {new_token}"}
        resp = requests.get(f"{BASE_URL}/dashboard/overview", headers=headers)
        
        if resp.status_code == 200:
            print(f"✓ New User Dashboard Access: 200 OK")
            new_reg_success = True
        else:
            print(f"✗ New User Dashboard Access: {resp.status_code}")
            new_reg_success = False
    else:
        print(f"✗ New User Login: {resp.status_code}")
        new_reg_success = False
else:
    print(f"✗ Registration: {resp.status_code}")
    print(f"  Response: {resp.text}")
    new_reg_success = False

# ============================================================================
# SUMMARY
# ============================================================================
print_header("✨ TEST SUMMARY")

tests = [
    ("Admin Account Login", admin_success),
    ("/auth/me Returns role_id", auth_me_success if admin_success else None),
    ("Dashboard Access (Protected Route)", dashboard_success if admin_success else None),
    ("New User Registration & Dashboard", new_reg_success),
]

passed = sum(1 for _, result in tests if result is True)
failed = sum(1 for _, result in tests if result is False)
skipped = sum(1 for _, result in tests if result is None)

for test_name, result in tests:
    if result is True:
        print(f"✓ {test_name}")
    elif result is False:
        print(f"✗ {test_name}")
    else:
        print(f"⊘ {test_name} (skipped)")

print(f"\nTotal: {passed} passed, {failed} failed, {skipped} skipped")

if failed == 0:
    print("\n" + "="*80)
    print("✓ ALL TESTS PASSED - SYSTEM READY")
    print("="*80)
else:
    print("\n" + "="*80)
    print(f"✗ {failed} TEST(S) FAILED")
    print("="*80)
