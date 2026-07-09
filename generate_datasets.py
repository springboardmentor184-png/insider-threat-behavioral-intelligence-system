import json
import csv
import random
import datetime
import bcrypt

# Seed lists for generating 100 diverse users
first_names = [
    "Rajesh", "Amit", "Priya", "Sunita", "Sanjay", "Elena", "Dmitry", "Olga", "Ivan", "Sofia",
    "Akira", "Kenji", "Yuki", "Hana", "Takashi", "Amara", "Chidi", "Fatima", "Olu", "Zainab",
    "Mateo", "Camila", "Santiago", "Isabella", "Diego", "Sven", "Astrid", "Lars", "Freja", "Bjorn",
    "John", "Sarah", "Michael", "Emily", "David", "Jessica", "James", "Emma", "Robert", "Ashley",
    "Chen", "Li", "Wei", "Yan", "Jun", "Hans", "Ursula", "Dieter", "Helga", "Wolfgang"
]

last_names = [
    "Patel", "Sharma", "Rao", "Joshi", "Kumar", "Ivanov", "Petrov", "Sokolov", "Smirnov", "Volkov",
    "Tanaka", "Sato", "Watanabe", "Ito", "Nakamura", "Okafor", "Chineye", "Adeleke", "Balogun", "Bello",
    "Silva", "Santos", "Gomez", "Rodriguez", "Martinez", "Hansen", "Nielsen", "Larsson", "Johansson", "Olsson",
    "Smith", "Jones", "Miller", "Davis", "Wilson", "Taylor", "Anderson", "Thomas", "White", "Harris",
    "Wang", "Zhang", "Liu", "Chen", "Yang", "Muller", "Schmidt", "Schneider", "Fischer", "Weber"
]

domains = ["company.com", "intel.org", "cybersec.net", "springboard.io", "gmail.com", "yahoo.com", "outlook.com"]
countries = ["India", "Russia", "Japan", "Nigeria", "Brazil", "Sweden", "USA", "China", "Germany", "UK"]
providers = ["local", "google"]
roles = [1, 2, 3, 4]  # 1: Admin, 2: Manager, 3: SOC, 4: Analyst

users_data = []

# Fixed seed for reproducibility
random.seed(42)

for i in range(1, 101):
    fn = random.choice(first_names)
    ln = random.choice(last_names)
    name = f"{fn} {ln}"
    username = f"{fn.lower()}_{ln.lower()}{random.randint(10, 99)}"
    domain = random.choice(domains)
    email = f"{fn.lower()}.{ln.lower()}{random.randint(1, 9)}@{domain}"
    
    password = f"SecurePass{random.randint(100, 999)}!"
    provider = random.choice(providers)
    google_id = f"10029{random.randint(10000, 99999)}" if provider == "google" else None
    
    verified = random.choice([True, False]) if provider == "local" else True
    
    # Created date over the last 30 days
    created_days_ago = random.randint(1, 30)
    created_date = datetime.datetime.utcnow() - datetime.timedelta(days=created_days_ago)
    
    # Last login within the last 5 days
    login_days_ago = random.randint(0, min(5, created_days_ago))
    last_login = created_date + datetime.timedelta(days=login_days_ago)
    
    pic_url = f"https://api.dicebear.com/7.x/adventurer/svg?seed={username}"
    role_id = random.choice(roles)
    
    users_data.append({
        "id": i,
        "full_name": name,
        "username": username,
        "email": email,
        "password": password,
        "google_id": google_id,
        "profile_picture": pic_url,
        "auth_provider": provider,
        "email_verified": verified,
        "role_id": role_id,
        "created_at": created_date.isoformat(),
        "last_login": last_login.isoformat()
    })

# 1. Output JSON File
with open("mock_users_dataset.json", "w") as f:
    json.dump(users_data, f, indent=2)

# 2. Output CSV File
with open("mock_users_dataset.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow([
        "id", "full_name", "username", "email", "password", 
        "google_id", "profile_picture", "auth_provider", "email_verified", 
        "role_id", "created_at", "last_login"
    ])
    for u in users_data:
        writer.writerow([
            u["id"], u["full_name"], u["username"], u["email"], u["password"],
            u["google_id"], u["profile_picture"], u["auth_provider"], int(u["email_verified"]),
            u["role_id"], u["created_at"], u["last_login"]
        ])

# 3. Output SQL Insert Scripts
with open("mock_users_dataset.sql", "w") as f:
    f.write("-- SQL INSERT SCRIPT FOR 100 SAMPLE USERS\n")
    f.write("DELETE FROM users;\n")
    for u in users_data:
        # Hash password in the SQL script
        pwd_bytes = u["password"].encode('utf-8')
        hashed = bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode('utf-8')
        
        google_id_str = f"'{u['google_id']}'" if u["google_id"] else "NULL"
        
        f.write(
            f"INSERT INTO users (full_name, username, email, hashed_password, google_id, profile_picture, auth_provider, email_verified, role_id, created_at, last_login) VALUES "
            f"('{u['full_name']}', '{u['username']}', '{u['email']}', '{hashed}', {google_id_str}, '{u['profile_picture']}', '{u['auth_provider']}', {u['email_verified']}, {u['role_id']}, '{u['created_at']}', '{u['last_login']}');\n"
        )

# 4. Output python seeding code
with open("backend/app/seed_users_postgres.py", "w") as f:
    f.write('''# Auto-generated database seeding scripts
from sqlalchemy.orm import Session
from app.models.models import User
from app.core.security import get_password_hash
import json
import os

def seed_100_users(db: Session):
    if db.query(User).count() > 5:
        # Dataset already loaded
        return
        
    json_path = "mock_users_dataset.json"
    if not os.path.exists(json_path):
        return
        
    with open(json_path, "r") as f:
        users = json.load(f)
        
    for u in users:
        # Verify user does not exist
        if db.query(User).filter(User.email == u["email"]).first():
            continue
            
        db_user = User(
            full_name=u["full_name"],
            username=u["username"],
            email=u["email"],
            hashed_password=get_password_hash(u["password"]),
            google_id=u["google_id"],
            profile_picture=u["profile_picture"],
            auth_provider=u["auth_provider"],
            email_verified=u["email_verified"],
            role_id=u["role_id"]
        )
        db.add(db_user)
    db.commit()
    print("Successfully seeded 100 diverse mock users.")
''')

print("Mock datasets (JSON, CSV, SQL) and Python seed scripts generated successfully.")
