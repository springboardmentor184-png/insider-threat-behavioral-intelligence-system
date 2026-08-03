from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import Employee, LoginActivity, FileAccess
from app.services.behavioral_service import (
    create_employee_features,
    detect_employee_anomalies,
    get_behavioral_status,
    get_behavioral_summary,
)
from app.services.risk_service import calculate_risk_score

router = APIRouter(
    prefix="/analytics",
    tags=["Behavioral Analytics"],
)


def get_employee_activities(
    db,
    employee,
):
    login_conditions = []
    file_conditions = []

    if hasattr(
        LoginActivity,
        "employee_id",
    ):
        login_conditions.append(
            LoginActivity.employee_id
            == employee.id
        )

    if hasattr(
        FileAccess,
        "employee_id",
    ):
        file_conditions.append(
            FileAccess.employee_id
            == employee.id
        )

    employee_user = getattr(
        employee,
        "user",
        None,
    )

    if employee_user:
        if hasattr(
            LoginActivity,
            "user",
        ):
            login_conditions.append(
                LoginActivity.user
                == employee_user
            )

        if hasattr(
            FileAccess,
            "user",
        ):
            file_conditions.append(
                FileAccess.user
                == employee_user
            )

    if login_conditions:
        login_activities = (
            db.query(LoginActivity)
            .filter(
                or_(
                    *login_conditions
                )
            )
            .all()
        )
    else:
        login_activities = []

    if file_conditions:
        file_activities = (
            db.query(FileAccess)
            .filter(
                or_(
                    *file_conditions
                )
            )
            .all()
        )
    else:
        file_activities = []

    return (
        login_activities,
        file_activities,
    )


@router.get("/overview")
def get_analytics_overview(
    db: Session = Depends(get_db),
):
    employees = (
        db.query(Employee)
        .order_by(Employee.id)
        .all()
    )

    employee_features = []

    for employee in employees:
        (
            login_activities,
            file_activities,
        ) = get_employee_activities(
            db,
            employee,
        )

        features = (
            create_employee_features(
                employee_id=employee.id,
                login_activities=(
                    login_activities
                ),
                file_activities=(
                    file_activities
                ),
            )
        )

        features["employee_name"] = (
            getattr(
                employee,
                "name",
                None,
            )
            or getattr(
                employee,
                "user",
                "Unknown",
            )
        )

        features["employee_user"] = (
            getattr(
                employee,
                "user",
                None,
            )
        )

        features["department"] = (
            getattr(
                employee,
                "department",
                None,
            )
        )

        employee_features.append(
            features
        )

    anomaly_results = (
        detect_employee_anomalies(
            employee_features
        )
    )

    results = []

    for item in anomaly_results:
        risk_result = (
            calculate_risk_score(
                anomaly_score=(
                    item[
                        "anomaly_score"
                    ]
                ),
                login_count=(
                    item[
                        "login_count"
                    ]
                ),
                file_count=(
                    item[
                        "file_count"
                    ]
                ),
                email_count=(
                    item.get(
                        "email_count",
                        0,
                    )
                ),
                device_count=(
                    item.get(
                        "device_count",
                        0,
                    )
                ),
                after_hours_count=(
                    item[
                        "after_hours_count"
                    ]
                ),
            )
        )

        behavioral_status = (
            get_behavioral_status(
                item[
                    "anomaly_score"
                ]
            )
        )

        behavioral_summary = (
            get_behavioral_summary(
                item,
                item[
                    "anomaly_score"
                ],
            )
        )

        results.append(
            {
                **item,
                "behavioral_status": (
                    behavioral_status
                ),
                "behavioral_summary": (
                    behavioral_summary
                ),
                "risk_score": (
                    risk_result[
                        "risk_score"
                    ]
                ),
                "risk_level": (
                    risk_result[
                        "risk_level"
                    ]
                ),
                "risk_components": (
                    risk_result[
                        "components"
                    ]
                ),
                "recommendation": (
                    risk_result[
                        "recommendation"
                    ]
                ),
            }
        )

    total_employees = len(
        results
    )

    anomalous_employees = len(
        [
            item
            for item in results
            if item[
                "is_anomaly"
            ]
        ]
    )

    critical_risk = len(
        [
            item
            for item in results
            if item[
                "risk_level"
            ]
            == "Critical"
        ]
    )

    high_risk = len(
        [
            item
            for item in results
            if item[
                "risk_level"
            ]
            == "High"
        ]
    )

    medium_risk = len(
        [
            item
            for item in results
            if item[
                "risk_level"
            ]
            == "Medium"
        ]
    )

    low_risk = len(
        [
            item
            for item in results
            if item[
                "risk_level"
            ]
            == "Low"
        ]
    )

    average_risk_score = 0

    if total_employees > 0:
        average_risk_score = round(
            sum(
                item[
                    "risk_score"
                ]
                for item
                in results
            )
            / total_employees,
            2,
        )

    return {
        "summary": {
            "total_employees": (
                total_employees
            ),
            "anomalous_employees": (
                anomalous_employees
            ),
            "critical_risk": (
                critical_risk
            ),
            "high_risk": (
                high_risk
            ),
            "medium_risk": (
                medium_risk
            ),
            "low_risk": (
                low_risk
            ),
            "average_risk_score": (
                average_risk_score
            ),
        },
        "employees": results,
    }


@router.get(
    "/employee/{employee_id}"
)
def get_employee_analytics(
    employee_id: int,
    db: Session = Depends(get_db),
):
    employees = (
        db.query(Employee)
        .order_by(Employee.id)
        .all()
    )

    employee_features = []

    for employee in employees:
        (
            login_activities,
            file_activities,
        ) = get_employee_activities(
            db,
            employee,
        )

        features = (
            create_employee_features(
                employee_id=employee.id,
                login_activities=(
                    login_activities
                ),
                file_activities=(
                    file_activities
                ),
            )
        )

        features["employee_name"] = (
            getattr(
                employee,
                "name",
                None,
            )
            or getattr(
                employee,
                "user",
                "Unknown",
            )
        )

        features["employee_user"] = (
            getattr(
                employee,
                "user",
                None,
            )
        )

        features["department"] = (
            getattr(
                employee,
                "department",
                None,
            )
        )

        employee_features.append(
            features
        )

    anomaly_results = (
        detect_employee_anomalies(
            employee_features
        )
    )

    employee_result = next(
        (
            item
            for item
            in anomaly_results
            if str(
                item[
                    "employee_id"
                ]
            )
            == str(
                employee_id
            )
        ),
        None,
    )

    if employee_result is None:
        return {
            "detail": (
                "Employee not found"
            )
        }

    risk_result = (
        calculate_risk_score(
            anomaly_score=(
                employee_result[
                    "anomaly_score"
                ]
            ),
            login_count=(
                employee_result[
                    "login_count"
                ]
            ),
            file_count=(
                employee_result[
                    "file_count"
                ]
            ),
            email_count=(
                employee_result.get(
                    "email_count",
                    0,
                )
            ),
            device_count=(
                employee_result.get(
                    "device_count",
                    0,
                )
            ),
            after_hours_count=(
                employee_result[
                    "after_hours_count"
                ]
            ),
        )
    )

    return {
        **employee_result,
        "behavioral_status": (
            get_behavioral_status(
                employee_result[
                    "anomaly_score"
                ]
            )
        ),
        "behavioral_summary": (
            get_behavioral_summary(
                employee_result,
                employee_result[
                    "anomaly_score"
                ],
            )
        ),
        "risk_score": (
            risk_result[
                "risk_score"
            ]
        ),
        "risk_level": (
            risk_result[
                "risk_level"
            ]
        ),
        "risk_components": (
            risk_result[
                "components"
            ]
        ),
        "recommendation": (
            risk_result[
                "recommendation"
            ]
        ),
    }