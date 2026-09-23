"""Deterministic synthetic/demo employee-profile data for CERT activity IDs."""

import hashlib

from models import ActivityLog, EmployeeProfile

DEPARTMENTS = ["Engineering", "IT", "Finance", "Human Resources", "Operations", "Legal", "Sales"]
DESIGNATIONS = ["Analyst", "Senior Analyst", "Senior Engineer", "Systems Administrator", "Manager", "Specialist"]
MANAGERS = ["Alex Morgan", "Jordan Patel", "Casey Nguyen", "Taylor Brooks", "Riley Chen", "Avery Johnson"]
ACCESS_BY_DEPARTMENT = {
    "Engineering": "Standard network, engineering tools, source control",
    "IT": "Standard network, IT operations tools, endpoint administration",
    "Finance": "Standard network, finance applications",
    "Human Resources": "Standard network, HR applications",
    "Operations": "Standard network, operations applications",
    "Legal": "Standard network, document management",
    "Sales": "Standard network, CRM",
}


def _number(employee_id: str) -> int:
    return int(hashlib.sha256(employee_id.encode("utf-8")).hexdigest()[:8], 16)


def synthetic_profile_values(employee_id: str) -> dict:
    """Return stable demo fields so a profile does not change between restarts."""
    value = _number(employee_id)
    department = DEPARTMENTS[value % len(DEPARTMENTS)]
    return {
        "employee_id": employee_id,
        "department": department,
        "designation": DESIGNATIONS[(value // 7) % len(DESIGNATIONS)],
        "manager": MANAGERS[(value // 13) % len(MANAGERS)],
        "device_information": f"Managed workstation: DEMO-WS-{value % 9000 + 1000}",
        "access_privileges": ACCESS_BY_DEPARTMENT[department],
    }


def ensure_employee_profiles(db) -> int:
    """Create missing demo profiles for every employee represented in activity_logs."""
    employee_ids = [row[0] for row in db.query(ActivityLog.employee_id).distinct().all()]
    if not employee_ids:
        return 0
    existing = {row[0] for row in db.query(EmployeeProfile.employee_id).filter(EmployeeProfile.employee_id.in_(employee_ids)).all()}
    missing = [employee_id for employee_id in employee_ids if employee_id not in existing]
    if missing:
        db.bulk_insert_mappings(EmployeeProfile, [synthetic_profile_values(employee_id) for employee_id in missing])
        db.commit()
    return len(missing)


if __name__ == "__main__":
    from database import SessionLocal, engine, Base
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print(f"Created {ensure_employee_profiles(db)} synthetic/demo employee profiles.")
    finally:
        db.close()
