import sys
import os
import uuid
from datetime import datetime, timedelta

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database.session import SessionLocal, engine
from app.database.base import Base
from app.models.employee import Employee
from app.models.incident import (
    Alert,
    Incident,
    SOARPlaybook,
    PlaybookExecutionLog,
    AlertStatus,
    IncidentStatus,
    IncidentSeverity,
    SOARActionType,
)
from app.services.incident_service import IncidentService
from seed_db import seed_database
from seed_risk_data import seed_risk_assessments
from seed_ueba_data import seed_ueba_analytics
from seed_investigation_data import seed_investigations


def seed_incident_soar_data():
    """
    Populates initial Alerts, Incidents, SOAR Automated Response Playbooks, and Execution Logs.
    """
    print("=" * 60)
    print("Starting Incidents & SOAR Response Engine Database Seeding...")
    print("=" * 60)

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        employees = db.query(Employee).filter(Employee.is_active == True).all()
        if not employees:
            print("[!] No active employees found for incident seeding.")
            return

        # 1. Seed SOAR Playbooks
        playbooks_def = [
            {
                "name": "SOAR-PB-01: Auto Account Suspension on Critical Exfiltration",
                "desc": "Automatically locks target user account in Active Directory when risk score exceeds 85.0 or critical data exfiltration occurs.",
                "condition": "Risk Score > 85.0 OR Mass Download Detected",
                "action": SOARActionType.SUSPEND_ACCOUNT,
                "automated": True,
            },
            {
                "name": "SOAR-PB-02: Revoke Active JWT Sessions on Anomaly",
                "desc": "Immediately revokes all active bearer tokens and SSO sessions for off-hours VPN credential misuse.",
                "condition": "Off-Hours VPN Access from External IP Subnet",
                "action": SOARActionType.REVOKE_SESSIONS,
                "automated": True,
            },
            {
                "name": "SOAR-PB-03: Isolate Server & Workstation Host",
                "desc": "Isolates workstation and production server endpoints at host firewall level.",
                "condition": "Unusual Server Database Access",
                "action": SOARActionType.ISOLATE_ENTITY,
                "automated": False,
            },
            {
                "name": "SOAR-PB-04: Revoke Removable USB Mass Storage Rights",
                "desc": "Revokes USB storage device authorization across endpoint policy manager.",
                "condition": "Unauthorized USB Device Connection",
                "action": SOARActionType.REVOKE_USB,
                "automated": True,
            },
            {
                "name": "SOAR-PB-05: Dispatch High-Priority SOC Escalation",
                "desc": "Dispatches real-time security alert payload to SOC Lead and CISO on-call via Webhook / Email.",
                "condition": "Critical Alert Generated",
                "action": SOARActionType.NOTIFY_SOC,
                "automated": True,
            },
        ]

        playbook_objs = []
        for pdef in playbooks_def:
            pb = SOARPlaybook(
                id=uuid.uuid4(),
                playbook_name=pdef["name"],
                description=pdef["desc"],
                trigger_condition=pdef["condition"],
                action_type=pdef["action"],
                is_automated=pdef["automated"],
                execution_count=0,
            )
            db.add(pb)
            playbook_objs.append(pb)
        db.commit()
        print(f"[SUCCESS] Seeded {len(playbook_objs)} SOAR Automated Response Playbooks!")

        # 2. Seed Triggered Security Alerts
        alerts_def = [
            {"name": "Bulk Database Table Export", "type": "Data Exfiltration", "sev": IncidentSeverity.CRITICAL, "mod": "Activity Monitoring", "emp": employees[0]},
            {"name": "Off-Hours VPN Login from External Subnet", "type": "Unauthorized Access", "sev": IncidentSeverity.HIGH, "mod": "Threat Detection", "emp": employees[0]},
            {"name": "Mass File Download (500 MB)", "type": "Behavior Deviation", "sev": IncidentSeverity.HIGH, "mod": "UEBA Engine", "emp": employees[1] if len(employees) > 1 else employees[0]},
            {"name": "Unauthorized USB Storage Device Attached", "type": "Endpoint Anomaly", "sev": IncidentSeverity.CRITICAL, "mod": "Entity Analytics", "emp": employees[1] if len(employees) > 1 else employees[0]},
            {"name": "AI Risk Score Threshold Exceeded (82.5/100)", "type": "Risk Elevation", "sev": IncidentSeverity.HIGH, "mod": "AI Risk Engine", "emp": employees[2] if len(employees) > 2 else employees[0]},
        ]

        alert_objs = []
        for adef in alerts_def:
            alt = Alert(
                id=uuid.uuid4(),
                alert_name=adef["name"],
                alert_type=adef["type"],
                severity=adef["sev"],
                source_module=adef["mod"],
                employee_id=adef["emp"].id,
                entity_name="Workstation-01",
                status=AlertStatus.ACTIVE,
            )
            db.add(alt)
            alert_objs.append(alt)
        db.commit()
        print(f"[SUCCESS] Seeded {len(alert_objs)} active security alerts!")

        # 3. Seed Incidents and execute SOAR Playbooks
        target_emp = next((e for e in employees if e.email != "admin@insidershield.com"), employees[0])
        inc1 = IncidentService.create_incident(
            employee_id=target_emp.id,
            title="Active Insider Exfiltration & Privilege Misuse Incident",
            description="Aggregated critical alerts from Database Exfiltration and Off-Hours VPN login.",
            severity="Critical",
            assigned_team="SOC Tier-3 Incident Response",
            db=db,
        )
        inc_id1 = uuid.UUID(inc1["id"])

        # Execute automated SOAR actions for inc1
        IncidentService.execute_soar_playbook(
            action_type_str="SUSPEND_USER_ACCOUNT",
            employee_id=target_emp.id,
            incident_id=inc_id1,
            playbook_id=playbook_objs[0].id,
            db=db,
        )

        IncidentService.execute_soar_playbook(
            action_type_str="REVOKE_ACTIVE_SESSIONS",
            employee_id=target_emp.id,
            incident_id=inc_id1,
            playbook_id=playbook_objs[1].id,
            db=db,
        )

        print(f"[SUCCESS] Seeded Incident {inc1['incident_number']} and executed automated SOAR response containment actions on {target_emp.first_name} {target_emp.last_name}!")


    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error during incident seeding: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    seed_incident_soar_data()
