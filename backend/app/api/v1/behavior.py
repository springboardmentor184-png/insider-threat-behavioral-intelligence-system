from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_roles
from app.models.behavior_profile import BehaviorProfile
from app.models.employee import Employee
from app.services.behavior_service import create_or_update_behavior_profile, get_behavior_baseline, get_login_pattern, get_work_pattern, get_device_usage, get_resource_access, get_login_anomalies, get_file_access_anomalies, get_device_anomalies, get_privilege_anomalies, get_data_exfiltration_anomalies
from app.schemas.behavior import (
    BehaviorProfileResponse,
    BehaviorGenerateResponse,
    BehaviorBaselineResponse,
    LoginPatternResponse,
    WorkPatternResponse,
    DeviceUsageResponse,
    ResourceAccessResponse,
    LoginAnomalyResponse,
    FileAccessAnomalyResponse,
    DeviceAnomalyResponse,
    PrivilegeAnomalyResponse,
    DataExfiltrationAnomalyResponse,
)

router = APIRouter()


@router.post(
    "/generate/{employee_id}",
    response_model=BehaviorGenerateResponse,
)
def generate_behavior(employee_id: UUID, db: Session = Depends(get_db)):
    create_or_update_behavior_profile(db, employee_id)

    return BehaviorGenerateResponse(
        message="Behavior profile generated successfully."
    )


@router.get(
    "/baseline/{employee_id}",
    response_model=BehaviorBaselineResponse,
    summary="Get Behavioral Baseline",
)
def get_behavior_baseline_route(employee_id: UUID, db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    return get_behavior_baseline(db, employee_id)


@router.get(
    "/login-pattern/{employee_id}",
    response_model=LoginPatternResponse,
    summary="Get Login Pattern",
)
def get_login_pattern_route(employee_id: UUID, db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    return get_login_pattern(db, employee_id)


@router.get(
    "/device-usage/{employee_id}",
    response_model=DeviceUsageResponse,
    summary="Get Device Usage",
)
def get_device_usage_route(employee_id: UUID, db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    return get_device_usage(db, employee_id)


@router.get(
    "/resource-access/{employee_id}",
    response_model=ResourceAccessResponse,
    summary="Get Resource Access",
)
def get_resource_access_route(employee_id: UUID, db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    return get_resource_access(db, employee_id)


@router.get(
    "/login-anomalies/{employee_id}",
    response_model=list[LoginAnomalyResponse],
    summary="Get Login Anomalies",
)
def get_login_anomalies_route(employee_id: UUID, db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    return get_login_anomalies(db, employee_id)


@router.get(
    "/privilege-anomalies/{employee_id}",
    response_model=list[PrivilegeAnomalyResponse],
    summary="Get Privilege Anomalies",
)
def get_privilege_anomalies_route(employee_id: UUID, db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    return get_privilege_anomalies(db, employee_id)


@router.get(
    "/data-exfiltration-anomalies/{employee_id}",
    response_model=list[DataExfiltrationAnomalyResponse],
    summary="Get Data Exfiltration Anomalies",
)
def get_data_exfiltration_anomalies_route(employee_id: UUID, db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    return get_data_exfiltration_anomalies(db, employee_id)


@router.get(
    "/file-access-anomalies/{employee_id}",
    response_model=list[FileAccessAnomalyResponse],
    summary="Get File Access Anomalies",
)
def get_file_access_anomalies_route(employee_id: UUID, db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    return get_file_access_anomalies(db, employee_id)


@router.get(
    "/device-anomalies/{employee_id}",
    response_model=list[DeviceAnomalyResponse],
    summary="Get Device Anomalies",
)
def get_device_anomalies_route(employee_id: UUID, db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    return get_device_anomalies(db, employee_id)


@router.get(
    "/work-pattern/{employee_id}",
    response_model=WorkPatternResponse,
    summary="Get Work Pattern",
)
def get_work_pattern_route(employee_id: UUID, db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    return get_work_pattern(db, employee_id)


@router.get(
    "/{employee_id}",
    response_model=BehaviorProfileResponse,
)
def get_behavior(employee_id: UUID, db: Session = Depends(get_db)):
    profile = (
        db.query(BehaviorProfile)
        .filter(BehaviorProfile.employee_id == employee_id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Behavior profile not found.",
        )

    return profile