import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "insider_threat.db")
print("Database path:", db_path)

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, username, full_name, email_verified, auth_provider FROM users WHERE email LIKE '%venkatsain%' OR username LIKE '%venkatsain%'")
    users = cursor.fetchall()
    print("Found matching users:", users)
    
    cursor.execute("SELECT count(*) FROM users")
    total = cursor.fetchone()[0]
    print("Total users in DB:", total)
    conn.close()
else:
    print("Database file does not exist!")
