from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from typing import List, Optional
import datetime
import random
import os
import csv
from sqlalchemy.orm import Session
from app.database import get_db, SessionLocal
from app.mongodb import get_mongo_db
from app.models import User, EmployeeProfile
from app.auth import get_current_user, RoleChecker

router = APIRouter(prefix="/api/logs", tags=["Activity logs"])

# In-memory database fallback to ensure frontend works even if MongoDB is offline
IN_MEMORY_LOGS = []

# Global Ingestion Status tracker for the frontend progress bar
INGESTION_STATUS = {
    "status": "IDLE", # IDLE, RUNNING, COMPLETED, FAILED
    "current_file": "",
    "records_ingested": 0,
    "total_files_processed": 0,
    "error": ""
}

# Define read access checker
require_read = RoleChecker(["Administrator", "Security Analyst", "SOC Engineer", "Security Manager"])

@router.get("/ingest-status")
def get_ingestion_status(current_user: User = Depends(require_read)):
    """Returns the progress of the background dataset ingestion pipeline."""
    return INGESTION_STATUS

def parse_date(date_str):
    try:
        return datetime.datetime.strptime(date_str, "%m/%d/%Y %H:%M:%S").isoformat()
    except Exception:
        return date_str

def bg_ingest_dataset_task(folder_path: str):
    """
    Background worker that clears old logs, ingests logon, device, file, and email CSV files,
    updates real-time progress metrics, and synchronizes employee directories in PostgreSQL.
    """
    global INGESTION_STATUS
    INGESTION_STATUS = {
        "status": "RUNNING",
        "current_file": "Initializing",
        "records_ingested": 0,
        "total_files_processed": 0,
        "error": ""
    }
    
    # 1. Verify path
    if not os.path.isdir(folder_path):
        INGESTION_STATUS["status"] = "FAILED"
        INGESTION_STATUS["error"] = f"Directory '{folder_path}' does not exist on the host system."
        return

    db = get_mongo_db()
    if db is None:
        INGESTION_STATUS["status"] = "FAILED"
        INGESTION_STATUS["error"] = "Cannot ingest logs: local MongoDB connection is offline."
        return
        
    try:
        # 2. Reset MongoDB logs collection ONLY
        print("[*] Clearing MongoDB activity logs...")
        db.activity_logs.delete_many({})
        
        unique_users = set()
        files_to_process = [
            ("logon.csv", "LOGIN", "activity"),
            ("device.csv", "USB_DEVICE", "activity"),
            ("file.csv", "FILE_ACCESS", None),
            ("email.csv", "EMAIL", None),
            ("http.csv", "NETWORK", None)
        ]
        
        batch_size = 30000
        
        for filename, act_type, action_col in files_to_process:
            file_path = os.path.join(folder_path, filename)
            if not os.path.exists(file_path):
                print(f"[-] File not found: {file_path}. Skipping.")
                continue
                
            INGESTION_STATUS["current_file"] = filename
            print(f"[*] Processing: {filename}...")
            
            with open(file_path, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                batch = []
                
                for row in reader:
                    user = row["user"]
                    unique_users.add(user)
                    
                    # Map action and metadata depending on file type
                    action = "GET"
                    meta = {"cert_event_id": row["id"]}
                    bytes_transferred = 0
                    target = ""
                    
                    if act_type == "LOGIN":
                        action = row[action_col].upper()
                        target = "Domain Controller"
                    elif act_type == "USB_DEVICE":
                        action = row[action_col].upper()
                        target = "Removable Mass Storage"
                        meta["usb_serial"] = f"USB-{row['id']}"
                    elif act_type == "FILE_ACCESS":
                        action = "COPY"
                        target = row["filename"]
                        meta["file_extension"] = target.split(".")[-1] if "." in target else "unknown"
                        meta["content_keywords"] = row.get("content", "")
                        meta["to_removable_media"] = True
                    elif act_type == "EMAIL":
                        action = "SEND"
                        recipients = [r.strip() for r in (row["to"] or "").split(";") if r.strip()]
                        target = row["to"]
                        bytes_transferred = int(row["size"]) if row["size"].isdigit() else 0
                        attach_count_str = row.get("attachment_count", "0") or "0"
                        attach_count = int(attach_count_str) if attach_count_str.isdigit() else 0
                        
                        meta = {
                            "cert_event_id": row["id"],
                            "email_recipient": recipients[0] if recipients else "unknown",
                            "cc_recipients": row.get("cc", ""),
                            "bcc_recipients": row.get("bcc", ""),
                            "attachment_count": attach_count,
                            "has_attachments": attach_count > 0 or bool(row.get("attachment") and row.get("attachment") != "None"),
                            "content_keywords": row.get("content", "")
                        }
                    elif act_type == "NETWORK":
                        action = "GET"
                        target = row.get("url", "")
                        domain = target.split("/")[2] if "//" in target else target.split("/")[0] if "/" in target else target
                        meta = {
                            "cert_event_id": row["id"],
                            "domain": domain
                        }
                        # The official CERT http.csv does not contain bytes. We simulate a realistic 
                        # payload size (1KB - 2MB) to populate network traffic metrics.
                        bytes_transferred = random.randint(1024, 2097152)
                        
                    # Check for static security anomalies during raw ingestion
                    is_suspicious = False
                    if act_type == "APP_USAGE" and action == "START":
                        if target in ["Tor Browser", "Wireshark Network Scanner", "uTorrent Client"]:
                            is_suspicious = True
                    elif act_type == "PRIVILEGE_CHANGE" and action == "ELEVATE":
                        if "Domain Admins" in target:
                            is_suspicious = True
                    elif act_type == "REMOTE_ACCESS" and action == "ESTABLISH":
                        if target in ["Outbound SSH Tunnel", "AnyDesk Connection"]:
                            is_suspicious = True
                    elif act_type == "EMAIL" and action == "SEND":
                        rec = meta.get("email_recipient", "")
                        if ("competitor" in rec or "protonmail" in rec) and meta.get("has_attachments"):
                            is_suspicious = True
                    elif act_type == "NETWORK":
                        if "malicious-domain" in target:
                            is_suspicious = True
                            
                    log_doc = {
                        "timestamp": parse_date(row["date"]),
                        "employee_id": user,
                        "activity_type": act_type,
                        "action": action,
                        "device_name": row["pc"],
                        "ip_address": "10.0.0.1",
                        "target_asset": target,
                        "bytes_transferred": bytes_transferred,
                        "additional_metadata": meta,
                        "is_suspicious": is_suspicious
                    }
                    batch.append(log_doc)
                    
                    if len(batch) >= batch_size:
                        db.activity_logs.insert_many(batch, ordered=False)
                        INGESTION_STATUS["records_ingested"] += len(batch)
                        batch = []
                        
                if batch:
                    db.activity_logs.insert_many(batch, ordered=False)
                    INGESTION_STATUS["records_ingested"] += len(batch)
                    
            INGESTION_STATUS["total_files_processed"] += 1
            print(f"[+] Completed file: {filename}")
            
        # 3. Synchronize unique users into PostgreSQL
        if unique_users:
            print(f"[*] Synchronizing {len(unique_users)} employee IDs to PostgreSQL...")
            sql_db = SessionLocal()
            try:
                # Query existing IDs
                existing_employees = set(x[0] for x in sql_db.query(EmployeeProfile.employee_id).all())
                
                new_profiles = []
                for user_id in unique_users:
                    if user_id not in existing_employees:
                        depts = ["Engineering", "Finance", "Operations", "Research & Development", "Human Resources", "Sales & Marketing"]
                        profile = EmployeeProfile(
                            employee_id=user_id,
                            full_name=f"Employee {user_id}",
                            department=random.choice(depts),
                            designation="Staff Associate",
                            manager="Security Manager One",
                            access_privileges="SSH_ACCESS,DB_READ",
                            status="Active"
                        )
                        new_profiles.append(profile)
                        
                if new_profiles:
                    sql_db.bulk_save_objects(new_profiles)
                    sql_db.commit()
                    print(f"[+] Synced {len(new_profiles)} new profiles in PostgreSQL.")
            except Exception as sql_err:
                sql_db.rollback()
                print(f"[-] PostgreSQL sync failed: {sql_err}")
            finally:
                sql_db.close()
                
        INGESTION_STATUS["status"] = "COMPLETED"
        INGESTION_STATUS["current_file"] = "Finished Ingestion"
        print("[+] Background Ingestion Task finished successfully!")
        
    except Exception as err:
        INGESTION_STATUS["status"] = "FAILED"
        INGESTION_STATUS["error"] = str(err)
        print(f"[-] Ingestion Task failed: {err}")

@router.post("/ingest-dataset")
def trigger_dataset_ingestion(body: dict, background_tasks: BackgroundTasks, current_user: User = Depends(require_read)):
    """Triggers background thread to ingest actual CERT dataset CSV files from the folder path."""
    folder_path = body.get("folder_path", "").strip()
    if not folder_path:
        raise HTTPException(status_code=400, detail="folder_path parameter is required")
        
    if not os.path.isdir(folder_path):
        raise HTTPException(status_code=400, detail=f"The folder path '{folder_path}' does not exist on your laptop.")
        
    if INGESTION_STATUS["status"] == "RUNNING":
        raise HTTPException(status_code=400, detail="An ingestion task is currently running in the background.")
        
    # Start the task asynchronously
    background_tasks.add_task(bg_ingest_dataset_task, folder_path)
    return {
        "status": "success",
        "message": "Dataset ingestion successfully started in background."
    }

@router.post("/ingest", status_code=status.HTTP_201_CREATED)
def ingest_logs(logs: List[dict], current_user: User = Depends(require_read)):
    db = get_mongo_db()
    processed_logs = []
    for log in logs:
        log_copy = log.copy()
        if "timestamp" not in log_copy:
            log_copy["timestamp"] = datetime.datetime.utcnow().isoformat()
        if "is_suspicious" not in log_copy:
            log_copy["is_suspicious"] = False
        processed_logs.append(log_copy)
        
    if db is not None:
        try:
            result = db.activity_logs.insert_many(processed_logs)
            return {
                "status": "success",
                "message": f"Successfully ingested {len(processed_logs)} logs into MongoDB",
                "inserted_ids": [str(x) for x in result.inserted_ids]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database write failure: {e}")
    else:
        for idx, log in enumerate(processed_logs):
            log["_id"] = f"mem_{len(IN_MEMORY_LOGS) + idx}"
            IN_MEMORY_LOGS.append(log)
        return {
            "status": "warning",
            "message": f"MongoDB offline. Ingested {len(processed_logs)} logs into memory storage."
        }

@router.get("/query")
def query_logs(
    employee_id: Optional[str] = None,
    activity_type: Optional[str] = None,
    is_suspicious: Optional[bool] = None,
    limit: int = 100,
    skip: int = 0,
    current_user: User = Depends(require_read)
):
    db = get_mongo_db()
    query = {}
    if employee_id:
        query["employee_id"] = employee_id
    if activity_type:
        query["activity_type"] = activity_type
    if is_suspicious is not None:
        query["is_suspicious"] = is_suspicious
        
    if db is not None:
        try:
            cursor = db.activity_logs.find(query).sort("timestamp", -1).skip(skip).limit(limit)
            logs = []
            for doc in cursor:
                doc["_id"] = str(doc["_id"])
                logs.append(doc)
            return logs
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database query failure: {e}")
    else:
        filtered = IN_MEMORY_LOGS
        if employee_id:
            filtered = [x for x in filtered if x.get("employee_id") == employee_id]
        if activity_type:
            filtered = [x for x in filtered if x.get("activity_type") == activity_type]
        if is_suspicious is not None:
            filtered = [x for x in filtered if x.get("is_suspicious") == is_suspicious]
        filtered = sorted(filtered, key=lambda x: x.get("timestamp", ""), reverse=True)
        return filtered[skip : skip + limit]

@router.get("/summary")
def get_logs_summary(current_user: User = Depends(require_read)):
    db = get_mongo_db()
    summary = {
        "total_count": 0,
        "types": {
            "LOGIN": 0,
            "FILE_ACCESS": 0,
            "USB_DEVICE": 0,
            "EMAIL": 0,
            "NETWORK": 0,
            "APP_USAGE": 0,
            "PRIVILEGE_CHANGE": 0,
            "REMOTE_ACCESS": 0
        },
        "total_bytes_transferred": 0,
        "suspicious_count": 0,
        "unique_employees": 0
    }
    
    if db is not None:
        try:
            summary["total_count"] = db.activity_logs.count_documents({})
            summary["suspicious_count"] = db.activity_logs.count_documents({"is_suspicious": True})
            for type_name in summary["types"].keys():
                summary["types"][type_name] = db.activity_logs.count_documents({"activity_type": type_name})
            summary["unique_employees"] = len(db.activity_logs.distinct("employee_id"))
            
            pipeline = [{"$match": {"activity_type": {"$in": ["NETWORK", "EMAIL"]}}}, {"$group": {"_id": None, "total": {"$sum": "$bytes_transferred"}}}]
            res = list(db.activity_logs.aggregate(pipeline))
            if res and res[0]["total"]:
                summary["total_bytes_transferred"] = res[0]["total"]
            return summary
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database aggregation failure: {e}")
    else:
        summary["total_count"] = len(IN_MEMORY_LOGS)
        summary["suspicious_count"] = len([x for x in IN_MEMORY_LOGS if x.get("is_suspicious")])
        for type_name in summary["types"].keys():
            summary["types"][type_name] = len([x for x in IN_MEMORY_LOGS if x.get("activity_type") == type_name])
        summary["unique_employees"] = len(list(set([x.get("employee_id") for x in IN_MEMORY_LOGS if x.get("employee_id")])))
        network_logs = [x for x in IN_MEMORY_LOGS if x.get("activity_type") in ["NETWORK", "EMAIL"]]
        summary["total_bytes_transferred"] = sum([x.get("bytes_transferred", 0) for x in network_logs])
        return summary

@router.post("/seed-cert")
def seed_cert_dataset(current_user: User = Depends(require_read), sql_db: Session = Depends(get_db)):
    """Mock demo seeder (Randomized log generation with dynamic threat actors)"""
    # Remove random.seed(42) to make each run unique
    import time
    random.seed(time.time())
    
    activities = []
    base_time = datetime.datetime.now() - datetime.timedelta(days=7) # Past week of events
    
    employees = ["EMP-7082", "EMP-1002", "EMP-1003", "EMP-1004"]
    devices = {
        "EMP-7082": ("Workplace macOS Laptop", "192.168.1.15"),
        "EMP-1002": ("Win10-Desktop-21", "10.0.2.14"),
        "EMP-1003": ("Win10-Laptop-04", "10.0.2.82"),
        "EMP-1004": ("Developer-Linux-Box", "192.168.2.110")
    }
    
    file_names = ["project_specs.pdf", "client_ledger.xlsx", "database_backup.sql", "salary_structure.csv", "src_code.zip"]
    network_sites = ["github.com/org", "slack.com/api", "personal-google-drive.com/upload", "malicious-domain.xyz/download", "company-intranet.local"]
    
    # Dynamically select one threat actor to escalate to CRITICAL risk, 
    # one to HIGH risk, one to MEDIUM, and one to remain LOW.
    shuffled_employees = list(employees)
    random.shuffle(shuffled_employees)
    rogue_critical = shuffled_employees[0]
    rogue_high = shuffled_employees[1]
    rogue_medium = shuffled_employees[2]
    quiet_low = shuffled_employees[3]

    # Fetch all employee profiles from PostgreSQL
    from app.models import EmployeeProfile
    all_sql_emps = sql_db.query(EmployeeProfile).all()
    all_emp_ids = [e.employee_id for e in all_sql_emps]
    
    # Pick 60 random employees to represent active normal workers in the system
    active_pool_ids = list(employees)
    if all_emp_ids:
        sampled_size = min(len(all_emp_ids), 60)
        sampled_ids = random.sample(all_emp_ids, sampled_size)
        for e_id in sampled_ids:
            if e_id not in active_pool_ids:
                active_pool_ids.append(e_id)

    # 1. Generate normal baseline logs for all active pool employees (non-zero scores)
    for emp_id in active_pool_ids:
        if emp_id in devices:
            device, ip = devices[emp_id]
        else:
            device = "Workstation-Desktop"
            ip = f"10.0.1.{random.randint(10, 250)}"
            
        worker_logs = random.randint(2, 6)
        for k in range(worker_logs):
            timestamp = (base_time + datetime.timedelta(days=random.randint(0, 6), hours=random.randint(8, 18))).isoformat()
            
            act_type = random.choice(["LOGIN", "NETWORK", "EMAIL"])
            bytes_transferred = 0
            if act_type == "LOGIN":
                action = random.choice(["LOGON", "LOGOFF"])
                target = "Domain Controller"
            elif act_type == "NETWORK":
                action = "GET"
                target = random.choice(["slack.com/api", "github.com/org", "company-intranet.local"])
                bytes_transferred = random.randint(2000, 80000)
            else:
                action = "SEND"
                target = "manager@company.com"
                
            activities.append({
                "timestamp": timestamp,
                "employee_id": emp_id,
                "activity_type": act_type,
                "action": action,
                "device_name": device,
                "ip_address": ip,
                "target_asset": target,
                "bytes_transferred": bytes_transferred,
                "additional_metadata": {"details": "Standard corporate workforce routine activity"} if act_type != "EMAIL" else {"email_recipient": target, "has_attachments": False},
                "is_suspicious": False
            })

    # 2. Inject threat/anomaly activity logs for our rogue employees
    num_rogue_records = random.randint(120, 180)
    print(f"Generating {num_rogue_records} rogue threat logs and baseline records...")
    
    for i in range(num_rogue_records):
        timestamp = (base_time + datetime.timedelta(minutes=45 * i)).isoformat()
        
        # Pick employee based on distribution weight
        emp = random.choices(
            [rogue_critical, rogue_high, rogue_medium, quiet_low],
            weights=[35, 30, 25, 10]
        )[0]
        
        device, ip = devices[emp]
        is_suspicious = False
        bytes_transferred = 0
        action = ""
        target = ""
        meta = {}
        
        # Determine activity types available
        possible_types = ["LOGIN", "FILE_ACCESS", "USB_DEVICE", "EMAIL", "NETWORK", "APP_USAGE", "PRIVILEGE_CHANGE", "REMOTE_ACCESS"]
        act_type = random.choice(possible_types)
        
        # Inject behavior characteristics based on target employee threat level
        if emp == rogue_critical:
            # Critical threat actor: High frequency of severe static violations
            if act_type == "PRIVILEGE_CHANGE":
                action = "ELEVATE"
                target = "Domain Admins Group"
                is_suspicious = True
                meta["details"] = "Unauthorized administrative privilege elevation"
            elif act_type == "APP_USAGE" and random.random() > 0.4:
                action = "START"
                target = random.choice(["Tor Browser", "Wireshark Network Scanner"])
                is_suspicious = True
                meta["details"] = "Unauthorized blacklisted diagnostic tool execution"
            elif act_type == "EMAIL" and random.random() > 0.4:
                action = "SEND"
                target = "competitor-sec@protonmail.com"
                meta["email_recipient"] = target
                meta["has_attachments"] = True
                is_suspicious = True
                meta["details"] = "Outbound emails to untrusted domains containing file attachments"
            else:
                act_type = "LOGIN"
                action = "LOGON"
                target = "Domain Controller"
                timestamp = (base_time + datetime.timedelta(minutes=45 * i)).replace(hour=2, minute=15).isoformat() # Off-hours login
                is_suspicious = True
                meta["details"] = "Off-hours logon anomaly"
                
        elif emp == rogue_high:
            # High threat actor: Moderate anomalies and ML deviations
            if act_type == "REMOTE_ACCESS" and random.random() > 0.5:
                action = "ESTABLISH"
                target = "AnyDesk Connection"
                is_suspicious = True
                meta["details"] = "Unauthorized remote access gateway established"
            elif act_type == "NETWORK" and random.random() > 0.5:
                action = "POST"
                target = "personal-google-drive.com/upload"
                bytes_transferred = random.randint(3000000, 8000000) # Large upload
                is_suspicious = True
                meta["details"] = "Unusual volume network data exfiltration"
            else:
                act_type = "FILE_ACCESS"
                action = "READ"
                target = "database_backup.sql"
                is_suspicious = True
                meta["details"] = "Auditing restricted database backup profiles"
                
        elif emp == rogue_medium:
            # Medium threat actor: Normal behavior with minor anomalies
            if act_type == "USB_DEVICE" and random.random() > 0.6:
                action = "CONNECT"
                target = "SanDisk Cruzer"
                is_suspicious = True
                meta["details"] = "External mass storage mounting"
            else:
                action = "LOGON" if act_type == "LOGIN" else "READ" if act_type == "FILE_ACCESS" else "GET"
                target = "Domain Controller" if act_type == "LOGIN" else "client_ledger.xlsx" if act_type == "FILE_ACCESS" else "slack.com/api"
                act_type = "LOGIN" if action == "LOGON" else "FILE_ACCESS" if action == "READ" else "NETWORK"
                
        else:
            # Low threat employee: Completely benign standard workplace traffic
            act_type = random.choice(["LOGIN", "NETWORK", "EMAIL"])
            if act_type == "LOGIN":
                action = random.choice(["LOGON", "LOGOFF"])
                target = "Domain Controller"
            elif act_type == "NETWORK":
                action = "GET"
                target = "slack.com/api"
                bytes_transferred = random.randint(1000, 50000)
            else:
                action = "SEND"
                target = "manager@company.com"
                meta["email_recipient"] = target
                meta["has_attachments"] = False
                
        activities.append({
            "timestamp": timestamp,
            "employee_id": emp,
            "activity_type": act_type,
            "action": action,
            "device_name": device,
            "ip_address": ip,
            "target_asset": target,
            "bytes_transferred": bytes_transferred,
            "additional_metadata": meta,
            "is_suspicious": is_suspicious
        })

        
    # Sync employee profiles in PostgreSQL
    seeded_emp_ids = ["EMP-7082", "EMP-1002", "EMP-1003", "EMP-1004"]
    names_map = {
        "EMP-7082": "John Doe",
        "EMP-1002": "Alice Smith",
        "EMP-1003": "Bob Johnson",
        "EMP-1004": "Charlie Brown"
    }
    depts_map = {
        "EMP-7082": "Engineering",
        "EMP-1002": "Finance",
        "EMP-1003": "Operations",
        "EMP-1004": "Research & Development"
    }
    for emp_id in seeded_emp_ids:
        exists = sql_db.query(EmployeeProfile).filter(EmployeeProfile.employee_id == emp_id).first()
        if not exists:
            depts = ["Engineering", "Finance", "Operations", "Research & Development", "Human Resources", "Sales & Marketing"]
            new_profile = EmployeeProfile(
                employee_id=emp_id,
                full_name=names_map.get(emp_id, "Unknown Employee"),
                department=depts_map.get(emp_id, random.choice(depts)),
                designation="Staff Associate",
                manager="Security Manager One",
                access_privileges="SSH_ACCESS,DB_READ",
                status="Active"
            )
            sql_db.add(new_profile)
    try:
        sql_db.commit()
    except Exception as e:
        sql_db.rollback()
        print(f"Failed to synchronize seeded employee profiles: {e}")

    db = get_mongo_db()
    if db is not None:
        try:
            db.activity_logs.delete_many({})
            db.alerts.delete_many({})
            db.incidents.delete_many({})
            db.notifications.delete_many({})
            db.activity_logs.insert_many(activities)
            return {
                "status": "success",
                "message": f"Successfully cleared collection and seeded {len(activities)} simulated logs into MongoDB."
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to seed MongoDB: {e}")
    else:
        global IN_MEMORY_LOGS
        IN_MEMORY_LOGS = []
        for idx, log in enumerate(activities):
            log["_id"] = f"mem_{idx}"
            IN_MEMORY_LOGS.append(log)
        return {
            "status": "warning",
            "message": f"MongoDB offline. Seeded {len(activities)} logs into memory storage.",
            "note": "Logs will clear when backend server restarts."
        }
