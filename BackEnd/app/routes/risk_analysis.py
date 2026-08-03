from fastapi import APIRouter, Depends, HTTPException
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
    prefix="/risk-analysis",
    tags=["Risk Analysis"],
)


def get_employee_activities(db, employee):
    login_conditions = []
    file_conditions = []

    if hasattr(LoginActivity, "employee_id"):
        login_conditions.append(
            LoginActivity.employee_id == employee.id
        )

    if hasattr(FileAccess, "employee_id"):
        file_conditions.append(
            FileAccess.employee_id == employee.id
        )

    employee_user = getattr(
        employee,
        "user",
        None,
    )

    if employee_user:
        if hasattr(LoginActivity, "user"):
            login_conditions.append(
                LoginActivity.user == employee_user
            )

        if hasattr(FileAccess, "user"):
            file_conditions.append(
                FileAccess.user == employee_user
            )

    login_activities = []

    file_activities = []

    if login_conditions:
        login_activities = (
            db.query(LoginActivity)
            .filter(or_(*login_conditions))
            .all()
        )

    if file_conditions:
        file_activities = (
            db.query(FileAccess)
            .filter(or_(*file_conditions))
            .all()
        )

    return (
        login_activities,
        file_activities,
    )


def build_all_employee_results(db):
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

        feature = create_employee_features(
            employee_id=employee.id,
            login_activities=login_activities,
            file_activities=file_activities,
        )

        feature["name"] = (
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

        feature["user"] = getattr(
            employee,
            "user",
            None,
        )

        feature["department"] = getattr(
            employee,
            "department",
            None,
        )

        feature["designation"] = getattr(
            employee,
            "designation",
            None,
        )

        employee_features.append(
            feature
        )

    anomaly_results = (
        detect_employee_anomalies(
            employee_features
        )
    )

    final_results = []

    for result in anomaly_results:
        risk_result = (
            calculate_risk_score(
                anomaly_score=result[
                    "anomaly_score"
                ],
                login_count=result[
                    "login_count"
                ],
                file_count=result[
                    "file_count"
                ],
                email_count=result.get(
                    "email_count",
                    0,
                ),
                device_count=result.get(
                    "device_count",
                    0,
                ),
                after_hours_count=result[
                    "after_hours_count"
                ],
            )
        )

        final_results.append(
            {
                **result,
                "behavioral_status": (
                    get_behavioral_status(
                        result[
                            "anomaly_score"
                        ]
                    )
                ),
                "behavioral_summary": (
                    get_behavioral_summary(
                        result,
                        result[
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
        )

    return final_results


@router.post("/calculate")
def calculate_and_save_risk_scores(
    db: Session = Depends(get_db),
):
    results = build_all_employee_results(
        db
    )

    updated_count = 0

    for result in results:
        employee = (
            db.query(Employee)
            .filter(
                Employee.id
                == int(
                    result[
                        "employee_id"
                    ]
                )
            )
            .first()
        )

        if employee is None:
            continue

        if hasattr(
            employee,
            "anomaly_score",
        ):
            employee.anomaly_score = (
                result[
                    "anomaly_score"
                ]
            )

        if hasattr(
            employee,
            "anomaly_prediction",
        ):
            employee.anomaly_prediction = (
                -1
                if result[
                    "is_anomaly"
                ]
                else 1
            )

        if hasattr(
            employee,
            "anomaly",
        ):
            employee.anomaly = (
                1
                if result[
                    "is_anomaly"
                ]
                else 0
            )

        if hasattr(
            employee,
            "risk_score",
        ):
            employee.risk_score = (
                result[
                    "risk_score"
                ]
            )

        if hasattr(
            employee,
            "risk_level",
        ):
            employee.risk_level = (
                result[
                    "risk_level"
                ]
            )

        if hasattr(
            employee,
            "login_count",
        ):
            employee.login_count = (
                result[
                    "login_count"
                ]
            )

        if hasattr(
            employee,
            "unique_devices",
        ):
            employee.unique_devices = (
                result[
                    "unique_devices"
                ]
            )

        if hasattr(
            employee,
            "after_hours_logins",
        ):
            employee.after_hours_logins = (
                result[
                    "after_hours_count"
                ]
            )

        updated_count += 1

    db.commit()

    return {
        "message": (
            "Risk analysis completed "
            "successfully"
        ),
        "employees_analyzed": (
            len(results)
        ),
        "employees_updated": (
            updated_count
        ),
        "results": results,
    }


@router.get("/")
def get_all_risk_results(
    db: Session = Depends(get_db),
):
    results = build_all_employee_results(
        db
    )

    return {
        "total": len(results),
        "employees": results,
    }


@router.get("/{employee_id}")
def get_employee_risk_result(
    employee_id: int,
    db: Session = Depends(get_db),
):
    results = build_all_employee_results(
        db
    )

    employee_result = next(
        (
            result
            for result in results
            if int(
                result[
                    "employee_id"
                ]
            )
            == employee_id
        ),
        None,
    )

    if employee_result is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    return employee_result