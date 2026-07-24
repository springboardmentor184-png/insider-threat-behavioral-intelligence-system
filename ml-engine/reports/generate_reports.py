import sys
from datetime import datetime

# Add path to import backend models
sys.path.append("e:\\Insider-Threat-Behavioral-Intelligence-System\\backend")
from app import create_app
from database.db import db
from models.employee import Employee
from models.behavior_profile import BehaviorProfile
from models.behavior_baseline import BehaviorBaseline
from models.risk_score import RiskScore
from models.anomaly import Anomaly
from models.threat_report import ThreatReport

def generate_threat_reports():
    app = create_app()
    with app.app_context():
        print("Running Automated Reports Generation Engine...")
        profiles = BehaviorProfile.query.all()
        report_count = 0
        
        for p in profiles:
            code = p.employee_code
            emp = Employee.query.filter_by(employee_code=code).first()
            emp_name = f"{emp.first_name} {emp.last_name}" if emp else "Unknown Employee"
            
            baseline = BehaviorBaseline.query.filter_by(employee_code=code).first()
            risk = RiskScore.query.filter_by(employee_code=code).first()
            anomalies = Anomaly.query.filter_by(employee_code=code).filter_by(is_anomaly=True).all()
            
            risk_val = risk.risk_score if risk else 0.0
            
            # Determine threat level
            if risk_val >= 75:
                threat_level = 'CRITICAL'
            elif risk_val >= 50:
                threat_level = 'HIGH'
            elif risk_val >= 25:
                threat_level = 'MEDIUM'
            else:
                threat_level = 'LOW'
                
            # Compile detected anomalies list
            anomaly_details = "; ".join([a.details for a in anomalies if a.details]) if anomalies else "None"
            
            # Evaluate behavior changes relative to baseline
            changes = []
            if baseline:
                # Login hour deviation
                login_diff = abs(p.avg_login_time - baseline.normal_login_hour)
                if login_diff > 1.5:
                    changes.append(f"Login time shifted by {login_diff:.1f} hours")
                    
                # USB usage deviation
                current_usb_per_day = p.usb_usage_frequency if p.usb_usage_frequency else 0.0
                if current_usb_per_day > baseline.avg_usb_per_day + 1.0:
                    changes.append(f"Increased daily USB connects (Current: {current_usb_per_day:.1f}/day, Baseline: {baseline.avg_usb_per_day:.1f}/day)")
                    
                # Files accessed deviation
                current_files_per_day = p.file_access_frequency / 30.0 if p.file_access_frequency else 0.0
                if current_files_per_day > baseline.avg_files_per_day + 5.0:
                    changes.append(f"File interactions increased by {current_files_per_day - baseline.avg_files_per_day:.1f}/day")
                    
                # Email deviation
                current_emails_per_day = (p.external_email_count + p.internal_email_count) / 30.0
                if current_emails_per_day > baseline.avg_emails_per_day + 10.0:
                    changes.append(f"Increased daily email volumes (Current: {current_emails_per_day:.1f}/day, Baseline: {baseline.avg_emails_per_day:.1f}/day)")
                    
            behavior_changes_str = ", ".join(changes) if changes else "No major deviation from historical baseline"
            
            # Generate recommendations based on threat level
            if threat_level in ['CRITICAL', 'HIGH']:
                recommendations = (
                    "1. Isolate the workstation session immediately.\n"
                    "2. Revoke write permissions to sensitive document directories.\n"
                    "3. Initiate a formal security analyst triage interview.\n"
                    "4. Monitor outbound web proxy traffic for data staging patterns."
                )
            elif threat_level == 'MEDIUM':
                recommendations = (
                    "1. Flag user for closer observation over the next 14 days.\n"
                    "2. Verify legitimacy of recent USB connects and file copy actions.\n"
                    "3. Monitor external email counts and destination domains."
                )
            else:
                recommendations = (
                    "1. Continue routine background behavioral auditing.\n"
                    "2. Retain standard baseline configurations."
                )
                
            # Create/update threat report
            rep = ThreatReport.query.filter_by(employee_code=code).order_by(ThreatReport.created_at.desc()).first()
            if not rep:
                rep = ThreatReport(employee_code=code)
                db.session.add(rep)
                
            rep.risk_score = risk_val
            rep.detected_anomalies = anomaly_details
            rep.behavior_changes = behavior_changes_str
            rep.threat_level = threat_level
            rep.recommendations = recommendations
            rep.created_at = datetime.utcnow()
            report_count += 1
            
        db.session.commit()
        print(f"Report generation complete. Generated {report_count} ThreatReport summaries in database.")
    return True

if __name__ == "__main__":
    generate_threat_reports()
