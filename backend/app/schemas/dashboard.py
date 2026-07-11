from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any, Optional

class DashboardOverview(BaseModel):
    employees: int
    activities: int
    risk: float
    departments: int

class RiskSummaryResponse(BaseModel):
    low: int
    medium: int
    high: int
    critical: int
    average_risk_score: float
    highest_risk_employee: Optional[Dict[str, Any]] = None

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
