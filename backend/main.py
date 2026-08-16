from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
import sqlite3
import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from database import get_db_connection, init_db, DB_PATH
load_dotenv()
app = FastAPI(title="Insider Threat Behavioral Intelligence System API")


# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local development and testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ActivityCreate(BaseModel):
    employee_id: str
    activity_type: str
    description: str
    severity: str  # Low, Medium, High, Critical
    risk_score_contribution: float

class AlertUpdate(BaseModel):
    status: str | None = None
    assigned_analyst: str | None = None
    investigation_notes: str | None = None
class SimulateRequest(BaseModel):
    scenario: str  # critical_exfiltration, high_privilege_abuse, reset

# Helper to automatically send manager email
def send_manager_email(employee_name, employee_id, threat_type, risk_score, severity, time, reason, alert_id):
    recipient = "armeetkaurbhatia02@gmail.com"
    subject = f"⚠️ [CRITICAL ALERT] {severity} Threat Detected - User {employee_name} ({employee_id})"
    
    # HTML Email layout with a nice button to open Dashboard
    dashboard_url = f"http://localhost:5173/incident/{alert_id}"
    
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333333; line-height: 1.6; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background-color: {'#e11d48' if severity == 'Critical' else '#ea580c'}; padding: 20px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 24px; font-weight: bold;">{severity} Security Alert</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Insider Threat Intelligence System</p>
          </div>
          
          <div style="padding: 24px; background-color: #ffffff;">
            <p style="font-size: 16px; margin-top: 0;">Dear Security Manager,</p>
            <p style="font-size: 14px; color: #475569;">A high-severity behavioral anomaly has been detected for the employee below. Immediate review is recommended.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: bold; color: #64748b; width: 35%;">Employee:</td>
                <td style="padding: 10px 0; font-weight: bold; color: #0f172a;">{employee_name} ({employee_id})</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Threat Type:</td>
                <td style="padding: 10px 0; color: #0f172a;">{threat_type}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Risk Score:</td>
                <td style="padding: 10px 0; font-weight: bold; color: {'#e11d48' if severity == 'Critical' else '#ea580c'};">{risk_score} / 100</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Severity:</td>
                <td style="padding: 10px 0;"><span style="background-color: {'#ffe4e6' if severity == 'Critical' else '#ffedd5'}; color: {'#e11d48' if severity == 'Critical' else '#ea580c'}; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">{severity}</span></td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Alert Time:</td>
                <td style="padding: 10px 0; color: #0f172a;">{time}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #64748b; vertical-align: top;">Reason:</td>
                <td style="padding: 10px 0; color: #334155;">{reason}</td>
              </tr>
            </table>
            
            <div style="text-align: center; margin: 30px 0 10px 0;">
              <a href="{dashboard_url}" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(30, 58, 138, 0.3);">
                Open Executive Dashboard
              </a>
            </div>
          </div>
          
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
            This is an automated notification from the Insider Threat Intelligence SOC.
          </div>
        </div>
      </body>
    </html>
    """
    
    # Save the email content locally to SQLite for the Mock Email Inbox in the frontend
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO emails (recipient, subject, body, timestamp)
    VALUES (?, ?, ?, ?);
    """, (recipient, subject, html_content, time))
    conn.commit()
    conn.close()

    # SMTP configuration - optional real email sending if configured in environment variables
    smtp_server = os.environ.get("SMTP_SERVER")
    smtp_port = os.environ.get("SMTP_PORT")
    smtp_user = os.environ.get("SMTP_USER")
    smtp_password = os.environ.get("SMTP_PASSWORD")
    
    if smtp_server and smtp_port and smtp_user and smtp_password:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = smtp_user
            msg["To"] = recipient
            msg.attach(MIMEText(html_content, "html"))
            
            with smtplib.SMTP(smtp_server, int(smtp_port)) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.sendmail(smtp_user, recipient, msg.as_string())
        except Exception as e:
            print(f"Failed to send real SMTP email: {e}")

# Endpoints
@app.get("/api/dashboard")
def get_dashboard_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Total Users
    cursor.execute("SELECT COUNT(*) FROM employees;")
    total_users = cursor.fetchone()[0]
    
    # Total Alerts
    cursor.execute("SELECT COUNT(*) FROM alerts;")
    total_alerts = cursor.fetchone()[0]
    
    # High-Risk Users
    cursor.execute("SELECT COUNT(*) FROM employees WHERE risk_score >= 70.0;")
    high_risk_users = cursor.fetchone()[0]
    
    # Critical Incidents (Open Critical Alerts)
    cursor.execute("SELECT COUNT(*) FROM alerts WHERE severity = 'Critical' AND status != 'Resolved';")
    critical_incidents = cursor.fetchone()[0]
    
    # High Risk Employees List (Top 5)
    cursor.execute("SELECT * FROM employees ORDER BY risk_score DESC LIMIT 5;")
    high_risk_employees = [dict(row) for row in cursor.fetchall()]
    
    # Threat Trends (Group by last 7 days)
    # We will generate daily counts for the last 7 days
    trends = []
    now = datetime.now()
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        
        # Count critical/high and medium alerts for this day
        cursor.execute("""
            SELECT 
                SUM(CASE WHEN severity = 'Critical' THEN 1 ELSE 0 END) as critical,
                SUM(CASE WHEN severity = 'High' THEN 1 ELSE 0 END) as high,
                SUM(CASE WHEN severity = 'Medium' THEN 1 ELSE 0 END) as medium
            FROM alerts 
            WHERE DATE(timestamp) = ?;
        """, (day_str,))
        row = cursor.fetchone()
        
        trends.append({
            "date": day.strftime("%b %d"),
            "critical": row[0] or 0,
            "high": row[1] or 0,
            "medium": row[2] or 0,
        })
        
    conn.close()
    
    # Check alert stats by severity
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM alerts WHERE severity = 'Critical'")
    crit_count = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM alerts WHERE severity = 'High'")
    high_count = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM alerts WHERE severity = 'Medium'")
    med_count = c.fetchone()[0]
    conn.close()
    
    return {
        "stats": {
            "total_users": total_users,
            "total_alerts": total_alerts,
            "high_risk_users": high_risk_users,
            "critical_incidents": critical_incidents,
            "critical_count": crit_count,
            "high_count": high_count,
            "medium_count": med_count
        },
        "trends": trends,
        "high_risk_employees": high_risk_employees
    }

@app.get("/api/alerts")
def get_alerts(severity: str = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
        SELECT a.*, e.name as employee_name, e.department, e.privilege_level
        FROM alerts a
        JOIN employees e ON a.employee_id = e.id
    """
    params = []
    if severity:
        query += " WHERE a.severity = ?"
        params.append(severity)
        
    query += " ORDER BY a.timestamp DESC;"
    cursor.execute(query, params)
    alerts = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return alerts

@app.get("/api/alerts/{alert_id}")
def get_alert(alert_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get Alert Details
    cursor.execute("""
        SELECT a.*, e.name as employee_name, e.department, e.privilege_level, e.status as employee_status
        FROM alerts a
        JOIN employees e ON a.employee_id = e.id
        WHERE a.id = ?;
    """, (alert_id,))
    alert_row = cursor.fetchone()
    
    if not alert_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Alert not found")
        
    alert = dict(alert_row)
    
    # Get Employee's Activity Timeline
    cursor.execute("""
        SELECT * FROM activities 
        WHERE employee_id = ? 
        ORDER BY timestamp DESC;
    """, (alert["employee_id"],))
    timeline = [dict(row) for row in cursor.fetchall()]
    
    # Get other alerts for this employee
    cursor.execute("""
        SELECT id, threat_type, risk_score, severity, timestamp, status
        FROM alerts
        WHERE employee_id = ? AND id != ?
        ORDER BY timestamp DESC;
    """, (alert["employee_id"], alert_id))
    history = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    return {
        "alert": alert,
        "timeline": timeline,
        "history": history
    }

@app.put("/api/alerts/{alert_id}")
def update_alert_status(alert_id: int, payload: AlertUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM alerts WHERE id = ?;", (alert_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Alert not found")
        
    cursor.execute("""
        UPDATE alerts 
        SET status = ? 
        WHERE id = ?;
    """, (payload.status, alert_id))
    conn.commit()
    conn.close()
    return {"message": f"Alert {alert_id} status updated to {payload.status}"}

@app.get("/api/emails")
def get_emails():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM emails ORDER BY timestamp DESC;")
    emails = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return emails


@app.get("/api/employees")
def get_employees():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, name, department, privilege_level, risk_score, status
        FROM employees
        ORDER BY risk_score DESC;
    """)

    employees = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return employees


@app.get("/api/employees/{employee_id}")
def get_employee(employee_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, name, department, privilege_level, risk_score, status
        FROM employees
        WHERE id = ?;
    """, (employee_id,))

    employee = cursor.fetchone()

    if not employee:
        conn.close()
        raise HTTPException(status_code=404, detail="Employee not found")

    cursor.execute("""
        SELECT *
        FROM activities
        WHERE employee_id = ?
        ORDER BY timestamp DESC;
    """, (employee_id,))

    activities = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return {
        "employee": dict(employee),
        "activities": activities
    }

@app.get("/api/employees/{employee_id}/risk-history")
def get_employee_risk_history(employee_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Verify employee exists
    cursor.execute("""
        SELECT id, name, risk_score
        FROM employees
        WHERE id = ?;
    """, (employee_id,))

    employee = cursor.fetchone()

    if not employee:
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    # Get activities in chronological order
    cursor.execute("""
        SELECT
            id,
            timestamp,
            activity_type,
            severity,
            risk_score_contribution
        FROM activities
        WHERE employee_id = ?
        ORDER BY timestamp ASC;
    """, (employee_id,))

    activities = cursor.fetchall()

    conn.close()

    # Build cumulative risk history
    current_risk = 0.0
    history = []

    for activity in activities:
        contribution = float(
            activity["risk_score_contribution"] or 0
        )

        current_risk += contribution

        # Keep score within 0-100
        current_risk = min(current_risk, 100)

        history.append({
            "activity_id": activity["id"],
            "timestamp": activity["timestamp"],
            "activity_type": activity["activity_type"],
            "severity": activity["severity"],
            "risk_contribution": contribution,
            "risk_score": round(current_risk, 2)
        })

    return {
        "employee_id": employee["id"],
        "employee_name": employee["name"],
        "current_risk_score": employee["risk_score"],
        "history": history
    }

@app.get("/api/activities")
def get_activities(employee_id: str = None, severity: str = None):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT
            a.*,
            e.name AS employee_name,
            e.department,
            e.privilege_level
        FROM activities a
        JOIN employees e ON a.employee_id = e.id
    """

    conditions = []
    params = []

    if employee_id:
        conditions.append("a.employee_id = ?")
        params.append(employee_id)

    if severity:
        conditions.append("a.severity = ?")
        params.append(severity)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY a.timestamp DESC;"

    cursor.execute(query, params)

    activities = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return activities




@app.post("/api/activities")
def create_activity(activity: ActivityCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verify employee exists
    cursor.execute("SELECT name, risk_score FROM employees WHERE id = ?;", (activity.employee_id,))
    emp_row = cursor.fetchone()
    if not emp_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Employee not found")
        
    emp_name, current_risk = emp_row
    
    # Insert new activity
    now_str = datetime.now().isoformat()
    cursor.execute("""
        INSERT INTO activities (employee_id, timestamp, activity_type, description, severity, risk_score_contribution)
        VALUES (?, ?, ?, ?, ?, ?);
    """, (activity.employee_id, now_str, activity.activity_type, activity.description, activity.severity, activity.risk_score_contribution))
    
    # Calculate new risk score
    # Formula: current risk + contribution, capped between 0 and 100
    new_risk = min(100.0, max(0.0, current_risk + activity.risk_score_contribution))
    
    cursor.execute("""
        UPDATE employees 
        SET risk_score = ? 
        WHERE id = ?;
    """, (new_risk, activity.employee_id))
    
    # Determine alert trigger
    alert_triggered = False
    alert_id = None
    alert_severity = None
    threat_type = "Insider Threat"
    reason = activity.description
    
    # If activity is High or Critical, or risk score crosses a threshold, trigger alert
    if activity.severity in ["High", "Critical"] or new_risk >= 70.0:
        alert_triggered = True
        alert_severity = "Critical" if (new_risk >= 90.0 or activity.severity == "Critical") else "High"
        
        # Threat type categorization
        if "download" in activity.description.lower() or "transfer" in activity.description.lower() or "exfil" in activity.description.lower():
            threat_type = "Data Exfiltration Risk"
        elif "privilege" in activity.description.lower() or "admin" in activity.description.lower() or "permission" in activity.description.lower():
            threat_type = "Privilege Abuse Anomaly"
        elif "login" in activity.description.lower() or "ip" in activity.description.lower() or "vpn" in activity.description.lower():
            threat_type = "Compromised Credentials"
        else:
            threat_type = "Behavioral Threat Activity"
            
        # Create Alert
        cursor.execute("""
            INSERT INTO alerts (employee_id, threat_type, risk_score, severity, timestamp, reason, status)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        """, (activity.employee_id, threat_type, round(new_risk, 2), alert_severity, now_str, reason, "Open"))
        alert_id = cursor.lastrowid
        
    conn.commit()
    conn.close()
    
    # Send Email automatically to Manager for High and Critical alerts after connection is committed and closed
    if alert_triggered:
        send_manager_email(
            employee_name=emp_name,
            employee_id=activity.employee_id,
            threat_type=threat_type,
            risk_score=round(new_risk, 2),
            severity=alert_severity,
            time=now_str,
            reason=reason,
            alert_id=alert_id
        )
    
    return {
        "message": "Activity logged successfully",
        "employee_new_risk": new_risk,
        "alert_triggered": alert_triggered,
        "alert_id": alert_id,
        "alert_severity": alert_severity
    }

@app.post("/api/simulate")
def run_simulation(payload: SimulateRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if payload.scenario == "reset":
        conn.close()
        init_db()
        return {"message": "Database reset to initial seeded state."}
        
    elif payload.scenario == "critical_exfiltration":
        # Simulate Employee Carol Campbell (CCA0846) exfiltrating code
        # She already has 60.05 risk score
        # Log critical exfiltration activity
        # This contribution of +35.5 will push her risk to 95.55 (Critical)
        conn.close()
        result = create_activity(ActivityCreate(
            employee_id="CCA0846",
            activity_type="Data Exfiltration",
            description="Exfiltrated 85 GB of confidential Q3 financial databases and source code repository zip files to an unapproved external USB storage device.",
            severity="Critical",
            risk_score_contribution=35.5
        ))
        return {
            "message": "Critical Exfiltration Threat Simulated successfully!",
            "details": result
        }
        
    elif payload.scenario == "high_privilege_abuse":
        # Simulate Employee Edward Vance (ESC1389) abusing administrator privileges
        # He has 62.87 risk score
        # Contribution of +19.5 pushes risk score to 82.37 (High)
        conn.close()
        result = create_activity(ActivityCreate(
            employee_id="ESC1389",
            activity_type="Privilege Abuse",
            description="Unauthorized privilege modification: elevated standard access permissions on production backup server database for an external IP address.",
            severity="High",
            risk_score_contribution=19.5
        ))
        return {
            "message": "High Privilege Abuse Threat Simulated successfully!",
            "details": result
        }
        
    else:
        conn.close()
        raise HTTPException(status_code=400, detail="Unknown simulation scenario")

if __name__ == "__main__":
    import uvicorn
    # Initialize DB if database file doesn't exist
    if not os.path.exists(DB_PATH):
        init_db()
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
