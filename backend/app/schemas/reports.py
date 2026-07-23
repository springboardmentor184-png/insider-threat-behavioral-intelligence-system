from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class EmployeeInfo(BaseModel):
    employee_id: UUID
    employee_name: str
    email: str
    department_name: Optional[str] = None
    job_title: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class EmployeeReportResponse(BaseModel):
    employee: EmployeeInfo
    risk_score: float
    risk_level: str
    threat_level: str
    explanation: Optional[str] = None
    activities_count: int
    login_anomalies_count: int
    file_access_anomalies_count: int
    device_anomalies_count: int
    privilege_abuse_anomalies_count: int
    data_exfiltration_anomalies_count: int
    recommendation: Optional[str] = None
    last_analyzed: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DepartmentReportResponse(BaseModel):
    department_name: str
    total_employees: int
    average_risk_score: float
    high_risk_employees: int
    medium_risk_employees: int
    low_risk_employees: int
    department_risk_level: str
    recent_threat_count: int

    model_config = ConfigDict(from_attributes=True)


class RecentAnomalyItem(BaseModel):
    employee_id: UUID
    employee_name: str
    anomaly_type: str
    severity: str
    description: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedRecentAnomaliesResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    items: List[RecentAnomalyItem]

    model_config = ConfigDict(from_attributes=True)


class HighRiskReportItem(BaseModel):
    employee_id: UUID
    employee_name: str
    department: Optional[str] = None
    risk_score: float
    risk_level: str
    threat_score: float
    recommendation: Optional[str] = None
    last_analyzed: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CompanySummaryResponse(BaseModel):
    total_employees: int
    assessed_employees: int
    average_risk_score: float
    low_risk_count: int
    medium_risk_count: int
    high_risk_count: int
    critical_risk_count: int

    model_config = ConfigDict(from_attributes=True)


class ReportExportResponse(BaseModel):
    company_summary: CompanySummaryResponse
    high_risk_employees: List[HighRiskReportItem]
    recent_threats: List[HighRiskReportItem]
    recent_anomalies: List[RecentAnomalyItem]
    department_summary: List[DepartmentReportResponse]

    model_config = ConfigDict(from_attributes=True)
