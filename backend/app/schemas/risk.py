from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from app.models.risk import RiskLevel


class RiskAssessmentResponse(BaseModel):
    id: UUID
    employee_id: UUID
    employee_name: Optional[str] = None
    department_name: Optional[str] = None
    risk_score: float = Field(..., ge=0.0, le=100.0)
    risk_level: RiskLevel
    anomaly_score: float = 0.0
    privilege_score: float = 0.0
    data_access_score: float = 0.0
    access_pattern_score: float = 0.0
    history_score: float = 0.0
    confidence_score: float = 1.0
    reasons: List[str] = []
    triggering_events: List[str] = []
    recommendation: Optional[str] = None
    risk_trend: str = "STABLE"
    anomaly_detected: bool = False
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class RiskHistoryItem(BaseModel):
    id: UUID
    risk_score: float
    risk_level: RiskLevel
    anomaly_score: float
    privilege_score: float
    data_access_score: float
    access_pattern_score: float
    history_score: float
    confidence_score: float
    risk_trend: str
    timestamp: Optional[str] = None


class TopRiskEmployeeItem(BaseModel):
    employee_id: str
    employee_code: str
    employee_name: str
    email: str
    department_name: str
    job_title: str
    risk_score: float
    risk_level: RiskLevel
    anomaly_score: float
    privilege_score: float
    data_access_score: float
    access_pattern_score: float
    history_score: float
    confidence_score: float
    reasons: List[str]
    recommendation: Optional[str]
    risk_trend: str
    last_assessed: Optional[str]


class DepartmentRiskItem(BaseModel):
    department_name: str
    avg_risk: float
    employee_count: int
    high_risk_count: int


class RiskDashboardStats(BaseModel):
    total_employees: int
    average_risk: float
    critical_employees: int
    high_risk_employees: int
    medium_risk_employees: int
    low_risk_employees: int
    today_new_risks: int
    risk_distribution: Dict[str, int]
    department_risk: List[DepartmentRiskItem] = []
    top_risk_employees: List[TopRiskEmployeeItem] = []


class RecalculateResponse(BaseModel):
    message: str
    employee_id: UUID
    new_risk_score: float
    new_risk_level: RiskLevel
