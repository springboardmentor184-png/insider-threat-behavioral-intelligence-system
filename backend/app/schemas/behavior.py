from datetime import datetime
from typing import Dict
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class BehaviorProfileBase(BaseModel):
    avg_login_hour: float | None = None
    preferred_device: str | None = None
    preferred_browser: str | None = None
    preferred_operating_system: str | None = None
    avg_daily_activities: int | None = None
    profile_score: float | None = None


class BehaviorProfileResponse(BehaviorProfileBase):
    id: UUID
    employee_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BehaviorGenerateResponse(BaseModel):
    message: str


class BehaviorBaselineResponse(BaseModel):
    employee_id: UUID
    average_login_hour: float | None = None
    average_logout_hour: float | None = None
    average_daily_logins: float
    average_file_downloads: float
    average_usb_activities: float
    average_email_activities: float

    model_config = ConfigDict(from_attributes=True)


class LoginPatternResponse(BaseModel):
    employee_id: UUID
    average_login_hour: float | None = None
    earliest_login: datetime | None = None
    latest_login: datetime | None = None
    weekday_login_distribution: Dict[str, int]
    weekend_login_count: int
    most_frequent_login_hour: int | None = None

    model_config = ConfigDict(from_attributes=True)


class DeviceUsageResponse(BaseModel):
    employee_id: UUID
    total_devices_used: int
    primary_device: str | None = None
    average_device_switches_per_day: float
    usb_activity_count: int
    external_device_usage_count: int
    trusted_device_percentage: float

    model_config = ConfigDict(from_attributes=True)


class DeviceAnomalyResponse(BaseModel):
    employee_id: UUID
    anomaly_type: str
    device_name: str | None = None
    description: str
    severity: str
    detected_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PrivilegeAnomalyResponse(BaseModel):
    employee_id: UUID
    anomaly_type: str
    description: str
    severity: str
    detected_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DataExfiltrationAnomalyResponse(BaseModel):
    employee_id: UUID
    anomaly_type: str
    description: str
    severity: str
    detected_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginAnomalyResponse(BaseModel):
    employee_id: UUID
    anomaly_type: str
    description: str
    severity: str
    detected_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FileAccessAnomalyResponse(BaseModel):
    employee_id: UUID
    anomaly_type: str
    resource_name: str | None = None
    description: str
    severity: str
    detected_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResourceAccessResponse(BaseModel):
    employee_id: UUID
    total_file_accesses: int
    average_files_per_day: float
    most_accessed_resource: str | None = None
    unique_resources: int
    access_frequency_score: float
    after_hours_access_count: int

    model_config = ConfigDict(from_attributes=True)


class WorkPatternResponse(BaseModel):
    employee_id: UUID
    average_working_hours_per_day: float
    average_active_sessions: float
    total_active_days: int
    busiest_weekday: str | None = None
    average_daily_activities: float
    consistency_score: float

    model_config = ConfigDict(from_attributes=True)