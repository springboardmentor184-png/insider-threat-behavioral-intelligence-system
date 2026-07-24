import os
import sys
import pandas as pd
from datetime import datetime

# Add backend directory to path to import models
sys.path.append("e:\\Insider-Threat-Behavioral-Intelligence-System\\backend")
from app import create_app
from database.db import db
from models.behavior_profile import BehaviorProfile
from models.employee import Employee

PROCESSED_DIR = "e:\\Insider-Threat-Behavioral-Intelligence-System\\ml-engine\\data"

def populate_profiles():
    input_path = os.path.join(PROCESSED_DIR, "behavioral_aggregates.csv")
    if not os.path.exists(input_path):
        print(f"Aggregates file not found at {input_path}. Please run preprocessing first.")
        return False
        
    df = pd.read_csv(input_path)
    print("Syncing behavioral profiles and employee directory with the database...")

    app = create_app()
    with app.app_context():
        count = 0
        for idx, row in df.iterrows():
            code = row['employee_code']
            # Check if Employee exists
            employee = Employee.query.filter_by(employee_code=code).first()
            if not employee:
                name_parts = str(row['employee_name']).split()
                first_name = name_parts[0] if name_parts else "Unknown"
                last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else "User"
                
                # Check if email is unique or already taken to prevent collision
                email = str(row['email']) if pd.notna(row['email']) else f"{code.lower()}@dtaa.com"
                existing_email = Employee.query.filter_by(email=email).first()
                if existing_email:
                    email = f"{code.lower()}_{email}"
                
                dept = str(row['department']) if pd.notna(row['department']) else 'N/A'
                role_designation = str(row['role']) if pd.notna(row['role']) else 'Specialist'
                    
                employee = Employee(
                    employee_code=code,
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    department=dept,
                    designation=role_designation,
                    joining_date=datetime.strptime('2025-01-01', '%Y-%m-%d').date(),
                    status='ACTIVE'
                )
                db.session.add(employee)
            
            # Check if profile already exists, if so update it, otherwise create new
            profile = BehaviorProfile.query.filter_by(employee_code=code).first()
            if not profile:
                profile = BehaviorProfile(employee_code=code)
                db.session.add(profile)
                
            profile.avg_login_time = float(row['avg_login_time'])
            profile.avg_logout_time = float(row['avg_logout_time'])
            profile.login_frequency = float(row['login_frequency'])
            profile.weekend_logins = int(row['weekend_logins'])
            profile.night_logins = int(row['night_logins'])
            profile.failed_login_count = int(row['failed_logins'])
            profile.usb_usage_frequency = float(row['usb_usage'])
            profile.file_access_frequency = float(row['files_accessed'])
            profile.file_copy_frequency = float(row['large_file_transfers'])
            profile.external_email_count = int(row['external_emails'])
            profile.internal_email_count = int(row['total_emails'] - row['external_emails'])
            profile.web_browsing_frequency = float(row['web_browsing'])
            profile.suspicious_web_visits = int(row['job_search'])
            profile.department = str(row['department']) if pd.notna(row['department']) else 'N/A'
            profile.manager = str(row['manager']) if pd.notna(row['manager']) else 'N/A'
            profile.psychometric_o = int(row['O'])
            profile.psychometric_c = int(row['C'])
            profile.psychometric_e = int(row['E'])
            profile.psychometric_a = int(row['A'])
            profile.psychometric_n = int(row['N'])
            profile.last_updated = datetime.utcnow()
            count += 1
            
        db.session.commit()
        print(f"Successfully populated/updated {count} Employee and BehaviorProfile records in the database.")
    return True

if __name__ == "__main__":
    populate_profiles()
