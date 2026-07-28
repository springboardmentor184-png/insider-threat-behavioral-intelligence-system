from app.database import SessionLocal
from app import models

db = SessionLocal()

try:
    # Get all distinct employee IDs from ActivityLog
    distinct_employees = db.query(models.ActivityLog.employee).distinct().all()

    inserted = 0

    for (code,) in distinct_employees:
        if not code:  # Skip null/empty values
            continue

        exists = db.query(models.UserProfile).filter(
            models.UserProfile.employee_id == code
        ).first()

        if not exists:
            profile = models.UserProfile(
                user_id=1,
                employee_id=code,
                designation="Employee",
                department="General"
            )
            db.add(profile)
            inserted += 1

    db.commit()

    print(f"Profiles inserted: {inserted}")
    print(f"Employees processed: {len(distinct_employees)}")

finally:
    db.close()