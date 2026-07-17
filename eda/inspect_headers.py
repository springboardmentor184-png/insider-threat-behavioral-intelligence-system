import os
import csv
import sys

files_to_inspect = {
    "CERT - Device": r"d:\insider-threat-behavioral-intelligence-system\dataset\CERT Insider Threat Dataset\r4.2\device.csv",
    "CERT - Logon": r"d:\insider-threat-behavioral-intelligence-system\dataset\CERT Insider Threat Dataset\r4.2\logon.csv",
    "CERT - Psychometric": r"d:\insider-threat-behavioral-intelligence-system\dataset\CERT Insider Threat Dataset\r4.2\psychometric.csv",
    "CERT - File": r"d:\insider-threat-behavioral-intelligence-system\dataset\CERT Insider Threat Dataset\r4.2\file.csv",
    "CERT - LDAP (Jan 2010)": r"d:\insider-threat-behavioral-intelligence-system\dataset\CERT Insider Threat Dataset\r4.2\LDAP\2010-01.csv",
    "CERT - Insiders (Answers)": r"d:\insider-threat-behavioral-intelligence-system\dataset\CERT Insider Threat Dataset\answers\insiders.csv",
    "LANL - Small Auth": r"d:\insider-threat-behavioral-intelligence-system\dataset\LANL Cyber Security Dataset\small_auth.csv",
    "CERT - Email (Large)": r"d:\insider-threat-behavioral-intelligence-system\dataset\CERT Insider Threat Dataset\r4.2\email.csv",
    "CERT - HTTP (Huge)": r"d:\insider-threat-behavioral-intelligence-system\dataset\CERT Insider Threat Dataset\r4.2\http.csv"
}

for name, path in files_to_inspect.items():
    print("=" * 60)
    print(f"Dataset: {name}")
    print(f"Path: {path}")
    if not os.path.exists(path):
        print("Status: FILE NOT FOUND!")
        continue
    
    size_bytes = os.path.getsize(path)
    size_mb = size_bytes / (1024 * 1024)
    print(f"Size: {size_mb:.2f} MB ({size_bytes} bytes)")
    
    try:
        with open(path, mode='r', encoding='utf-8', errors='ignore') as f:
            reader = csv.reader(f)
            header = next(reader, None)
            print(f"Headers: {header}")
            
            sample = next(reader, None)
            print(f"Sample Row: {sample}")
            
            # Count rows for smaller files; for large files, count up to 5,000 rows
            count = 1  # header counted
            is_large = size_mb > 50.0
            limit = 5000 if is_large else 10000000
            
            for row in reader:
                count += 1
                if count >= limit:
                    break
            
            if is_large:
                print(f"Row count: Checked first {limit} rows (Large file)")
            else:
                print(f"Total Rows: {count}")
                
    except Exception as e:
        print(f"Error reading: {e}")
    print("=" * 60 + "\n")
