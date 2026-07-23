import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

# Login with the user we just created (OAuth2 expects form data)
login_data = {
    "username": "john1784814923@example.com",  # OAuth2PasswordRequestForm expects 'username'
    "password": "TestPass123"
}

print("Logging in:", login_data["username"])
resp = requests.post(f"{BASE_URL}/auth/login", data=login_data)  # form data, not JSON
print(f"Login: {resp.status_code}")
if resp.status_code != 200:
    print(f"Error: {resp.text}")
else:
    result = resp.json()
    print(f"Token: {result['access_token'][:50]}...")
    print(f"Employee: {result['employee']}")

    # Use token to access dashboard
    token = result['access_token']
    headers = {"Authorization": f"Bearer {token}"}

    print("\nAccessing dashboard overview...")
    resp = requests.get(f"{BASE_URL}/dashboard/overview", headers=headers)
    print(f"Dashboard Overview: {resp.status_code}")
    if resp.status_code == 200:
        print("✓ Successfully accessed protected dashboard route!")
        data = resp.json()
        print(f"Overview keys: {list(data.keys())}")
    else:
        print(f"✗ Error: {resp.text}")
