import pandas as pd

from database import SessionLocal
from models.user import User
from models.employee import EmployeeProfile

# Read only the user column
dataset = pd.read_csv(
    "ml/datasets/email.csv",
    usecols=["user"]
)

# Get first 50 unique users
users = dataset["user"].dropna().unique()[:50]

db = SessionLocal()

try:

    for dataset_user in users:

        # Skip if already imported
        existing = db.query(EmployeeProfile).filter(
            EmployeeProfile.dataset_user == dataset_user
        ).first()

        if existing:
            continue

        user = User(
            name=dataset_user,
            email=f"{dataset_user.lower()}@company.com",
            password="password123",
            role="Employee"
        )

        db.add(user)
        db.flush()   # Gets generated user_id

        employee = EmployeeProfile(
            user_id=user.user_id,
            department="IT",
            designation="Employee",
            manager="Manager",
            joining_date="2024-01-01",
            phone="9999999999",
            status="Active",
            dataset_user=dataset_user
        )

        db.add(employee)

    db.commit()

    print("Successfully imported 50 CERT employees.")

except Exception as e:

    db.rollback()
    print(e)

finally:

    db.close()