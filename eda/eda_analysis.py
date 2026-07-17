import os
import csv
from collections import Counter, defaultdict
from datetime import datetime

# Setup paths
CERT_DIR = r"d:\insider-threat-behavioral-intelligence-system\dataset\CERT Insider Threat Dataset"
DEVICE_PATH = os.path.join(CERT_DIR, "r4.2", "device.csv")
LOGON_PATH = os.path.join(CERT_DIR, "r4.2", "logon.csv")
PSYCHOMETRIC_PATH = os.path.join(CERT_DIR, "r4.2", "psychometric.csv")
LDAP_DIR = os.path.join(CERT_DIR, "r4.2", "LDAP")
INSIDERS_PATH = os.path.join(CERT_DIR, "answers", "insiders.csv")
LANL_PATH = r"d:\insider-threat-behavioral-intelligence-system\dataset\LANL Cyber Security Dataset\small_auth.csv"

# Output dict
report = {}

# 1. ANALYZE INSIDERS (ANSWERS)
print("Analyzing insiders.csv...")
insider_users = set()
insider_scenarios = defaultdict(list)
total_insider_records = 0

with open(INSIDERS_PATH, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        total_insider_records += 1
        user = row['user']
        insider_users.add(user)
        insider_scenarios[row['scenario']].append(user)

report['insiders'] = {
    'total_records': total_insider_records,
    'unique_insiders': len(insider_users),
    'scenarios_distribution': {scen: len(users) for scen, users in insider_scenarios.items()},
    'list_of_insiders': sorted(list(insider_users))
}

# 2. ANALYZE LDAP (EMPLOYEES)
print("Analyzing LDAP folder...")
ldap_files = sorted(os.listdir(LDAP_DIR))
report['ldap'] = {
    'total_ldap_files': len(ldap_files),
    'files': ldap_files
}

# Let's inspect the first LDAP file (e.g. 2010-01.csv) to get employee info
ldap_jan_path = os.path.join(LDAP_DIR, "2010-01.csv")
departments = Counter()
roles = Counter()
supervisors = Counter()
ldap_users = {}

with open(ldap_jan_path, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        uid = row['user_id']
        ldap_users[uid] = row
        departments[row['department']] += 1
        roles[row['role']] += 1
        supervisors[row['supervisor']] += 1

report['ldap']['jan_2010_stats'] = {
    'total_employees': len(ldap_users),
    'departments': dict(departments.most_common(10)),
    'roles': dict(roles.most_common(10)),
    'supervisors_top_5': dict(supervisors.most_common(5))
}

# Check how many insiders are present in Jan 2010 LDAP
insiders_in_ldap = [u for u in insider_users if u in ldap_users]
report['ldap']['insiders_present_in_jan_2010'] = len(insiders_in_ldap)

# 3. ANALYZE PSYCHOMETRIC (OCEAN personality scores)
print("Analyzing psychometric.csv...")
psychometrics = {}
ocean_stats = {'O': [], 'C': [], 'E': [], 'A': [], 'N': []}
insider_ocean_stats = {'O': [], 'C': [], 'E': [], 'A': [], 'N': []}
normal_ocean_stats = {'O': [], 'C': [], 'E': [], 'A': [], 'N': []}

with open(PSYCHOMETRIC_PATH, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        uid = row['user_id']
        scores = {k: int(row[k]) for k in ['O', 'C', 'E', 'A', 'N']}
        psychometrics[uid] = scores
        for k in ['O', 'C', 'E', 'A', 'N']:
            ocean_stats[k].append(scores[k])
            if uid in insider_users:
                insider_ocean_stats[k].append(scores[k])
            else:
                normal_ocean_stats[k].append(scores[k])

def compute_mean_std(lst):
    if not lst:
        return {'mean': 0, 'std': 0}
    n = len(lst)
    mean = sum(lst) / n
    variance = sum((x - mean) ** 2 for x in lst) / n
    std = variance ** 0.5
    return {'mean': round(mean, 2), 'std': round(std, 2)}

report['psychometric'] = {
    'total_records': len(psychometrics),
    'overall_averages': {k: compute_mean_std(ocean_stats[k]) for k in ['O', 'C', 'E', 'A', 'N']},
    'insider_averages': {k: compute_mean_std(insider_ocean_stats[k]) for k in ['O', 'C', 'E', 'A', 'N']},
    'normal_averages': {k: compute_mean_std(normal_ocean_stats[k]) for k in ['O', 'C', 'E', 'A', 'N']}
}

# 4. ANALYZE LOGON EVENTS
print("Analyzing logon.csv...")
logon_activities = Counter()
logon_by_hour = Counter()
logon_by_dayofweek = Counter()  # 0=Monday, 6=Sunday
after_hours_logons = 0  # outside 8 AM - 6 PM (8:00 to 18:00)
weekend_logons = 0
total_logons = 0

# Check insiders' logons
insider_logon_count = 0
normal_logon_count = 0

with open(LOGON_PATH, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        total_logons += 1
        user = row['user']
        activity = row['activity']
        logon_activities[activity] += 1
        
        # Parse date: '01/02/2010 06:49:00'
        try:
            dt = datetime.strptime(row['date'], '%m/%d/%Y %H:%M:%S')
            hour = dt.hour
            dayofweek = dt.weekday()
            logon_by_hour[hour] += 1
            logon_by_dayofweek[dayofweek] += 1
            
            # Check weekend (Saturday = 5, Sunday = 6)
            if dayofweek in [5, 6]:
                weekend_logons += 1
            
            # Check after-hours (before 8:00 AM or after 6:00 PM)
            if hour < 8 or hour >= 18:
                after_hours_logons += 1
        except Exception as e:
            pass
        
        if user in insider_users:
            insider_logon_count += 1
        else:
            normal_logon_count += 1

report['logon'] = {
    'total_events': total_logons,
    'activities': dict(logon_activities),
    'hourly_distribution': dict(sorted(logon_by_hour.items())),
    'day_of_week_distribution': dict(sorted(logon_by_dayofweek.items())),
    'after_hours_events_count': after_hours_logons,
    'after_hours_pct': round((after_hours_logons / total_logons) * 100, 2) if total_logons else 0,
    'weekend_events_count': weekend_logons,
    'weekend_pct': round((weekend_logons / total_logons) * 100, 2) if total_logons else 0,
    'insider_events_count': insider_logon_count,
    'normal_events_count': normal_logon_count
}

# 5. ANALYZE DEVICE EVENTS
print("Analyzing device.csv...")
device_activities = Counter()
device_by_hour = Counter()
device_by_user = Counter()
after_hours_device = 0
total_devices = 0

with open(DEVICE_PATH, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        total_devices += 1
        user = row['user']
        activity = row['activity']
        device_activities[activity] += 1
        device_by_user[user] += 1
        
        try:
            dt = datetime.strptime(row['date'], '%m/%d/%Y %H:%M:%S')
            hour = dt.hour
            device_by_hour[hour] += 1
            if hour < 8 or hour >= 18:
                after_hours_device += 1
        except Exception as e:
            pass

report['device'] = {
    'total_events': total_devices,
    'activities': dict(device_activities),
    'hourly_distribution': dict(sorted(device_by_hour.items())),
    'after_hours_events_count': after_hours_device,
    'after_hours_pct': round((after_hours_device / total_devices) * 100, 2) if total_devices else 0,
    'top_users': dict(device_by_user.most_common(10))
}

# 6. ANALYZE LANL CYBER SECURITY (small_auth.csv)
print("Analyzing small_auth.csv...")
lanl_orientations = Counter()
lanl_success_fail = Counter()
lanl_authtypes = Counter()
lanl_logontypes = Counter()
lanl_src_computers = Counter()
lanl_dst_computers = Counter()
lanl_src_users = Counter()
total_lanl = 0

with open(LANL_PATH, mode='r', encoding='utf-8') as f:
    reader = csv.reader(f)
    for row in reader:
        total_lanl += 1
        if len(row) < 9:
            continue
        time_sec = row[0]
        src_user = row[1]
        dst_user = row[2]
        src_comp = row[3]
        dst_comp = row[4]
        auth_type = row[5]
        logon_type = row[6]
        orientation = row[7]
        success_fail = row[8]
        
        lanl_orientations[orientation] += 1
        lanl_success_fail[success_fail] += 1
        lanl_authtypes[auth_type] += 1
        lanl_logontypes[logon_type] += 1
        lanl_src_computers[src_comp] += 1
        lanl_dst_computers[dst_comp] += 1
        lanl_src_users[src_user] += 1

report['lanl'] = {
    'total_events': total_lanl,
    'orientations': dict(lanl_orientations),
    'status': dict(lanl_success_fail),
    'auth_types': dict(lanl_authtypes),
    'logon_types': dict(lanl_logontypes),
    'unique_src_users': len(lanl_src_users),
    'unique_src_computers': len(lanl_src_computers),
    'unique_dst_computers': len(lanl_dst_computers),
    'top_src_users': dict(lanl_src_users.most_common(10)),
    'top_src_computers': dict(lanl_src_computers.most_common(10))
}

# Save report as a JSON file locally in the workspace
report_path = r"d:\insider-threat-behavioral-intelligence-system\eda\eda_report.json"
os.makedirs(os.path.dirname(report_path), exist_ok=True)
import json
with open(report_path, 'w', encoding='utf-8') as rf:
    json.dump(report, rf, indent=2)
print(f"\nPart 1 Analysis complete! Report saved to: {report_path}")
