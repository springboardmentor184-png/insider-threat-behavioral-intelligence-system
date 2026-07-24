import os
import pandas as pd
import numpy as np
from datetime import datetime

# Define paths
RAW_DIR = "e:\\Insider-Threat-Behavioral-Intelligence-System\\datasets\\raw\\r4.2"
LDAP_DIR = os.path.join(RAW_DIR, "LDAP")
PROCESSED_DIR = "e:\\Insider-Threat-Behavioral-Intelligence-System\\ml-engine\\data"

def parse_time_to_hour(date_str):
    try:
        dt = datetime.strptime(date_str, "%m/%d/%Y %H:%M:%S")
        return dt.hour + dt.minute / 60.0, dt.weekday() >= 5, dt
    except Exception:
        return 9.0, False, None

def run_preprocessing(sample_mode=True):
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    print(f"Starting Preprocessing (Sample Mode: {sample_mode})...")

    # 1. Load LDAP to get list of users
    print("Loading LDAP user directory...")
    ldap_files = sorted([f for f in os.listdir(LDAP_DIR) if f.endswith('.csv')])
    if not ldap_files:
        print("No LDAP files found.")
        return False
    
    # Use the latest LDAP file to get active employees
    latest_ldap_path = os.path.join(LDAP_DIR, ldap_files[-1])
    ldap_df = pd.read_csv(latest_ldap_path)
    
    users = {}
    for idx, row in ldap_df.iterrows():
        uid = row['user_id']
        users[uid] = {
            'employee_code': uid,
            'employee_name': row['employee_name'],
            'email': row['email'],
            'role': row['role'],
            'department': row['department'],
            'manager': row['supervisor'],
            'logons': [],
            'logoffs': [],
            'devices': 0,
            'pcs': set(),
            'files': 0,
            'large_files': 0,
            'emails_in': 0,
            'emails_out': 0,
            'emails_external': 0,
            'web_browsing': 0,
            'job_search': 0,
            'after_hours_count': 0,
            'failed_logins': 0
        }
    
    # Load Psychometrics
    print("Loading psychometric profiles...")
    psy_path = os.path.join(RAW_DIR, "psychometric.csv")
    if os.path.exists(psy_path):
        psy_df = pd.read_csv(psy_path)
        for idx, row in psy_df.iterrows():
            uid = row['user_id']
            if uid in users:
                users[uid].update({
                    'O': int(row['O']),
                    'C': int(row['C']),
                    'E': int(row['E']),
                    'A': int(row['A']),
                    'N': int(row['N'])
                })
    else:
        for uid in users:
            users[uid].update({'O': 30, 'C': 30, 'E': 30, 'A': 30, 'N': 30})

    # 2. Process Logon.csv
    print("Processing logon activities...")
    logon_path = os.path.join(RAW_DIR, "logon.csv")
    chunk_size = 50000 if sample_mode else 200000
    limit = 100000 if sample_mode else None
    
    read_rows = 0
    for chunk in pd.read_csv(logon_path, chunksize=chunk_size):
        for idx, row in chunk.iterrows():
            uid = row['user']
            if uid in users:
                hour, is_weekend, dt = parse_time_to_hour(row['date'])
                users[uid]['pcs'].add(row['pc'])
                is_after_hours = hour < 6.0 or hour > 20.0
                if is_after_hours:
                    users[uid]['after_hours_count'] += 1
                
                if row['activity'] == 'Logon':
                    users[uid]['logons'].append((dt, hour, is_weekend))
                elif row['activity'] == 'Logoff':
                    users[uid]['logoffs'].append((dt, hour))
        read_rows += len(chunk)
        if limit and read_rows >= limit:
            break

    # 3. Process Device.csv
    print("Processing device connections...")
    device_path = os.path.join(RAW_DIR, "device.csv")
    read_rows = 0
    for chunk in pd.read_csv(device_path, chunksize=chunk_size):
        for idx, row in chunk.iterrows():
            uid = row['user']
            if uid in users:
                if row['activity'] == 'Connect':
                    users[uid]['devices'] += 1
                    hour, _, _ = parse_time_to_hour(row['date'])
                    if hour < 6.0 or hour > 20.0:
                        users[uid]['after_hours_count'] += 1
        read_rows += len(chunk)
        if limit and read_rows >= limit:
            break

    # 4. Process File.csv
    print("Processing file actions...")
    file_path = os.path.join(RAW_DIR, "file.csv")
    read_rows = 0
    for chunk in pd.read_csv(file_path, chunksize=chunk_size):
        for idx, row in chunk.iterrows():
            uid = row['user']
            if uid in users:
                users[uid]['files'] += 1
                fname = str(row['filename']).lower()
                content = str(row['content'])
                if len(content) > 600 or fname.endswith('.zip') or fname.endswith('.tar'):
                    users[uid]['large_files'] += 1
                
                hour, _, _ = parse_time_to_hour(row['date'])
                if hour < 6.0 or hour > 20.0:
                    users[uid]['after_hours_count'] += 1
        read_rows += len(chunk)
        if limit and read_rows >= limit:
            break

    # 5. Process Email.csv
    print("Processing email records...")
    email_path = os.path.join(RAW_DIR, "email.csv")
    read_rows = 0
    for chunk in pd.read_csv(email_path, chunksize=chunk_size):
        for idx, row in chunk.iterrows():
            uid = row['user']
            if uid in users:
                users[uid]['emails_out'] += 1
                to_emails = str(row['to']).split(';')
                has_external = False
                for r_email in to_emails:
                    if r_email and not r_email.strip().endswith('@dtaa.com'):
                        has_external = True
                        break
                if has_external:
                    users[uid]['emails_external'] += 1
                
                hour, _, _ = parse_time_to_hour(row['date'])
                if hour < 6.0 or hour > 20.0:
                    users[uid]['after_hours_count'] += 1
        read_rows += len(chunk)
        if limit and read_rows >= limit:
            break

    # 6. Process Http.csv
    print("Processing web browsing logs...")
    http_path = os.path.join(RAW_DIR, "http.csv")
    read_rows = 0
    for chunk in pd.read_csv(http_path, chunksize=chunk_size):
        for idx, row in chunk.iterrows():
            uid = row['user']
            if uid in users:
                users[uid]['web_browsing'] += 1
                url = str(row['url']).lower()
                if any(x in url for x in ['careerbuilder.com', 'indeed.com', 'monster.com', 'linkedin.com/jobs', 'jobsearch', 'glassdoor.com', 'simplyhired.com']):
                    users[uid]['job_search'] += 1
                
                hour, _, _ = parse_time_to_hour(row['date'])
                if hour < 6.0 or hour > 20.0:
                    users[uid]['after_hours_count'] += 1
        read_rows += len(chunk)
        if limit and read_rows >= limit:
            break

    # Compile final metrics
    print("Compiling user metrics...")
    final_records = []
    for uid, data in users.items():
        logons = data['logons']
        logoffs = data['logoffs']
        
        avg_login_time = np.mean([l[1] for l in logons]) if logons else 9.0
        avg_logout_time = np.mean([l[1] for l in logoffs]) if logoffs else 17.5
        
        total_logons = len(logons)
        weekend_logons = sum(1 for l in logons if l[2])
        night_logons = sum(1 for l in logons if l[1] < 6.0 or l[1] > 20.0)
        
        # Calculate session durations (rough pairing)
        durations = []
        for l_dt, l_h, _ in logons:
            pair = [lo[1] for lo in logoffs if lo[0] and lo[0].date() == l_dt.date()]
            if pair:
                durations.append(max(0.1, pair[0] - l_h))
        avg_duration = np.mean(durations) if durations else 8.0
        
        # Calculate failed logins simulation (a few random failures for realistic modeling)
        # Let's seed random failures based on user ID hash to make it reproducible
        np.random.seed(abs(hash(uid)) % 10000)
        failed_logins = int(np.random.poisson(0.5))
        
        final_records.append({
            'employee_code': uid,
            'employee_name': data['employee_name'],
            'email': data['email'],
            'role': data['role'],
            'department': data['department'],
            'manager': data['manager'],
            'avg_login_time': float(avg_login_time),
            'avg_logout_time': float(avg_logout_time),
            'login_frequency': float(total_logons / 30.0), # normalized over a simulated month
            'weekend_logins': int(weekend_logons),
            'night_logins': int(night_logons),
            'failed_logins': int(failed_logins),
            'usb_usage': float(data['devices']),
            'files_accessed': int(data['files']),
            'large_file_transfers': int(data['large_files']),
            'external_emails': int(data['emails_external']),
            'total_emails': int(data['emails_out']),
            'web_browsing': int(data['web_browsing']),
            'job_search': int(data['job_search']),
            'after_hours_activity': int(data['after_hours_count']),
            'unique_devices': int(len(data['pcs'])),
            'avg_session_duration': float(avg_duration),
            'O': data['O'],
            'C': data['C'],
            'E': data['E'],
            'A': data['A'],
            'N': data['N']
        })
        
    df_out = pd.DataFrame(final_records)
    output_path = os.path.join(PROCESSED_DIR, "behavioral_aggregates.csv")
    df_out.to_csv(output_path, index=False)
    print(f"Aggregation complete. Output saved to {output_path}")
    return True

if __name__ == "__main__":
    run_preprocessing(sample_mode=True)
