from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class AlertSchema(BaseModel):
    id: str
    alert_name: str
    alert_type: str
    severity: str
    source_module: str
    employee_id: Optional[str] = None
    employee_name: str
    entity_name: Optional[str] = None
    status: str
    triggered_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class IncidentSchema(BaseModel):
    id: str
    incident_number: str
    title: str
    description: Optional[str] = None
    severity: str
    status: str
    assigned_team: str
    employee_id: Optional[str] = None
    employee_code: Optional[str] = None
    employee_name: str
    department_name: str
    created_at: Optional[str] = None
    closed_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SOARPlaybookSchema(BaseModel):
    id: str
    playbook_name: str
    description: Optional[str] = None
    trigger_condition: str
    action_type: str
    is_automated: bool
    execution_count: int

    model_config = ConfigDict(from_attributes=True)


class SOARExecutionRequest(BaseModel):
    action_type: str
    employee_id: UUID
    incident_id: Optional[UUID] = None
    playbook_id: Optional[UUID] = None


class PlaybookExecutionLogSchema(BaseModel):
    id: str
    incident_id: Optional[str] = None
    employee_id: Optional[str] = None
    employee_name: str
    action_type: str
    status: str
    result_details: str
    executed_at: Optional[str] = None


class IncidentDashboardStatsSchema(BaseModel):
    total_incidents: int
    new_incidents: int
    contained_incidents: int
    closed_incidents: int
    active_alerts: int
    soar_actions_executed: int
