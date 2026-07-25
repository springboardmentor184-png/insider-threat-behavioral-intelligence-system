import os
import csv
import sys
import datetime
import pymongo
from dotenv import load_dotenv

# Load env configurations
load_dotenv()
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "insider_threat_logs")

def get_mongo_collection():
    try:
        client = pymongo.MongoClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        db = client[MONGODB_DB]
        return db.activity_logs
    except Exception as e:
        print(f"[-] Error: Could not connect to local MongoDB at {MONGODB_URL}.")
        print(f"    Make sure your local MongoDB service is running. Details: {e}")
        sys.exit(1)

def parse_date(date_str):
    try:
        return datetime.datetime.strptime(date_str, "%m/%d/%Y %H:%M:%S").isoformat()
    except Exception:
        return date_str

def ingest_logon(file_path, collection, unique_users, batch_size=5000):
    print(f"\n[*] Processing Logon events: {file_path}...")
    if not os.path.exists(file_path):
        print(f"[-] Warning: File not found at {file_path}. Skipping.")
        return
        
    with open(file_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        batch = []
        count = 0
        
        for row in reader:
            user = row["user"]
            unique_users.add(user)
            
            log_doc = {
                "timestamp": parse_date(row["date"]),
                "employee_id": user,
                "activity_type": "LOGIN",
                "action": row["activity"].upper(), # LOGON, LOGOFF
                "device_name": row["pc"],
                "ip_address": "10.0.0.1",
                "target_asset": "Domain Controller",
                "bytes_transferred": 0,
                "additional_metadata": {
                    "cert_event_id": row["id"]
                },
                "is_suspicious": False
            }
            batch.append(log_doc)
            
            if len(batch) >= batch_size:
                collection.insert_many(batch)
                count += len(batch)
                print(f"[+] Ingested {count} logon records...")
                batch = []
                
        if batch:
            collection.insert_many(batch)
            count += len(batch)
            print(f"[+] Completed: Ingested {count} logon records.")

def ingest_device(file_path, collection, unique_users, batch_size=5000):
    print(f"\n[*] Processing USB Device events: {file_path}...")
    if not os.path.exists(file_path):
        print(f"[-] Warning: File not found at {file_path}. Skipping.")
        return
        
    with open(file_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        batch = []
        count = 0
        
        for row in reader:
            user = row["user"]
            unique_users.add(user)
            
            log_doc = {
                "timestamp": parse_date(row["date"]),
                "employee_id": user,
                "activity_type": "USB_DEVICE",
                "action": row["activity"].upper(), # CONNECT, DISCONNECT
                "device_name": row["pc"],
                "ip_address": "10.0.0.1",
                "target_asset": "Removable Mass Storage",
                "bytes_transferred": 0,
                "additional_metadata": {
                    "cert_event_id": row["id"],
                    "usb_serial": f"USB-{row['id']}"
                },
                "is_suspicious": False
            }
            batch.append(log_doc)
            
            if len(batch) >= batch_size:
                collection.insert_many(batch)
                count += len(batch)
                print(f"[+] Ingested {count} USB device records...")
                batch = []
                
        if batch:
            collection.insert_many(batch)
            count += len(batch)
            print(f"[+] Completed: Ingested {count} USB device records.")

def ingest_file(file_path, collection, unique_users, batch_size=5000):
    print(f"\n[*] Processing File Access events: {file_path}...")
    if not os.path.exists(file_path):
        print(f"[-] Warning: File not found at {file_path}. Skipping.")
        return
        
    with open(file_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        batch = []
        count = 0
        
        for row in reader:
            user = row["user"]
            unique_users.add(user)
            
            meta = {
                "cert_event_id": row["id"],
                "file_extension": row["filename"].split(".")[-1] if "." in row["filename"] else "unknown",
                "content_keywords": row.get("content", ""),
                "to_removable_media": True
            }
            
            log_doc = {
                "timestamp": parse_date(row["date"]),
                "employee_id": user,
                "activity_type": "FILE_ACCESS",
                "action": "COPY",
                "device_name": row["pc"],
                "ip_address": "10.0.0.1",
                "target_asset": row["filename"],
                "bytes_transferred": 0,
                "additional_metadata": meta,
                "is_suspicious": False
            }
            batch.append(log_doc)
            
            if len(batch) >= batch_size:
                collection.insert_many(batch)
                count += len(batch)
                print(f"[+] Ingested {count} file operations...")
                batch = []
                
        if batch:
            collection.insert_many(batch)
            count += len(batch)
            print(f"[+] Completed: Ingested {count} file operations.")

def ingest_email(file_path, collection, unique_users, batch_size=5000):
    print(f"\n[*] Processing Email events: {file_path}...")
    if not os.path.exists(file_path):
        print(f"[-] Warning: File not found at {file_path}. Skipping.")
        return
        
    with open(file_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        batch = []
        count = 0
        
        for row in reader:
            user = row["user"]
            unique_users.add(user)
            
            recipients = [r.strip() for r in (row["to"] or "").split(";") if r.strip()]
            attach_count_str = row.get("attachment_count", "0") or "0"
            attach_count = int(attach_count_str) if attach_count_str.isdigit() else 0
            has_attachments = attach_count > 0 or bool(row.get("attachment") and row.get("attachment") != "None")
            
            meta = {
                "cert_event_id": row["id"],
                "email_recipient": recipients[0] if recipients else "unknown",
                "cc_recipients": row.get("cc", ""),
                "bcc_recipients": row.get("bcc", ""),
                "attachment_count": attach_count,
                "has_attachments": has_attachments,
                "content_keywords": row.get("content", "")
            }
            
            log_doc = {
                "timestamp": parse_date(row["date"]),
                "employee_id": user,
                "activity_type": "EMAIL",
                "action": "SEND",
                "device_name": row["pc"],
                "ip_address": "10.0.0.1",
                "target_asset": row["to"],
                "bytes_transferred": int(row["size"]) if row["size"].isdigit() else 0,
                "additional_metadata": meta,
                "is_suspicious": False
            }
            batch.append(log_doc)
            
            if len(batch) >= batch_size:
                collection.insert_many(batch)
                count += len(batch)
                print(f"[+] Ingested {count} email logs...")
                batch = []
                
        if batch:
            collection.insert_many(batch)
            count += len(batch)
            print(f"[+] Completed: Ingested {count} email logs.")

def ingest_http(file_path, collection, unique_users, batch_size=5000):
    print(f"\n[*] Processing HTTP Network Web logs: {file_path}...")
    if not os.path.exists(file_path):
        print(f"[-] Warning: File not found at {file_path}. Skipping.")
        return
        
    with open(file_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        batch = []
        count = 0
        
        for row in reader:
            user = row["user"]
            unique_users.add(user)
            
            url = row["url"]
            domain = url.split("/")[2] if "//" in url else url.split("/")[0]
            
            log_doc = {
                "timestamp": parse_date(row["date"]),
                "employee_id": user,
                "activity_type": "NETWORK",
                "action": "GET",
                "device_name": row["pc"],
                "ip_address": "10.0.0.1",
                "target_asset": url,
                "bytes_transferred": 0,
                "additional_metadata": {
                    "cert_event_id": row["id"],
                    "domain": domain
                },
                "is_suspicious": False
            }
            batch.append(log_doc)
            
            if len(batch) >= batch_size:
                collection.insert_many(batch)
                count += len(batch)
                print(f"[+] Ingested {count} HTTP records...")
                batch = []
                
        if batch:
            collection.insert_many(batch)
            count += len(batch)
            print(f"[+] Completed: Ingested {count} HTTP records.")

def sync_employees_to_postgres(unique_users):
    """
    Synchronizes unique employee IDs parsed from CERT CSV files into the PostgreSQL directory.
    """
    if not unique_users:
        return
        
    print(f"\n[*] Synchronizing {len(unique_users)} employee identities into PostgreSQL...")
    try:
        # Import database settings dynamically
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from app.database import SessionLocal
        from app.models import EmployeeProfile
        
        session = SessionLocal()
        
        # Query existing employee ids in a single round-trip to avoid N+1 queries
        existing_employees = set(x[0] for x in session.query(EmployeeProfile.employee_id).all())
        
        new_profiles = []
        for user_id in unique_users:
            if user_id not in existing_employees:
                profile = EmployeeProfile(
                    employee_id=user_id,
                    full_name=f"Employee {user_id}",
                    department="Unassigned",
                    designation="Staff Associate",
                    manager="Security Manager One",
                    access_privileges="SSH_ACCESS,DB_READ",
                    status="Active"
                )
                new_profiles.append(profile)
                
        if new_profiles:
            session.bulk_save_objects(new_profiles)
            session.commit()
            print(f"[+] Successfully synchronized {len(new_profiles)} new employee profiles into PostgreSQL!")
        else:
            print("[+] All employee identities are already present in PostgreSQL.")
            
        session.close()
    except Exception as e:
        print(f"⚠️ Warning: Failed to sync employee profiles to PostgreSQL: {e}")

def main():
    print("==================================================")
    print("  CERT Insider Threat Dataset Ingestion Pipeline ")
    print("==================================================")
    
    folder_path = input("Enter the absolute folder path where CERT CSV files are located: ").strip()
    if not os.path.isdir(folder_path):
        print(f"[-] Error: '{folder_path}' is not a valid directory.")
        sys.exit(1)
        
    collection = get_mongo_collection()
    
    clear_choice = input("Do you want to clear existing logs in MongoDB before ingestion? (y/n): ").strip().lower()
    if clear_choice == 'y':
        print("[*] Clearing existing activity logs in MongoDB...")
        collection.delete_many({})
        print("[+] Collection cleared.")
        
    start_time = datetime.datetime.now()
    
    # Store unique employee IDs parsed from files
    unique_users = set()
    
    # Ingest each CSV file sequentially
    ingest_logon(os.path.join(folder_path, "logon.csv"), collection, unique_users)
    ingest_device(os.path.join(folder_path, "device.csv"), collection, unique_users)
    ingest_file(os.path.join(folder_path, "file.csv"), collection, unique_users)
    ingest_email(os.path.join(folder_path, "email.csv"), collection, unique_users)
    
    # Optional http log ingestion check
    http_path = os.path.join(folder_path, "http.csv")
    if os.path.exists(http_path):
        http_choice = input("\n[?] http.csv detected (very large file). Do you want to ingest web traffic logs? (y/n): ").strip().lower()
        if http_choice == 'y':
            ingest_http(http_path, collection, unique_users)
        else:
            print("[*] Skipping HTTP logs ingestion.")
            
    # Synchronize all unique employee IDs into PostgreSQL
    sync_employees_to_postgres(unique_users)
            
    end_time = datetime.datetime.now()
    duration = end_time - start_time
    
    print("\n==================================================")
    print("  INGESTION COMPLETED SUCCESSFULLY!")
    print(f"  Total Duration: {duration}")
    print("==================================================")

if __name__ == "__main__":
    main()
