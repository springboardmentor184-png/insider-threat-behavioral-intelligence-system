from datetime import date, datetime
from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any, Optional

class DashboardOverview(BaseModel):
    employees: int
    activities: int
    risk: float
    departments: int

class RiskOverviewResponse(BaseModel):
    total_assessments: int
    average_risk_score: float
    low: int
    medium: int
    high: int
    critical: int

    model_config = ConfigDict(from_attributes=True)

class RiskSummaryResponse(BaseModel):
    low: int
    medium: int
    high: int
    critical: int
    average_risk_score: float
    highest_risk_employee: Optional[Dict[str, Any]] = None

class TopRiskEmployeeResponse(BaseModel):
    employee_id: str
    full_name: str
    risk_score: float
    risk_level: str

    model_config = ConfigDict(from_attributes=True)

class EmployeeRiskResponse(BaseModel):
    employee_id: str
    employee_name: str
    risk_score: float
    risk_level: str
    anomaly_detected: bool
    risk_reason: Optional[str] = None
    confidence_score: Optional[float] = None
    recommendation: Optional[str] = None
    last_analyzed: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class EmployeeExplanationResponse(BaseModel):
    employee_id: str
    employee_name: str
    risk_level: str
    risk_score: float
    explanation: str
    recommendation: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class CompanyRiskResponse(BaseModel):
    total_employees: int
    assessed_employees: int
    average_risk_score: float
    high_risk_count: int
    critical_risk_count: int
    anomaly_count: int

    model_config = ConfigDict(from_attributes=True)

class DepartmentRiskResponse(BaseModel):
    department_name: str
    employee_count: int
    average_risk_score: float
    high_risk_count: int
    critical_risk_count: int

    model_config = ConfigDict(from_attributes=True)

class RiskTrendResponse(BaseModel):
    date: date
    average_risk_score: float

    model_config = ConfigDict(from_attributes=True)

class RecentAlertResponse(BaseModel):
    employee_id: str
    employee_name: str
    risk_level: str
    risk_score: float
    anomaly_detected: bool
    risk_reason: Optional[str] = None
    last_analyzed: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ActivitySummaryResponse(BaseModel):
    today_activity: int
    last_7_days: int
    last_30_days: int
    most_common_activity: Optional[str] = None
    peak_login_hour: Optional[str] = None

class ChartDataResponse(BaseModel):
    weekly_activity: List[Dict[str, Any]]
    monthly_activity: List[Dict[str, Any]]
    risk_distribution: List[Dict[str, Any]]
    department_distribution: List[Dict[str, Any]]
    login_trend: List[Dict[str, Any]]
