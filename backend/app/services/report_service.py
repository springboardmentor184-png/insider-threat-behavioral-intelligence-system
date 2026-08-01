import csv
import io
from sqlalchemy.orm import Session
from app.models.employee import Employee
from app.models.alert import Alert
from app.models.incident import Incident
from app.models.audit_log import AuditLog

def generate_risk_report_csv(db: Session):
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["Employee ID", "Full Name", "Email", "Department", "Designation", "Manager", "Risk Score", "Risk Category", "Status"])
    
    # Fetch employees
    employees = db.query(Employee).all()
    for emp in employees:
        score = emp.risk_score
        category = "Critical" if score >= 80 else ("High" if score >= 60 else ("Medium" if score >= 30 else "Low"))
        status = "Active" if emp.is_active else "Inactive"
        writer.writerow([emp.employee_id, emp.full_name, emp.email, emp.department, emp.designation, emp.manager, score, category, status])
        
    return output.getvalue()

def generate_alerts_report_csv(db: Session):
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["Alert ID", "Employee ID", "Title", "Description", "Severity", "Status", "Category", "Timestamp", "Assigned To"])
    
    # Fetch alerts
    alerts = db.query(Alert).order_by(Alert.timestamp.desc()).all()
    for alert in alerts:
        writer.writerow([alert.id, alert.employee_id, alert.title, alert.description, alert.severity, alert.status, alert.category, alert.timestamp.isoformat(), alert.assigned_to or "Unassigned"])
        
    return output.getvalue()

def generate_incidents_report_csv(db: Session):
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["Incident ID", "Title", "Description", "Severity", "Status", "Employee ID", "Assigned To", "Created At"])
    
    # Fetch incidents
    incidents = db.query(Incident).order_by(Incident.created_at.desc()).all()
    for inc in incidents:
        writer.writerow([inc.id, inc.title, inc.description, inc.severity, inc.status, inc.employee_id, inc.assigned_to or "Unassigned", inc.created_at.isoformat()])
        
    return output.getvalue()

def generate_audit_report_csv(db: Session):
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["Log ID", "User ID", "Action", "Status", "Description", "Timestamp"])
    
    # Fetch audit logs
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()
    for log in logs:
        writer.writerow([log.id, log.user_id or "System/Guest", log.action, log.status, log.description or "", log.timestamp.isoformat()])
        
    return output.getvalue()
