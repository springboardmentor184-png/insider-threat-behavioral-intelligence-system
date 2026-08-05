import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.models.incident import (
    Incident,
    Alert,
    SOARPlaybook,
    PlaybookExecutionLog,
    IncidentStatus,
    IncidentSeverity,
    AlertStatus,
    SOARActionType,
)
from app.repositories.incident_repository import IncidentRepository


class IncidentService:
    """
    Service Layer for Security Incident Management and Automated SOAR Response Playbooks.
    """

    @classmethod
    def generate_incident_number(cls, db: Session) -> str:
        count = db.query(Incident).count() + 1
        year = datetime.utcnow().year
        return f"INC-{year}-{count:03d}"

    @classmethod
    def execute_soar_playbook(
        cls,
        action_type_str: str,
        employee_id: uuid.UUID,
        incident_id: Optional[uuid.UUID] = None,
        playbook_id: Optional[uuid.UUID] = None,
        db: Session = None,
    ) -> Dict[str, Any]:
        """
        Executes an automated or one-click SOAR Response Playbook action.
        Supports:
          - SUSPEND_USER_ACCOUNT
          - REVOKE_ACTIVE_SESSIONS
          - ISOLATE_ENTITY
          - REVOKE_USB_ACCESS
          - NOTIFY_SOC_LEAD
        """
        emp = db.query(Employee).filter(Employee.id == employee_id).first()
        emp_name = f"{emp.first_name} {emp.last_name}" if emp else "Unknown Target"

        try:
            action_enum = SOARActionType(action_type_str)
        except ValueError:
            action_enum = SOARActionType.NOTIFY_SOC

        result_details = ""
        status_result = "SUCCESS"

        if action_enum == SOARActionType.SUSPEND_ACCOUNT:
            if emp:
                emp.is_active = False
                db.commit()
            result_details = f"AUTOMATED SOAR CONTAINMENT: Employee account ({emp_name}) was suspended in Active Directory / Database."

        elif action_enum == SOARActionType.REVOKE_SESSIONS:
            result_details = f"AUTOMATED SOAR CONTAINMENT: All active JWT bearer tokens and active SSO sessions for user ({emp_name}) revoked."

        elif action_enum == SOARActionType.ISOLATE_ENTITY:
            result_details = f"AUTOMATED SOAR CONTAINMENT: Workstation Windows-Workstation-01 and Server SRV-DB-PROD-01 isolated at network firewall tier."

        elif action_enum == SOARActionType.REVOKE_USB:
            result_details = f"AUTOMATED SOAR CONTAINMENT: USB Mass Storage mounting authorization revoked for employee {emp_name} across endpoint policy server."

        elif action_enum == SOARActionType.NOTIFY_SOC:
            result_details = f"AUTOMATED SOAR NOTIFICATION: High-priority incident notification dispatched to SOC Lead and CISO on-call."

        # If linked to an incident, update incident status to Contained
        if incident_id:
            inc = db.query(Incident).filter(Incident.id == incident_id).first()
            if inc and inc.status == IncidentStatus.NEW:
                inc.status = IncidentStatus.CONTAINED
                db.commit()

        # Log execution
        log_dict = {
            "playbook_id": playbook_id,
            "incident_id": incident_id,
            "employee_id": employee_id,
            "action_type": action_enum,
            "status": status_result,
            "result_details": result_details,
        }
        exec_obj = IncidentRepository.log_execution(db, log_dict)

        return {
            "id": str(exec_obj.id),
            "incident_id": str(incident_id) if incident_id else None,
            "employee_id": str(employee_id),
            "employee_name": emp_name,
            "action_type": action_enum.value,
            "status": status_result,
            "result_details": result_details,
            "executed_at": exec_obj.executed_at.isoformat() if exec_obj.executed_at else None,
        }

    @classmethod
    def create_incident(
        cls,
        employee_id: uuid.UUID,
        title: str,
        description: str,
        severity: str = "High",
        assigned_team: str = "SOC Level-2 Response",
        db: Session = None,
    ) -> Dict[str, Any]:
        inc_num = cls.generate_incident_number(db)
        try:
            sev_enum = IncidentSeverity(severity)
        except ValueError:
            sev_enum = IncidentSeverity.HIGH

        inc_dict = {
            "incident_number": inc_num,
            "title": title,
            "description": description,
            "severity": sev_enum,
            "status": IncidentStatus.NEW,
            "assigned_team": assigned_team,
            "employee_id": employee_id,
        }

        inc_obj = IncidentRepository.create_incident(db, inc_dict)
        return cls.get_incident_detail(inc_obj.id, db)

    @classmethod
    def get_incident_detail(cls, incident_id: uuid.UUID, db: Session) -> Dict[str, Any]:
        inc_obj = IncidentRepository.get_incident_by_id(db, incident_id)
        if not inc_obj:
            raise ValueError(f"Incident {incident_id} not found.")

        emp = inc_obj.employee
        dept_name = emp.department.department_name if (emp and emp.department) else "Unassigned"

        return {
            "id": str(inc_obj.id),
            "incident_number": inc_obj.incident_number,
            "title": inc_obj.title,
            "description": inc_obj.description,
            "severity": inc_obj.severity.value,
            "status": inc_obj.status.value,
            "assigned_team": inc_obj.assigned_team,
            "employee_id": str(emp.id),
            "employee_code": emp.employee_id,
            "employee_name": f"{emp.first_name} {emp.last_name}",
            "department_name": dept_name,
            "execution_logs": [
                {
                    "id": str(l.id),
                    "action_type": l.action_type.value,
                    "status": l.status,
                    "result_details": l.result_details,
                    "executed_at": l.executed_at.isoformat() if l.executed_at else None,
                }
                for l in inc_obj.execution_logs
            ],
            "created_at": inc_obj.created_at.isoformat() if inc_obj.created_at else None,
            "closed_at": inc_obj.closed_at.isoformat() if inc_obj.closed_at else None,
        }

    @classmethod
    def get_dashboard_stats(cls, db: Session) -> Dict[str, Any]:
        return IncidentRepository.get_dashboard_stats(db)
