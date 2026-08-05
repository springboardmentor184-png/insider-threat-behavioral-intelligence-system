import uuid
import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, Float, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base
from app.database.types import GUID


class DeviationSeverity(str, enum.Enum):
    NORMAL = "Normal"
    MINOR = "Minor"
    MODERATE = "Moderate"
    HIGH = "High"
    CRITICAL = "Critical"


class DriftTrend(str, enum.Enum):
    INCREASING = "Increasing"
    DECREASING = "Decreasing"
    STABLE = "Stable"
    RAPID_DRIFT = "Rapid Drift"


class EntityType(str, enum.Enum):
    DEVICE = "Device"
    SERVER = "Server"
    APPLICATION = "Application"
    VPN = "VPN"
    USB = "USB Device"
    IP_ADDRESS = "IP Address"
    BROWSER = "Browser"
    OPERATING_SYSTEM = "Operating System"
    CLOUD_SERVICE = "Cloud Service"


class BehaviorBaseline(Base):
    """
    Stores baseline behavior metrics for an employee aggregated from historical activity logs.
    """
    __tablename__ = "behavior_baselines"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    employee_id = Column(GUID(), ForeignKey("employees.id"), nullable=False, index=True)

    avg_login_hour = Column(Float, nullable=True, default=9.0)
    avg_logout_hour = Column(Float, nullable=True, default=18.0)
    avg_file_accesses = Column(Float, nullable=True, default=10.0)
    avg_downloads = Column(Float, nullable=True, default=5.0)
    avg_uploads = Column(Float, nullable=True, default=2.0)
    avg_emails_sent = Column(Float, nullable=True, default=15.0)
    
    typical_device = Column(String(150), nullable=True)
    typical_browser = Column(String(100), nullable=True)
    typical_os = Column(String(100), nullable=True)
    typical_ip_subnet = Column(String(50), nullable=True)
    
    working_days_count = Column(Integer, nullable=True, default=20)
    baseline_score = Column(Float, nullable=False, default=10.0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    employee = relationship("Employee", lazy="select")


class PeerComparison(Base):
    """
    Stores comparison of an employee against peers in the same Department/Role.
    """
    __tablename__ = "peer_comparisons"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    employee_id = Column(GUID(), ForeignKey("employees.id"), nullable=False, index=True)

    department_name = Column(String(100), nullable=True)
    role_name = Column(String(100), nullable=True)

    dept_avg_downloads = Column(Float, nullable=False, default=10.0)
    employee_downloads = Column(Float, nullable=False, default=10.0)
    download_deviation_pct = Column(Float, nullable=False, default=0.0)

    dept_avg_logins = Column(Float, nullable=False, default=5.0)
    employee_logins = Column(Float, nullable=False, default=5.0)
    login_deviation_pct = Column(Float, nullable=False, default=0.0)

    dept_avg_data_transfer = Column(Float, nullable=False, default=100.0) # MB
    employee_data_transfer = Column(Float, nullable=False, default=100.0)
    data_transfer_deviation_pct = Column(Float, nullable=False, default=0.0)

    is_outlier = Column(Boolean, nullable=False, default=False)
    outlier_reason = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    employee = relationship("Employee", lazy="select")


class BehaviorDeviation(Base):
    """
    Stores specific detected behavioral deviations between current activity and historical baseline.
    """
    __tablename__ = "behavior_deviations"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    employee_id = Column(GUID(), ForeignKey("employees.id"), nullable=False, index=True)

    deviation_category = Column(String(100), nullable=False) # e.g. "File Downloads", "Off-Hours Login"
    observed_value = Column(Float, nullable=False, default=0.0)
    baseline_value = Column(Float, nullable=False, default=0.0)
    deviation_pct = Column(Float, nullable=False, default=0.0)
    severity = Column(Enum(DeviationSeverity), nullable=False, default=DeviationSeverity.NORMAL)
    description = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    employee = relationship("Employee", lazy="select")


class BehaviorDrift(Base):
    """
    Monitors gradual behavioral risk changes across a 4-week window.
    """
    __tablename__ = "behavior_drifts"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    employee_id = Column(GUID(), ForeignKey("employees.id"), nullable=False, index=True)

    week_1_score = Column(Float, nullable=False, default=15.0)
    week_2_score = Column(Float, nullable=False, default=15.0)
    week_3_score = Column(Float, nullable=False, default=15.0)
    week_4_score = Column(Float, nullable=False, default=15.0)

    drift_trend = Column(Enum(DriftTrend), nullable=False, default=DriftTrend.STABLE)
    drift_magnitude = Column(Float, nullable=False, default=0.0)
    is_rapid_drift = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    employee = relationship("Employee", lazy="select")


class PredictionHistory(Base):
    """
    Short-term behavioral risk forecasting (Tomorrow, Next Week, Next Month).
    """
    __tablename__ = "prediction_histories"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    employee_id = Column(GUID(), ForeignKey("employees.id"), nullable=False, index=True)

    predict_tomorrow = Column(Float, nullable=False, default=15.0)
    predict_next_week = Column(Float, nullable=False, default=15.0)
    predict_next_month = Column(Float, nullable=False, default=15.0)

    prediction_method = Column(String(100), nullable=False, default="Weighted Linear Regression")
    confidence_score = Column(Float, nullable=False, default=0.88)
    risk_direction = Column(String(50), nullable=False, default="STABLE")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    employee = relationship("Employee", lazy="select")


class EntityBaseline(Base):
    """
    Telemetry baseline for non-user entities (Devices, Servers, Applications, VPN, USB, IPs, Cloud Services).
    """
    __tablename__ = "entity_baselines"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    entity_name = Column(String(150), nullable=False, index=True)
    entity_type = Column(Enum(EntityType), nullable=False, index=True)

    normal_access_count = Column(Float, nullable=False, default=10.0)
    normal_data_transfer_mb = Column(Float, nullable=False, default=50.0)
    typical_active_hours = Column(String(100), nullable=True, default="08:00 - 18:00")
    
    unique_users_count = Column(Integer, nullable=False, default=1)
    correlated_users = Column(JSON, nullable=True) # Array of correlated employee IDs/names

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class EntityRiskAssessment(Base):
    """
    Risk assessment score, abnormal usage flags, and recommendations for entities.
    """
    __tablename__ = "entity_risk_assessments"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    entity_name = Column(String(150), nullable=False, index=True)
    entity_type = Column(Enum(EntityType), nullable=False, index=True)

    risk_score = Column(Float, nullable=False, default=0.0, index=True)
    severity = Column(Enum(DeviationSeverity), nullable=False, default=DeviationSeverity.NORMAL)
    
    correlated_users = Column(JSON, nullable=True) # List of associated employee codes/names
    abnormal_usage_detected = Column(Boolean, nullable=False, default=False)
    
    reasons = Column(JSON, nullable=True)
    recommendations = Column(Text, nullable=True)
    timeline_events = Column(JSON, nullable=True) # Array of event timestamp + description strings

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
