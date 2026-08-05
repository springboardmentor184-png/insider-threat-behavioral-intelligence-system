from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base import Base
from app.models.activity import ActivityLog, ActivityType, Severity
from app.models.department import Department
from app.models.employee import Employee
from app.models.role import Role
from app.services import activity_service


def test_get_activities_supports_department_and_risk_level_filters():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        role = Role(id="11111111-1111-1111-1111-111111111111", role_name="Security Analyst")
        department = Department(id="22222222-2222-2222-2222-222222222222", department_name="Engineering", department_code="eng")
        db.add_all([role, department])
        db.commit()

        employee = Employee(
            id="33333333-3333-3333-3333-333333333333",
            employee_id="EMP-001",
            first_name="Ada",
            last_name="Lovelace",
            email="ada@example.com",
            password_hash="hash",
            role_id=role.id,
            department_id=department.id,
            is_active=True,
        )
        db.add(employee)
        db.commit()

        db.add_all([
            ActivityLog(
                id="44444444-4444-4444-4444-444444444444",
                employee_id=employee.id,
                activity_type=ActivityType.LOGIN,
                severity=Severity.CRITICAL,
                timestamp=datetime(2024, 1, 1, tzinfo=timezone.utc),
                description="suspicious login",
            ),
            ActivityLog(
                id="55555555-5555-5555-5555-555555555555",
                employee_id=employee.id,
                activity_type=ActivityType.LOGOUT,
                severity=Severity.LOW,
                timestamp=datetime(2024, 1, 2, tzinfo=timezone.utc),
                description="normal logout",
            ),
        ])
        db.commit()

        response = activity_service.get_activities(
            db,
            page=1,
            limit=10,
            department="Engineering",
            risk_level="Critical",
        )

        assert response.total == 1
        assert response.items[0].severity == Severity.CRITICAL
    finally:
        db.close()
