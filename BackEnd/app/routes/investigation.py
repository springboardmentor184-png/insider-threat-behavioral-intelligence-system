from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import (
    Employee,
    LoginActivity,
    FileAccess,
    Investigation
)

router = APIRouter(
    prefix="/investigations",
    tags=["Investigations"]
)


class InvestigationCreate(BaseModel):
    employee_id: int
    title: str
    description: str = ""
    priority: str = "Medium"
    status: str = "Open"
    assigned_to: str = ""
    evidence: str = ""


class InvestigationUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: str | None = None
    status: str | None = None
    assigned_to: str | None = None
    evidence: str | None = None


def get_employee_activity_counts(
    db: Session,
    employee
):
    login_count = 0
    file_count = 0

    employee_id = getattr(
        employee,
        "id",
        None
    )

    employee_user = str(
        getattr(
            employee,
            "user",
            ""
        )
        or ""
    )

    try:
        if hasattr(
            LoginActivity,
            "employee_id"
        ):
            login_count = (
                db.query(
                    func.count(
                        LoginActivity.id
                    )
                )
                .filter(
                    LoginActivity.employee_id
                    == employee_id
                )
                .scalar()
                or 0
            )
        elif (
            hasattr(
                LoginActivity,
                "user"
            )
            and employee_user
        ):
            login_count = (
                db.query(
                    func.count(
                        LoginActivity.id
                    )
                )
                .filter(
                    LoginActivity.user
                    == employee_user
                )
                .scalar()
                or 0
            )

    except Exception:
        db.rollback()
        login_count = 0

    try:
        if hasattr(
            FileAccess,
            "employee_id"
        ):
            file_count = (
                db.query(
                    func.count(
                        FileAccess.id
                    )
                )
                .filter(
                    FileAccess.employee_id
                    == employee_id
                )
                .scalar()
                or 0
            )
        elif (
            hasattr(
                FileAccess,
                "user"
            )
            and employee_user
        ):
            file_count = (
                db.query(
                    func.count(
                        FileAccess.id
                    )
                )
                .filter(
                    FileAccess.user
                    == employee_user
                )
                .scalar()
                or 0
            )

    except Exception:
        db.rollback()
        file_count = 0

    return (
        login_count,
        file_count
    )


def serialize_investigation(
    investigation,
    employee,
    db
):
    login_count = 0
    file_count = 0

    if employee:
        (
            login_count,
            file_count
        ) = get_employee_activity_counts(
            db,
            employee
        )

    return {
        "id": investigation.id,

        "employee_id": (
            investigation.employee_id
        ),

        "user": (
            getattr(
                employee,
                "user",
                "Unknown"
            )
            if employee
            else "Unknown"
        ),

        "name": (
            getattr(
                employee,
                "name",
                None
            )
            or getattr(
                employee,
                "user",
                "Unknown"
            )
            if employee
            else "Unknown"
        ),

        "department": (
            getattr(
                employee,
                "department",
                ""
            )
            or ""
            if employee
            else ""
        ),

        "designation": (
            getattr(
                employee,
                "designation",
                ""
            )
            or ""
            if employee
            else ""
        ),

        "risk_score": (
            getattr(
                employee,
                "risk_score",
                0
            )
            or 0
            if employee
            else 0
        ),

        "risk_level": (
            getattr(
                employee,
                "risk_level",
                "Low"
            )
            or "Low"
            if employee
            else "Low"
        ),

        "anomaly_score": (
            getattr(
                employee,
                "anomaly_score",
                0
            )
            or 0
            if employee
            else 0
        ),

        "login_activities": (
            login_count
        ),

        "file_access_events": (
            file_count
        ),

        "title": (
            investigation.title
        ),

        "description": (
            investigation.description
            or ""
        ),

        "priority": (
            investigation.priority
            or "Medium"
        ),

        "status": (
            investigation.status
            or "Open"
        ),

        "assigned_to": (
            investigation.assigned_to
            or ""
        ),

        "evidence": (
            investigation.evidence
            or ""
        ),

        "created_at": (
            investigation.created_at
        ),

        "updated_at": (
            investigation.updated_at
        )
    }


@router.get("/")
def get_investigations(
    db: Session = Depends(get_db)
):
    investigations = (
        db.query(
            Investigation
        )
        .order_by(
            Investigation.updated_at.desc()
        )
        .all()
    )

    results = []

    for investigation in investigations:

        employee = (
            db.query(
                Employee
            )
            .filter(
                Employee.id
                == investigation.employee_id
            )
            .first()
        )

        results.append(
            serialize_investigation(
                investigation,
                employee,
                db
            )
        )

    return results


@router.post("/")
def create_investigation(
    data: InvestigationCreate,
    db: Session = Depends(get_db)
):
    employee = (
        db.query(
            Employee
        )
        .filter(
            Employee.id
            == data.employee_id
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

    investigation = Investigation(
        employee_id=(
            data.employee_id
        ),
        title=(
            data.title
        ),
        description=(
            data.description
        ),
        priority=(
            data.priority
        ),
        status=(
            data.status
        ),
        assigned_to=(
            data.assigned_to
        ),
        evidence=(
            data.evidence
        ),
        created_at=(
            datetime.utcnow()
        ),
        updated_at=(
            datetime.utcnow()
        )
    )

    db.add(
        investigation
    )

    db.commit()

    db.refresh(
        investigation
    )

    return serialize_investigation(
        investigation,
        employee,
        db
    )


@router.get(
    "/{investigation_id}"
)
def get_investigation(
    investigation_id: int,
    db: Session = Depends(get_db)
):
    investigation = (
        db.query(
            Investigation
        )
        .filter(
            Investigation.id
            == investigation_id
        )
        .first()
    )

    if not investigation:
        raise HTTPException(
            status_code=404,
            detail=(
                "Investigation not found"
            )
        )

    employee = (
        db.query(
            Employee
        )
        .filter(
            Employee.id
            == investigation.employee_id
        )
        .first()
    )

    return serialize_investigation(
        investigation,
        employee,
        db
    )


@router.patch(
    "/{investigation_id}"
)
def update_investigation_status(
    investigation_id: int,
    data: InvestigationUpdate,
    db: Session = Depends(get_db)
):
    investigation = (
        db.query(
            Investigation
        )
        .filter(
            Investigation.id
            == investigation_id
        )
        .first()
    )

    if not investigation:
        raise HTTPException(
            status_code=404,
            detail=(
                "Investigation not found"
            )
        )

    update_data = (
        data.model_dump(
            exclude_unset=True
        )
    )

    for field, value in (
        update_data.items()
    ):
        setattr(
            investigation,
            field,
            value
        )

    investigation.updated_at = (
        datetime.utcnow()
    )

    db.commit()

    db.refresh(
        investigation
    )

    employee = (
        db.query(
            Employee
        )
        .filter(
            Employee.id
            == investigation.employee_id
        )
        .first()
    )

    return serialize_investigation(
        investigation,
        employee,
        db
    )


@router.put(
    "/{investigation_id}"
)
def update_investigation(
    investigation_id: int,
    data: InvestigationUpdate,
    db: Session = Depends(get_db)
):
    return update_investigation_status(
        investigation_id,
        data,
        db
    )


@router.delete(
    "/{investigation_id}"
)
def delete_investigation(
    investigation_id: int,
    db: Session = Depends(get_db)
):
    investigation = (
        db.query(
            Investigation
        )
        .filter(
            Investigation.id
            == investigation_id
        )
        .first()
    )

    if not investigation:
        raise HTTPException(
            status_code=404,
            detail=(
                "Investigation not found"
            )
        )

    db.delete(
        investigation
    )

    db.commit()

    return {
        "message": (
            "Investigation deleted successfully"
        )
    }