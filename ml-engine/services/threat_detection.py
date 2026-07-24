import sys
from datetime import datetime

# Add path to import backend models
sys.path.append("e:\\Insider-Threat-Behavioral-Intelligence-System\\backend")
from app import create_app
from database.db import db
from models.behavioral_feature import BehaviorFeature
from models.employee import Employee
from models.alert import Alert

def evaluate_threats():
    app = create_app()
    with app.app_context():
        print("Running rules-based Threat Detection Engine...")
        features = BehaviorFeature.query.all()
        alert_count = 0
        
        for f in features:
            code = f.employee_code
            emp = Employee.query.filter_by(employee_code=code).first()
            emp_name = f"{emp.first_name} {emp.last_name}" if emp else "Unknown Employee"
            
            # Rule 1: Late Night Login
            if f.activity_after_hours > 20:
                # Check if alert already exists to prevent spam
                existing = Alert.query.filter_by(employee_code=code, threat_type='Late Night Login').first()
                if not existing:
                    alert = Alert(
                        employee_code=code,
                        severity='MEDIUM',
                        threat_type='Late Night Login',
                        timestamp=datetime.utcnow(),
                        status='OPEN',
                        description=f"Employee {emp_name} ({code}) has high volumes of after-hours activity ({int(f.activity_after_hours)} actions)."
                    )
                    db.session.add(alert)
                    alert_count += 1
            
            # Rule 2: Multiple Failed Logins
            if f.failed_logins >= 3:
                existing = Alert.query.filter_by(employee_code=code, threat_type='Multiple Failed Logins').first()
                if not existing:
                    alert = Alert(
                        employee_code=code,
                        severity='HIGH',
                        threat_type='Multiple Failed Logins',
                        timestamp=datetime.utcnow(),
                        status='OPEN',
                        description=f"Multiple failed logon attempts ({f.failed_logins}) detected for user account {code}."
                    )
                    db.session.add(alert)
                    alert_count += 1

            # Rule 3: Mass File Copy
            if f.mass_file_access > 40:
                existing = Alert.query.filter_by(employee_code=code, threat_type='Mass File Copy').first()
                if not existing:
                    alert = Alert(
                        employee_code=code,
                        severity='HIGH',
                        threat_type='Mass File Copy',
                        timestamp=datetime.utcnow(),
                        status='OPEN',
                        description=f"Abnormally high count of file accesses ({int(f.mass_file_access)}) logged by employee {emp_name}."
                    )
                    db.session.add(alert)
                    alert_count += 1

            # Rule 4: USB Data Theft
            if f.usb_usage > 5 and f.mass_file_access > 30:
                existing = Alert.query.filter_by(employee_code=code, threat_type='USB Data Theft').first()
                if not existing:
                    alert = Alert(
                        employee_code=code,
                        severity='CRITICAL',
                        threat_type='USB Data Theft',
                        timestamp=datetime.utcnow(),
                        status='OPEN',
                        description=f"Potential data egress alert: {emp_name} performed {int(f.mass_file_access)} file accesses and {int(f.usb_usage)} external USB connections."
                    )
                    db.session.add(alert)
                    alert_count += 1

            # Rule 5: Sensitive File Access
            if f.large_file_transfer > 8:
                existing = Alert.query.filter_by(employee_code=code, threat_type='Sensitive File Access').first()
                if not existing:
                    alert = Alert(
                        employee_code=code,
                        severity='HIGH',
                        threat_type='Sensitive File Access',
                        timestamp=datetime.utcnow(),
                        status='OPEN',
                        description=f"Large documents or compression file transfers ({int(f.large_file_transfer)}) accessed by {emp_name}."
                    )
                    db.session.add(alert)
                    alert_count += 1

            # Rule 6: External Data Transfer
            if f.external_email_ratio > 0.6 and f.activity_after_hours > 5:
                existing = Alert.query.filter_by(employee_code=code, threat_type='External Data Transfer').first()
                if not existing:
                    alert = Alert(
                        employee_code=code,
                        severity='MEDIUM',
                        threat_type='External Data Transfer',
                        timestamp=datetime.utcnow(),
                        status='OPEN',
                        description=f"High ratio of external email transmissions ({f.external_email_ratio:.1%}) combined with after-hours activity."
                    )
                    db.session.add(alert)
                    alert_count += 1

            # Rule 7: Abnormal Website Activity
            if f.job_search_websites > 4:
                existing = Alert.query.filter_by(employee_code=code, threat_type='Abnormal Website Activity').first()
                if not existing:
                    alert = Alert(
                        employee_code=code,
                        severity='LOW',
                        threat_type='Abnormal Website Activity',
                        timestamp=datetime.utcnow(),
                        status='OPEN',
                        description=f"Frequent hits on recruitment portals and job search websites ({f.job_search_websites} requests) from {emp_name}."
                    )
                    db.session.add(alert)
                    alert_count += 1

            # Rule 8: Unauthorized Login
            if f.multiple_devices > 3:
                existing = Alert.query.filter_by(employee_code=code, threat_type='Unauthorized Login').first()
                if not existing:
                    alert = Alert(
                        employee_code=code,
                        severity='MEDIUM',
                        threat_type='Unauthorized Login',
                        timestamp=datetime.utcnow(),
                        status='OPEN',
                        description=f"Logon sessions from {f.multiple_devices} different workstations detected on user credential {code}."
                    )
                    db.session.add(alert)
                    alert_count += 1
                    
        db.session.commit()
        print(f"Rules evaluation complete. Generated {alert_count} new alerts in database.")
    return True

if __name__ == "__main__":
    evaluate_threats()
