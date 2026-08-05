"""
ITBIS - Synthetic Employee Behavioral Log Generator
Generates fake/dummy logon, device, file, email, and http logs
(CERT-style schema) for behavioral baseline + ML model training.

Usage:
    python generate_dummy_logs.py

Outputs (in ./dummy_logs/):
    employees.csv   - synthetic employee roster
    logon.csv       - login/logoff events
    device.csv      - USB/device connect events
    file.csv        - file access events
    email.csv       - email send/receive events
    http.csv        - web browsing events
    labels.csv       - ground-truth normal/anomalous label per user (for supervised eval)
"""

import csv
import os
import random
from datetime import datetime, timedelta

random.seed(42)

OUT_DIR = "dummy_logs"
os.makedirs(OUT_DIR, exist_ok=True)

N_EMPLOYEES = 60
N_MALICIOUS = 6  # subset exhibiting insider-threat-like anomalies
SIM_DAYS = 45
START_DATE = datetime(2026, 1, 1, 0, 0, 0)

DEPARTMENTS = ["Engineering", "Finance", "HR", "Sales", "IT Support", "Legal", "R&D"]
ROLES = {
    "Engineering": ["Software Engineer", "QA Engineer", "DevOps Engineer"],
    "Finance": ["Accountant", "Financial Analyst"],
    "HR": ["HR Executive", "Recruiter"],
    "Sales": ["Sales Executive", "Account Manager"],
    "IT Support": ["System Admin", "Helpdesk Technician"],
    "Legal": ["Legal Associate", "Compliance Officer"],
    "R&D": ["Research Scientist", "Data Scientist"],
}
FIRST_NAMES = ["Aditi","Rohan","Sneha","Kiran","Priya","Arjun","Meera","Vikram","Anjali","Suresh",
               "Divya","Rahul","Pooja","Karthik","Neha","Sameer","Ritu","Manoj","Swati","Ajay",
               "Farah","Nikhil","Lakshmi","Yusuf","Tanya","Deepak","Kavya","Rajesh","Isha","Varun"]
LAST_NAMES = ["Sharma","Verma","Reddy","Iyer","Nair","Gupta","Rao","Menon","Das","Khan",
              "Chatterjee","Patil","Joshi","Bose","Mehta","Kapoor","Pillai","Naidu","Saxena","Bhatt"]

DOMAINS_NORMAL = ["company-intranet.local","office365.com","github.com","stackoverflow.com",
                  "atlassian.net","zoom.us","slack.com","linkedin.com","wikipedia.org","google.com"]
DOMAINS_SUSPICIOUS = ["file-transfer-anon.net","pastebin.com","mega.nz","wetransfer.com",
                      "dropbox-shared-link.info","darkweb-mirror.onion.link","competitor-jobsboard.com"]

FILE_TYPES_NORMAL = ["report.docx","budget.xlsx","meeting_notes.pdf","presentation.pptx",
                     "source_code.py","design_spec.docx","timesheet.xlsx"]
FILE_TYPES_SENSITIVE = ["employee_salaries.xlsx","client_database.csv","source_code_core.zip",
                        "server_credentials.txt","merger_plan.docx","customer_pii.csv"]

DEVICE_TYPES = ["USB_Drive", "External_HDD", "Mobile_Device"]


def make_employees():
    employees = []
    used_names = set()
    for i in range(1, N_EMPLOYEES + 1):
        while True:
            fn = random.choice(FIRST_NAMES)
            ln = random.choice(LAST_NAMES)
            full = f"{fn} {ln}"
            if full not in used_names:
                used_names.add(full)
                break
        dept = random.choice(DEPARTMENTS)
        role = random.choice(ROLES[dept])
        emp_id = f"EMP{i:04d}"
        username = f"{fn.lower()}.{ln.lower()}{i}"
        hire_date = START_DATE - timedelta(days=random.randint(60, 2000))
        employees.append({
            "employee_id": emp_id,
            "username": username,
            "full_name": full,
            "department": dept,
            "role": role,
            "hire_date": hire_date.strftime("%Y-%m-%d"),
            "pc_id": f"PC-{dept[:3].upper()}-{i:03d}",
        })
    return employees


def pick_malicious(employees):
    return set(random.sample([e["employee_id"] for e in employees], N_MALICIOUS))


def working_hour_ts(day):
    hour = random.choices(
        population=list(range(24)),
        weights=[1,1,1,1,1,1,2,6,10,10,9,9,8,9,10,9,7,4,2,2,1,1,1,1],
        k=1
    )[0]
    minute = random.randint(0, 59)
    second = random.randint(0, 59)
    return day.replace(hour=hour, minute=minute, second=second)


def off_hour_ts(day):
    hour = random.choice([0,1,2,3,4,5,22,23])
    minute = random.randint(0, 59)
    return day.replace(hour=hour, minute=minute, second=random.randint(0,59))


def generate_logon(employees, malicious_ids):
    rows = []
    for e in employees:
        is_mal = e["employee_id"] in malicious_ids
        for d in range(SIM_DAYS):
            day = START_DATE + timedelta(days=d)
            if day.weekday() >= 5 and random.random() > 0.05:
                continue  # mostly skip weekends
            if random.random() < 0.05:
                continue  # occasional day off
            anomalous_today = is_mal and random.random() < 0.35
            ts_on = off_hour_ts(day) if anomalous_today else working_hour_ts(day)
            duration_hours = random.uniform(8, 14) if anomalous_today else random.uniform(6, 9)
            ts_off = ts_on + timedelta(hours=duration_hours)
            rows.append({
                "id": f"L{len(rows)+1:06d}",
                "date": ts_on.strftime("%Y-%m-%d %H:%M:%S"),
                "user": e["username"],
                "employee_id": e["employee_id"],
                "pc": e["pc_id"],
                "activity": "Logon",
                "off_hours_flag": int(anomalous_today),
            })
            rows.append({
                "id": f"L{len(rows)+1:06d}",
                "date": ts_off.strftime("%Y-%m-%d %H:%M:%S"),
                "user": e["username"],
                "employee_id": e["employee_id"],
                "pc": e["pc_id"],
                "activity": "Logoff",
                "off_hours_flag": int(anomalous_today),
            })
    return rows


def generate_device(employees, malicious_ids):
    rows = []
    for e in employees:
        is_mal = e["employee_id"] in malicious_ids
        n_events = random.randint(1, 4) if not is_mal else random.randint(5, 12)
        for _ in range(n_events):
            day = START_DATE + timedelta(days=random.randint(0, SIM_DAYS - 1))
            anomalous = is_mal and random.random() < 0.5
            ts = off_hour_ts(day) if anomalous else working_hour_ts(day)
            rows.append({
                "id": f"D{len(rows)+1:06d}",
                "date": ts.strftime("%Y-%m-%d %H:%M:%S"),
                "user": e["username"],
                "employee_id": e["employee_id"],
                "pc": e["pc_id"],
                "device_type": random.choice(DEVICE_TYPES),
                "activity": random.choice(["Connect", "Disconnect"]),
                "off_hours_flag": int(anomalous),
            })
    return rows


def generate_file(employees, malicious_ids):
    rows = []
    for e in employees:
        is_mal = e["employee_id"] in malicious_ids
        n_events = random.randint(10, 25)
        for _ in range(n_events):
            day = START_DATE + timedelta(days=random.randint(0, SIM_DAYS - 1))
            sensitive_access = is_mal and random.random() < 0.4
            ts = off_hour_ts(day) if sensitive_access else working_hour_ts(day)
            fname = random.choice(FILE_TYPES_SENSITIVE) if sensitive_access else random.choice(FILE_TYPES_NORMAL)
            action = random.choice(["Open", "Copy", "Rename", "Write"])
            if sensitive_access and random.random() < 0.5:
                action = "Copy"  # exfil-like behavior
            rows.append({
                "id": f"F{len(rows)+1:06d}",
                "date": ts.strftime("%Y-%m-%d %H:%M:%S"),
                "user": e["username"],
                "employee_id": e["employee_id"],
                "pc": e["pc_id"],
                "filename": fname,
                "activity": action,
                "sensitive_flag": int(fname in FILE_TYPES_SENSITIVE),
                "off_hours_flag": int(sensitive_access),
            })
    return rows


def generate_email(employees, malicious_ids):
    rows = []
    ext_domains = ["gmail.com", "yahoo.com", "outlook.com", "protonmail.com"]
    for e in employees:
        is_mal = e["employee_id"] in malicious_ids
        n_events = random.randint(15, 40)
        for _ in range(n_events):
            day = START_DATE + timedelta(days=random.randint(0, SIM_DAYS - 1))
            to_external = is_mal and random.random() < 0.3
            ts = off_hour_ts(day) if to_external else working_hour_ts(day)
            if to_external:
                recipient = f"{random.choice(FIRST_NAMES).lower()}@{random.choice(ext_domains)}"
                size_kb = random.randint(2000, 15000)  # large attachment
                has_attachment = 1
            else:
                other = random.choice(employees)
                recipient = f"{other['username']}@company-intranet.local"
                size_kb = random.randint(5, 500)
                has_attachment = random.choice([0, 0, 1])
            rows.append({
                "id": f"E{len(rows)+1:06d}",
                "date": ts.strftime("%Y-%m-%d %H:%M:%S"),
                "user": e["username"],
                "employee_id": e["employee_id"],
                "to": recipient,
                "external_flag": int(to_external),
                "size_kb": size_kb,
                "has_attachment": has_attachment,
                "off_hours_flag": int(to_external),
            })
    return rows


def generate_http(employees, malicious_ids):
    rows = []
    for e in employees:
        is_mal = e["employee_id"] in malicious_ids
        n_events = random.randint(30, 80)
        for _ in range(n_events):
            day = START_DATE + timedelta(days=random.randint(0, SIM_DAYS - 1))
            suspicious = is_mal and random.random() < 0.25
            ts = off_hour_ts(day) if suspicious else working_hour_ts(day)
            domain = random.choice(DOMAINS_SUSPICIOUS) if suspicious else random.choice(DOMAINS_NORMAL)
            rows.append({
                "id": f"H{len(rows)+1:06d}",
                "date": ts.strftime("%Y-%m-%d %H:%M:%S"),
                "user": e["username"],
                "employee_id": e["employee_id"],
                "pc": e["pc_id"],
                "url_domain": domain,
                "suspicious_flag": int(suspicious),
                "off_hours_flag": int(suspicious),
            })
    return rows


def write_csv(path, rows, fieldnames):
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main():
    employees = make_employees()
    malicious_ids = pick_malicious(employees)

    write_csv(os.path.join(OUT_DIR, "employees.csv"), employees,
              ["employee_id","username","full_name","department","role","hire_date","pc_id"])

    logon_rows = generate_logon(employees, malicious_ids)
    write_csv(os.path.join(OUT_DIR, "logon.csv"), logon_rows,
              ["id","date","user","employee_id","pc","activity","off_hours_flag"])

    device_rows = generate_device(employees, malicious_ids)
    write_csv(os.path.join(OUT_DIR, "device.csv"), device_rows,
              ["id","date","user","employee_id","pc","device_type","activity","off_hours_flag"])

    file_rows = generate_file(employees, malicious_ids)
    write_csv(os.path.join(OUT_DIR, "file.csv"), file_rows,
              ["id","date","user","employee_id","pc","filename","activity","sensitive_flag","off_hours_flag"])

    email_rows = generate_email(employees, malicious_ids)
    write_csv(os.path.join(OUT_DIR, "email.csv"), email_rows,
              ["id","date","user","employee_id","to","external_flag","size_kb","has_attachment","off_hours_flag"])

    http_rows = generate_http(employees, malicious_ids)
    write_csv(os.path.join(OUT_DIR, "http.csv"), http_rows,
              ["id","date","user","employee_id","pc","url_domain","suspicious_flag","off_hours_flag"])

    labels = [{"employee_id": e["employee_id"], "username": e["username"],
               "label": "malicious" if e["employee_id"] in malicious_ids else "normal"}
              for e in employees]
    write_csv(os.path.join(OUT_DIR, "labels.csv"), labels, ["employee_id","username","label"])

    print(f"Generated {len(employees)} employees ({N_MALICIOUS} flagged malicious for training).")
    print(f"logon={len(logon_rows)} device={len(device_rows)} file={len(file_rows)} "
          f"email={len(email_rows)} http={len(http_rows)} rows")
    print(f"Files written to ./{OUT_DIR}/")


if __name__ == "__main__":
    main()
