from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from app.models.investigation import CaseStatus, CaseSeverity, CasePriority


class InvestigationCreateRequest(BaseModel):
    employee_id: UUID
    title: str = Field(..., min_length=3)
    description: str
    severity: str = "Medium"
    priority: str = "P3 - Moderate"
    assigned_analyst_id: Optional[UUID] = None


class InvestigationUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    priority: Optional[str] = None
    root_cause: Optional[str] = None
    resolution_summary: Optional[str] = None


class InvestigationAssignRequest(BaseModel):
    analyst_id: UUID


class InvestigationNoteRequest(BaseModel):
    comment: str = Field(..., min_length=2)
    author_name: str = "SOC Analyst"


class InvestigationStatusRequest(BaseModel):
    status: str
    root_cause: Optional[str] = None
    resolution_summary: Optional[str] = None
    performed_by: str = "SOC Analyst"


class InvestigationEvidenceSchema(BaseModel):
    id: str
    evidence_type: str
    source_module: str
    severity: str
    description: str
    linked_entity_name: Optional[str] = None
    evidence_data: Optional[Dict[str, Any]] = None
    timestamp: Optional[str] = None


class InvestigationTimelineSchema(BaseModel):
    id: str
    event_timestamp: Optional[str] = None
    event_type: str
    source_module: str
    severity: str
    description: str
    metadata: Optional[Dict[str, Any]] = None


class InvestigationNoteSchema(BaseModel):
    id: str
    author_name: str
    comment: str
    created_at: Optional[str] = None


class InvestigationAuditSchema(BaseModel):
    id: str
    action: str
    performed_by: str
    details: Optional[str] = None
    created_at: Optional[str] = None


class InvestigationQueueItemSchema(BaseModel):
    id: str
    case_number: str
    title: str
    description: Optional[str] = None
    employee_id: Optional[str] = None
    employee_code: Optional[str] = None
    employee_name: Optional[str] = "Unknown Employee"
    email: Optional[str] = None
    department_name: Optional[str] = "General"
    job_title: Optional[str] = "Staff Member"
    assigned_analyst_id: Optional[str] = None
    assigned_analyst_name: Optional[str] = "Unassigned"
    status: str
    severity: str
    priority: str
    root_cause: Optional[str] = None
    resolution_summary: Optional[str] = None
    evidence_count: int = 0
    notes_count: int = 0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    closed_at: Optional[str] = None


class InvestigationDetailSchema(BaseModel):
    id: str
    case_number: str
    title: str
    description: Optional[str] = None
    employee_id: Optional[str] = None
    employee_code: Optional[str] = None
    employee_name: Optional[str] = "Unknown Employee"
    email: Optional[str] = None
    department_name: Optional[str] = "General"
    job_title: Optional[str] = "Staff Member"
    assigned_analyst_id: Optional[str] = None
    assigned_analyst_name: Optional[str] = "Unassigned"
    status: str
    severity: str
    priority: str
    root_cause: Optional[str] = None
    resolution_summary: Optional[str] = None
    xai_summary: Dict[str, Any] = {}
    correlation_map: Dict[str, Any] = {}
    evidence: List[InvestigationEvidenceSchema] = []
    timeline: List[InvestigationTimelineSchema] = []
    notes: List[InvestigationNoteSchema] = []
    audit_logs: List[InvestigationAuditSchema] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    closed_at: Optional[str] = None



class InvestigationDashboardStatsSchema(BaseModel):
    total_cases: int
    open_cases: int
    critical_cases: int
    high_cases: int
    medium_cases: int
    low_cases: int
    escalated_cases: int
    resolved_cases: int
    resolved_today: int
    avg_investigation_time_hours: float
    severity_distribution: Dict[str, int]
    status_distribution: Dict[str, int]
    cases_by_department: List[Dict[str, Any]] = []
