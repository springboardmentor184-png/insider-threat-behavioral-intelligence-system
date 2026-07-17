import os
import csv
import sys
import time
from collections import Counter, defaultdict

# Paths
CERT_DIR = r"d:\insider-threat-behavioral-intelligence-system\dataset\CERT Insider Threat Dataset"
EMAIL_PATH = os.path.join(CERT_DIR, "r4.2", "email.csv")
HTTP_PATH = os.path.join(CERT_DIR, "r4.2", "http.csv")
INSIDERS_PATH = os.path.join(CERT_DIR, "answers", "insiders.csv")

# Load insiders
print("Loading insiders list...")
insider_users = set()
with open(INSIDERS_PATH, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        insider_users.add(row['user'])
print(f"Loaded {len(insider_users)} insiders.")

# Category definitions
JOB_KEYWORDS = ['monster.com', 'careerbuilder.com', 'indeed.com', 'simplyhired.com', 'recruiter.com', 'dice.com', 'jobsearch', 'jobhunting']
CLOUD_KEYWORDS = ['dropbox.com', 'drive.google', 'onedrive', 'box.com', 'mediafire', 'rapidshare', 'megaupload', 'icloud']
LEAK_KEYWORDS = ['wikileaks.org']

def analyze_email():
    print("\nStarting full scan of email.csv (1.30 GB)...")
    start_time = time.time()
    
    total_emails = 0
    insider_emails = 0
    external_emails = 0
    total_attachments = 0
    total_size = 0
    
    external_domains = Counter()
    user_email_counts = Counter()
    user_external_counts = Counter()
    
    # Read email.csv
    with open(EMAIL_PATH, mode='r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f)
        for row in reader:
            total_emails += 1
            if total_emails % 500000 == 0:
                print(f"  Processed {total_emails} email records...")
                sys.stdout.flush()
                
            user = row['user']
            user_email_counts[user] += 1
            
            if user in insider_users:
                insider_emails += 1
                
            # Parse size & attachments
            try:
                total_size += int(row['size'])
            except:
                pass
            try:
                total_attachments += int(row['attachments'])
            except:
                pass
                
            # Check recipients (to, cc, bcc)
            recipients = []
            for field in ['to', 'cc', 'bcc']:
                if row[field]:
                    recipients.extend(row[field].split(';'))
            
            is_external = False
            for rec in recipients:
                rec = rec.strip().lower()
                if not rec:
                    continue
                if '@' in rec:
                    domain = rec.split('@')[-1]
                    if domain != 'dtaa.com':
                        is_external = True
                        external_domains[domain] += 1
            
            if is_external:
                external_emails += 1
                user_external_counts[user] += 1

    end_time = time.time()
    duration = end_time - start_time
    print(f"Finished email.csv scan in {duration:.2f} seconds.")
    
    return {
        'total_emails': total_emails,
        'insider_emails': insider_emails,
        'normal_emails': total_emails - insider_emails,
        'external_emails': external_emails,
        'external_emails_pct': round((external_emails / total_emails) * 100, 2) if total_emails else 0,
        'total_attachments': total_attachments,
        'attachments_per_email': round(total_attachments / total_emails, 4) if total_emails else 0,
        'average_size_bytes': round(total_size / total_emails, 2) if total_emails else 0,
        'top_external_domains': dict(external_domains.most_common(15)),
        'top_email_senders': dict(user_email_counts.most_common(10)),
        'top_external_senders': dict(user_external_counts.most_common(10))
    }

def analyze_http():
    print("\nStarting full scan of http.csv (13.86 GB)...")
    start_time = time.time()
    
    total_http = 0
    insider_http = 0
    job_visits = 0
    cloud_visits = 0
    leak_visits = 0
    
    user_http_counts = Counter()
    user_job_visits = Counter()
    user_cloud_visits = Counter()
    user_leak_visits = Counter()
    
    with open(HTTP_PATH, mode='r', encoding='utf-8', errors='ignore') as f:
        reader = csv.reader(f)
        header = next(reader, None)
        
        for row in reader:
            total_http += 1
            if total_http % 1000000 == 0:
                print(f"  Processed {total_http} HTTP records...")
                sys.stdout.flush()
                
            if len(row) < 5:
                continue
            
            user = row[2]
            url = row[4].lower()
            
            user_http_counts[user] += 1
            if user in insider_users:
                insider_http += 1
                
            # Check categories
            is_job = any(k in url for k in JOB_KEYWORDS)
            is_cloud = any(k in url for k in CLOUD_KEYWORDS)
            is_leak = any(k in url for k in LEAK_KEYWORDS)
            
            if is_job:
                job_visits += 1
                user_job_visits[user] += 1
            if is_cloud:
                cloud_visits += 1
                user_cloud_visits[user] += 1
            if is_leak:
                leak_visits += 1
                user_leak_visits[user] += 1

    end_time = time.time()
    duration = end_time - start_time
    print(f"Finished http.csv scan in {duration:.2f} seconds.")
    
    return {
        'total_http_requests': total_http,
        'insider_http_requests': insider_http,
        'normal_http_requests': total_http - insider_http,
        'job_site_visits': job_visits,
        'cloud_storage_visits': cloud_visits,
        'leak_site_visits': leak_visits,
        'top_http_surfers': dict(user_http_counts.most_common(10)),
        'top_job_hunters': dict(user_job_visits.most_common(10)),
        'top_cloud_uploaders': dict(user_cloud_visits.most_common(10)),
        'top_leak_visitors': dict(user_leak_visits.most_common(10))
    }

# Execute analyses
email_results = analyze_email()
http_results = analyze_http()

# Load existing eda_report.json if exists to merge
import json
report_json_path = r"d:\insider-threat-behavioral-intelligence-system\eda\eda_report.json"
if os.path.exists(report_json_path):
    with open(report_json_path, 'r', encoding='utf-8') as rf:
        report = json.load(rf)
else:
    report = {}

report['email'] = email_results
report['http'] = http_results

# Write back the full report
with open(report_json_path, 'w', encoding='utf-8') as rf:
    json.dump(report, rf, indent=2)

print("\nFull EDA completed and saved to eda/eda_report.json successfully!")
