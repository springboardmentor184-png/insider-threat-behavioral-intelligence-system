"""
Loads a real sample of CERT Insider Threat Dataset (logon.csv) records
into the ITBIS activity_logs table via the running FastAPI backend.

Usage:
    1. Make sure your FastAPI server is running (py -m uvicorn app.main:app --reload)
    2. Place this script in the backend/ folder
    3. Run: py ingest_cert_data.py
"""

import csv
import requests

API_BASE = "http://127.0.0.1:8000"
CSV_FILE = "cert_sample.csv"   # place this file in the same folder as this script

MANAGER_USERNAME = "manager1"
MANAGER_PASSWORD = "Test@123"

CERT_EMPLOYEE_ID = "DNS1758"   # the real CERT user we're demoing


def get_token(username, password):
    resp = requests.post(
        f"{API_BASE}/auth/login",
        data={"username": username, "password": password},
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def ensure_employee_exists(token, employee_id):
    headers = {"Authorization": f"Bearer {token}"}

    # Check if it already exists
    resp = requests.get(f"{API_BASE}/employees/{employee_id}", headers=headers)
    if resp.status_code == 200:
        print(f"Employee {employee_id} already exists, skipping creation.")
        return

    # Create it
    payload = {
        "employee_id": employee_id,
        "department": "IT Operations",
        "designation": "Systems Administrator",
        "manager": "manager1",
        "device_info": "Multiple workstations (CERT dataset)",
        "access_privileges": "Standard",
    }
    resp = requests.post(f"{API_BASE}/employees/", headers=headers, json=payload)
    if resp.status_code == 200:
        print(f"Created employee profile for {employee_id}")
    else:
        print(f"Could not create employee: {resp.status_code} {resp.text}")


def ingest_logs(token, csv_path, employee_id):
    headers = {"Authorization": f"Bearer {token}"}
    success_count = 0
    fail_count = 0

    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            payload = {
                "employee_id": employee_id,
                "event_type": "login",
                "event_detail": f"{row['activity']} event (CERT record {row['id']})",
                "ip_address": None,
                "device": row["pc"],
            }
            resp = requests.post(f"{API_BASE}/activity-logs/", headers=headers, json=payload)
            if resp.status_code == 200:
                success_count += 1
            else:
                fail_count += 1
                print(f"  Failed: {resp.status_code} {resp.text}")

    print(f"\nDone. {success_count} logs ingested successfully, {fail_count} failed.")


if __name__ == "__main__":
    print("Logging in as manager1...")
    token = get_token(MANAGER_USERNAME, MANAGER_PASSWORD)

    print(f"Ensuring employee profile exists for {CERT_EMPLOYEE_ID}...")
    ensure_employee_exists(token, CERT_EMPLOYEE_ID)

    print(f"Ingesting activity logs from {CSV_FILE}...")
    ingest_logs(token, CSV_FILE, CERT_EMPLOYEE_ID)
