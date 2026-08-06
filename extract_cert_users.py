import os
import zipfile
import json
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ZIP_PATH = os.path.join(BASE_DIR, "archive.zip")

def generate_cert_user_datasets():
    print(f"Reading real CERT dataset from: {ZIP_PATH}...")
    if not os.path.exists(ZIP_PATH):
        print("archive.zip not found in root directory!")
        return

    real_users = []
    try:
        with zipfile.ZipFile(ZIP_PATH, 'r') as z:
            names = z.namelist()
            logon_file = next((f for f in names if f.endswith('logon.csv')), None)
            if not logon_file:
                print("logon.csv not found inside archive.zip")
                return

            print(f"Extracting real CERT users from {logon_file}...")
            with z.open(logon_file) as f:
                df = pd.read_csv(f, nrows=100000)
                cert_users = df['user'].unique()
                print(f"Found {len(cert_users)} unique real user entities in CERT dataset!")

                # Pick top 100 real CERT users
                selected_cert_users = cert_users[:100]

                # Pre-hashed bcrypt string for "SecurePass123!"
                sample_hash = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW"

                roles = [1, 2, 3, 4] # Admin, Manager, SOC, Analyst

                for idx, user_id in enumerate(selected_cert_users, start=1):
                    clean_id = str(user_id).strip()
                    username = clean_id.lower()
                    email = f"{username}@cert.enterprise.org"
                    full_name = f"CERT User {clean_id}"
                    role_id = roles[idx % len(roles)]

                    real_users.append({
                        "id": idx,
                        "full_name": full_name,
                        "username": username,
                        "email": email,
                        "password": "SecurePass123!",
                        "hashed_password": sample_hash,
                        "google_id": None,
                        "profile_picture": f"https://api.dicebear.com/7.x/adventurer/svg?seed={username}",
                        "auth_provider": "local",
                        "email_verified": True,
                        "role_id": role_id,
                        "created_at": "2026-07-01T10:00:00.000000",
                        "last_login": "2026-07-24T12:00:00.000000"
                    })

    except Exception as e:
        print(f"Error parsing CERT archive: {e}")
        return

    # Write to cert_real_users_dataset.json
    json_path = os.path.join(BASE_DIR, "cert_real_users_dataset.json")
    with open(json_path, 'w') as f:
        json.dump(real_users, f, indent=2)
    print(f"Saved {len(real_users)} real CERT user profiles to: {json_path}")

    # Write to cert_real_users_dataset.csv
    csv_path = os.path.join(BASE_DIR, "cert_real_users_dataset.csv")
    df_users = pd.DataFrame(real_users)
    df_users.to_csv(csv_path, index=False)
    print(f"Saved {len(real_users)} real CERT user profiles to: {csv_path}")

    # Write to cert_real_users_dataset.sql
    sql_path = os.path.join(BASE_DIR, "cert_real_users_dataset.sql")
    with open(sql_path, 'w') as f:
        f.write("-- Real CERT Dataset User Profiles INSERT Script\n\n")
        for u in real_users:
            sql = f"INSERT INTO users (id, full_name, username, email, password, auth_provider, email_verified, role_id) VALUES ({u['id']}, '{u['full_name']}', '{u['username']}', '{u['email']}', '{u['hashed_password']}', 'local', True, {u['role_id']});\n"
            f.write(sql)
    print(f"Saved SQL insert statements to: {sql_path}")

if __name__ == "__main__":
    generate_cert_user_datasets()
