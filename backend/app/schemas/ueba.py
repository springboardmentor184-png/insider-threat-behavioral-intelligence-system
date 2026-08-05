from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from app.models.ueba import DeviationSeverity, DriftTrend, EntityType


class BehaviorBaselineSchema(BaseModel):
    employee_id: UUID
    avg_login_hour: Optional[float] = 9.0
    avg_logout_hour: Optional[float] = 18.0
    avg_file_accesses: Optional[float] = 10.0
    avg_downloads: Optional[float] = 5.0
    avg_uploads: Optional[float] = 2.0
    avg_emails_sent: Optional[float] = 15.0
    typical_device: Optional[str] = None
    typical_browser: Optional[str] = None
    typical_os: Optional[str] = None
    typical_ip_subnet: Optional[str] = None
    working_days_count: Optional[int] = 20
    baseline_score: float = 15.0

    model_config = ConfigDict(from_attributes=True)


class PeerComparisonSchema(BaseModel):
    employee_id: UUID
    department_name: Optional[str] = None
    role_name: Optional[str] = None
    dept_avg_downloads: float
    employee_downloads: float
    download_deviation_pct: float
    dept_avg_logins: float
    employee_logins: float
    login_deviation_pct: float
    dept_avg_data_transfer: float
    employee_data_transfer: float
    data_transfer_deviation_pct: float
    is_outlier: bool
    outlier_reason: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class BehaviorDeviationSchema(BaseModel):
    deviation_category: str
    observed_value: float
    baseline_value: float
    deviation_pct: float
    severity: DeviationSeverity
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class BehaviorDriftSchema(BaseModel):
    employee_id: UUID
    week_1_score: float
    week_2_score: float
    week_3_score: float
    week_4_score: float
    drift_trend: DriftTrend
    drift_magnitude: float
    is_rapid_drift: bool

    model_config = ConfigDict(from_attributes=True)


class PredictionHistorySchema(BaseModel):
    employee_id: UUID
    predict_tomorrow: float
    predict_next_week: float
    predict_next_month: float
    prediction_method: str
    confidence_score: float
    risk_direction: str

    model_config = ConfigDict(from_attributes=True)


class EntityRiskSchema(BaseModel):
    id: str
    entity_name: str
    entity_type: str
    risk_score: float
    severity: str
    abnormal_usage_detected: bool
    correlated_users: List[str] = []
    reasons: List[str] = []
    recommendations: Optional[str] = None
    timeline_events: List[str] = []
    last_updated: Optional[str] = None


class UEBADashboardStatsSchema(BaseModel):
    total_employees_monitored: int
    behavior_drift_count: int
    high_deviations_count: int
    critical_outliers_count: int
    predicted_high_risk_count: int
    monitored_entities_count: int
    abnormal_entities_count: int
    department_peer_matrix: List[Dict[str, Any]] = []
    entities: List[EntityRiskSchema] = []
