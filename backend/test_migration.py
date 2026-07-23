import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

print("=" * 80)
print("TESTING MIGRATED USER AUTHENTICATION")
print("=" * 80)

# Test 1: Login with migrated user (previously had NULL role_id)
print("\n[TEST 1] Login with Migrated User (aaaa@it.com)")
print("-" * 80)

login_data = {
    "username": "aaaa@it.com",
    "password": "password123"  # Default password for test users
}

print(f"Attempting login...")
resp = requests.post(f"{BASE_URL}/auth/login", data=login_data)

if resp.status_code == 200:
    result = resp.json()
    token = result['access_token']
    employee = result['employee']
    
    print(f"✓ Login successful (200 OK)")
    print(f"  Token: {token[:40]}...")
    print(f"  Employee: {employee['first_name']} {employee['last_name']}")
    print(f"  Email: {employee['email']}")
    print(f"  Role ID: {employee['role_id']}")
    print(f"  Department ID: {employee['department_id']}")
    
    # Test 2: Get current user info
    print("\n[TEST 2] Get Current User Info (/auth/me)")
    print("-" * 80)
    
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    
    if resp.status_code == 200:
        user = resp.json()
        print(f"✓ /auth/me successful (200 OK)")
        print(f"  User ID: {user['id']}")
        print(f"  Employee ID: {user['employee_id']}")
        print(f"  Name: {user['first_name']} {user['last_name']}")
        print(f"  Role ID: {user['role_id']}")
        print(f"  Department ID: {user['department_id']}")
        
        if user['role_id']:
            print(f"  ✓ Role ID is NOT NULL (migration successful)")
        else:
            print(f"  ✗ Role ID is NULL (migration failed)")
    else:
        print(f"✗ /auth/me failed ({resp.status_code})")
        print(f"  Error: {resp.text}")
    
    # Test 3: Access protected dashboard
    print("\n[TEST 3] Access Protected Dashboard Route")
    print("-" * 80)
    
    resp = requests.get(f"{BASE_URL}/dashboard/overview", headers=headers)
    
    if resp.status_code == 200:
        print(f"✓ Dashboard access successful (200 OK)")
        data = resp.json()
        print(f"  Data retrieved:")
        print(f"    - Employees: {data.get('employees', 0)}")
        print(f"    - Activities: {data.get('activities', 0)}")
        print(f"    - Risk: {data.get('risk', 0)}")
        print(f"    - Departments: {data.get('departments', 0)}")
    else:
        print(f"✗ Dashboard access failed ({resp.status_code})")
        print(f"  Error: {resp.text}")

elif resp.status_code == 401:
    print(f"✗ Login failed: Invalid credentials")
    print(f"  Response: {resp.text}")
else:
    print(f"✗ Login failed ({resp.status_code})")
    print(f"  Response: {resp.text}")

# Test 4: Login with admin account
print("\n[TEST 4] Login with Admin Account")
print("-" * 80)

login_data = {
    "username": "admin@insidershield.com",
    "password": "Admin@123"
}

print(f"Attempting admin login...")
resp = requests.post(f"{BASE_URL}/auth/login", data=login_data)

if resp.status_code == 200:
    result = resp.json()
    token = result['access_token']
    employee = result['employee']
    
    print(f"✓ Admin login successful (200 OK)")
    print(f"  Employee: {employee['first_name']} {employee['last_name']}")
    print(f"  Email: {employee['email']}")
    print(f"  Role ID: {employee['role_id']}")
    
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/dashboard/overview", headers=headers)
    if resp.status_code == 200:
        print(f"✓ Admin can access dashboard (200 OK)")
    else:
        print(f"✗ Admin dashboard access failed ({resp.status_code})")
else:
    print(f"✗ Admin login failed ({resp.status_code})")
    print(f"  Response: {resp.text}")

print("\n" + "=" * 80)
print("END OF TESTS")
print("=" * 80)
