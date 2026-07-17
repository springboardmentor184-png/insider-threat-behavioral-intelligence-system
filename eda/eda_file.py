import os
import csv
from collections import Counter

CERT_DIR = r"d:\insider-threat-behavioral-intelligence-system\dataset\CERT Insider Threat Dataset"
FILE_PATH = os.path.join(CERT_DIR, "r4.2", "file.csv")
INSIDERS_PATH = os.path.join(CERT_DIR, "answers", "insiders.csv")

insider_users = set()
with open(INSIDERS_PATH, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        insider_users.add(row['user'])

print("Analyzing file.csv...")
extensions = Counter()
insider_file_events = 0
normal_file_events = 0
total_events = 0
file_pc_counts = Counter()

with open(FILE_PATH, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        total_events += 1
        filename = row['filename']
        user = row['user']
        pc = row['pc']
        
        # Get extension
        ext = os.path.splitext(filename)[1].lower() if filename else "none"
        extensions[ext] += 1
        
        if user in insider_users:
            insider_file_events += 1
        else:
            normal_file_events += 1
            
        file_pc_counts[pc] += 1

print("\n" + "=" * 60)
print("FILE ANALYSIS")
print("=" * 60)
print(f"Total file events: {total_events}")
print(f"Insider file events: {insider_file_events} ({insider_file_events/total_events*100:.2f}%)")
print(f"Normal file events: {normal_file_events} ({normal_file_events/total_events*100:.2f}%)")
print("Top 10 extensions:")
for ext, count in extensions.most_common(10):
    print(f"  {ext}: {count}")
print("Top 5 PCs for file activity:")
for pc, count in file_pc_counts.most_common(5):
    print(f"  {pc}: {count}")
print("=" * 60)
