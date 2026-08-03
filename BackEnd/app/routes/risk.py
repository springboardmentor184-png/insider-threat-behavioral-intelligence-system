from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.models.models import Employee, LoginActivity, FileAccess, Alert
from app.services.risk_scoring_service import (
    build_risk_result,
    get_risk_trend
)

router = APIRouter(
    prefix="/risk",
    tags=["Risk Analysis"]
)


def get_employee_name(employee):
    if employee.name:
        return str(employee.name)

    if employee.user:
        return str(employee.user)

    return f"Employee {employee.id}"


def get_employee_identifier(employee):
    return employee.id


def get_risk_level(score):
    if score >= 80:
        return "Critical"

    if score >= 60:
        return "High"

    if score >= 35:
        return "Medium"

    return "Low"


@router.get("/analysis")
def get_risk_analysis(
    db: Session = Depends(get_db)
):
    employees = (
        db.query(Employee)
        .order_by(
            Employee.risk_score.desc()
        )
        .all()
    )

    login_counts = dict(
        db.query(
            LoginActivity.employee_id,
            func.count(
                LoginActivity.id
            )
        )
        .filter(
            LoginActivity.employee_id
            .isnot(None)
        )
        .group_by(
            LoginActivity.employee_id
        )
        .all()
    )

    file_counts = dict(
        db.query(
            FileAccess.employee_id,
            func.count(
                FileAccess.id
            )
        )
        .filter(
            FileAccess.employee_id
            .isnot(None)
        )
        .group_by(
            FileAccess.employee_id
        )
        .all()
    )

    alert_counts = dict(
        db.query(
            Alert.employee_id,
            func.count(
                Alert.id
            )
        )
        .filter(
            Alert.employee_id
            .isnot(None)
        )
        .group_by(
            Alert.employee_id
        )
        .all()
    )

    anomaly_counts = dict(
        db.query(
            LoginActivity.employee_id,
            func.count(
                LoginActivity.id
            )
        )
        .filter(
            LoginActivity.employee_id
            .isnot(None),
            LoginActivity.is_anomaly
            .is_(True)
        )
        .group_by(
            LoginActivity.employee_id
        )
        .all()
    )

    file_anomaly_counts = dict(
        db.query(
            FileAccess.employee_id,
            func.count(
                FileAccess.id
            )
        )
        .filter(
            FileAccess.employee_id
            .isnot(None),
            FileAccess.is_anomaly
            .is_(True)
        )
        .group_by(
            FileAccess.employee_id
        )
        .all()
    )

    risk_results = []

    for employee in employees:
        employee_id = (
            get_employee_identifier(
                employee
            )
        )

        employee_name = (
            get_employee_name(
                employee
            )
        )

        login_count = int(
            login_counts.get(
                employee_id,
                0
            )
        )

        file_access_count = int(
            file_counts.get(
                employee_id,
                0
            )
        )

        alert_count = int(
            alert_counts.get(
                employee_id,
                0
            )
        )

        anomaly_count = int(
            anomaly_counts.get(
                employee_id,
                0
            )
        )

        anomaly_count += int(
            file_anomaly_counts.get(
                employee_id,
                0
            )
        )

        stored_score = float(
            employee.risk_score
            or 0
        )

        stored_level = (
            employee.risk_level
            or get_risk_level(
                stored_score
            )
        )

        result = build_risk_result(
            employee_id=employee_id,
            employee_name=employee_name,
            login_count=login_count,
            file_access_count=file_access_count,
            email_count=0,
            device_count=0,
            anomaly_count=anomaly_count,
            alert_count=alert_count
        )

        calculated_score = float(
            result.get(
                "risk_score",
                0
            )
        )

        if stored_score > 0:
            final_score = round(
                stored_score,
                2
            )
        else:
            final_score = round(
                calculated_score,
                2
            )

        result[
            "employee_id"
        ] = employee_id

        result[
            "employee_name"
        ] = employee_name

        result[
            "risk_score"
        ] = final_score

        result[
            "risk_level"
        ] = stored_level

        result[
            "anomaly_score"
        ] = round(
            float(
                employee.anomaly_score
                or 0
            ),
            2
        )

        result[
            "activity_summary"
        ] = {
            "login_count": login_count,
            "file_access_count": (
                file_access_count
            ),
            "anomaly_count": (
                anomaly_count
            ),
            "alert_count": (
                alert_count
            )
        }

        risk_results.append(
            result
        )

    risk_results.sort(
        key=lambda item: float(
            item.get(
                "risk_score",
                0
            )
        ),
        reverse=True
    )

    critical_count = sum(
        1
        for item in risk_results
        if item.get(
            "risk_level"
        ) == "Critical"
    )

    high_count = sum(
        1
        for item in risk_results
        if item.get(
            "risk_level"
        ) == "High"
    )

    medium_count = sum(
        1
        for item in risk_results
        if item.get(
            "risk_level"
        ) == "Medium"
    )

    low_count = sum(
        1
        for item in risk_results
        if item.get(
            "risk_level"
        ) == "Low"
    )

    total_employees = len(
        risk_results
    )

    average_score = 0

    if total_employees > 0:
        average_score = round(
            sum(
                float(
                    item.get(
                        "risk_score",
                        0
                    )
                )
                for item
                in risk_results
            )
            / total_employees,
            2
        )

    trend_score = average_score

    if risk_results:
        trend_score = float(
            risk_results[0].get(
                "risk_score",
                average_score
            )
        )

    return {
        "summary": {
            "total_employees": (
                total_employees
            ),
            "critical_risk": (
                critical_count
            ),
            "high_risk": (
                high_count
            ),
            "medium_risk": (
                medium_count
            ),
            "low_risk": (
                low_count
            ),
            "average_risk_score": (
                average_score
            )
        },
        "risk_distribution": [
            {
                "name": "Critical",
                "value": (
                    critical_count
                )
            },
            {
                "name": "High",
                "value": (
                    high_count
                )
            },
            {
                "name": "Medium",
                "value": (
                    medium_count
                )
            },
            {
                "name": "Low",
                "value": (
                    low_count
                )
            }
        ],
        "risk_trend": (
            get_risk_trend(
                trend_score
            )
        ),
        "employees": (
            risk_results
        )
    }


@router.get(
    "/employee/{employee_id}"
)
def get_employee_risk(
    employee_id: int,
    db: Session = Depends(get_db)
):
    employee = (
        db.query(Employee)
        .filter(
            Employee.id
            == employee_id
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail=(
                "Employee not found"
            )
        )

    employee_name = (
        get_employee_name(
            employee
        )
    )

    login_count = (
        db.query(
            func.count(
                LoginActivity.id
            )
        )
        .filter(
            LoginActivity.employee_id
            == employee.id
        )
        .scalar()
        or 0
    )

    file_access_count = (
        db.query(
            func.count(
                FileAccess.id
            )
        )
        .filter(
            FileAccess.employee_id
            == employee.id
        )
        .scalar()
        or 0
    )

    alert_count = (
        db.query(
            func.count(
                Alert.id
            )
        )
        .filter(
            Alert.employee_id
            == employee.id
        )
        .scalar()
        or 0
    )

    login_anomaly_count = (
        db.query(
            func.count(
                LoginActivity.id
            )
        )
        .filter(
            LoginActivity.employee_id
            == employee.id,
            LoginActivity.is_anomaly
            .is_(True)
        )
        .scalar()
        or 0
    )

    file_anomaly_count = (
        db.query(
            func.count(
                FileAccess.id
            )
        )
        .filter(
            FileAccess.employee_id
            == employee.id,
            FileAccess.is_anomaly
            .is_(True)
        )
        .scalar()
        or 0
    )

    anomaly_count = (
        int(
            login_anomaly_count
        )
        +
        int(
            file_anomaly_count
        )
    )

    result = build_risk_result(
        employee_id=employee.id,
        employee_name=employee_name,
        login_count=int(
            login_count
        ),
        file_access_count=int(
            file_access_count
        ),
        email_count=0,
        device_count=0,
        anomaly_count=anomaly_count,
        alert_count=int(
            alert_count
        )
    )

    stored_score = float(
        employee.risk_score
        or 0
    )

    if stored_score > 0:
        result[
            "risk_score"
        ] = round(
            stored_score,
            2
        )

    result[
        "risk_level"
    ] = (
        employee.risk_level
        or get_risk_level(
            float(
                result.get(
                    "risk_score",
                    0
                )
            )
        )
    )

    result[
        "anomaly_score"
    ] = round(
        float(
            employee.anomaly_score
            or 0
        ),
        2
    )

    result[
        "activity_summary"
    ] = {
        "login_count": int(
            login_count
        ),
        "file_access_count": int(
            file_access_count
        ),
        "anomaly_count": (
            anomaly_count
        ),
        "alert_count": int(
            alert_count
        )
    }

    result[
        "risk_trend"
    ] = get_risk_trend(
        float(
            result.get(
                "risk_score",
                0
            )
        )
    )

    return result