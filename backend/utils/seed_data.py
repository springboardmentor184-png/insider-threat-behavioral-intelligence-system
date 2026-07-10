"""
Seed script: create default users for each role on first run.
Run with: python -m backend.utils.seed_data
"""

import asyncio
from sqlalchemy import select
from backend.core.database import engine, AsyncSessionLocal, Base
from backend.models.user import User
from backend.models.activity_log import ActivityLog  # noqa: F401 — ensure table is registered
from backend.models.enums import UserRole
from backend.core.security import hash_password


SEED_USERS = [
    {
        "email": "admin@itbis.com",
        "username": "admin",
        "full_name": "System Administrator",
        "password": "admin123",
        "role": UserRole.ADMINISTRATOR,
        "department": "IT Security",
        "designation": "Chief Security Officer",
    },
    {
        "email": "analyst@itbis.com",
        "username": "analyst",
        "full_name": "Sarah Chen",
        "password": "analyst123",
        "role": UserRole.SECURITY_ANALYST,
        "department": "Security Operations",
        "designation": "Senior Security Analyst",
        "manager": "System Administrator",
    },
    {
        "email": "soc@itbis.com",
        "username": "soc_engineer",
        "full_name": "James Rodriguez",
        "password": "soc123",
        "role": UserRole.SOC_ENGINEER,
        "department": "Security Operations Center",
        "designation": "SOC Engineer L2",
        "manager": "System Administrator",
    },
    {
        "email": "manager@itbis.com",
        "username": "sec_manager",
        "full_name": "Emily Watson",
        "password": "manager123",
        "role": UserRole.SECURITY_MANAGER,
        "department": "Information Security",
        "designation": "Security Manager",
        "manager": "System Administrator",
    },
]


async def seed():
    """Create database tables and seed default users."""
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("[OK] Database tables created")

    async with AsyncSessionLocal() as session:
        for user_data in SEED_USERS:
            # Check if user already exists
            result = await session.execute(
                select(User).where(User.email == user_data["email"])
            )
            existing = result.scalar_one_or_none()

            if existing:
                print(f"  [SKIP] User '{user_data['email']}' already exists, skipping")
                continue

            user = User(
                email=user_data["email"],
                username=user_data["username"],
                full_name=user_data["full_name"],
                hashed_password=hash_password(user_data["password"]),
                role=user_data["role"],
                department=user_data.get("department"),
                designation=user_data.get("designation"),
                manager=user_data.get("manager"),
            )
            session.add(user)
            print(f"  [OK] Created {user_data['role'].value}: {user_data['email']}")

        await session.commit()

    print("\n[OK] Seed data complete")
    print("\nDefault credentials:")
    print("  Administrator:     admin@itbis.com / admin123")
    print("  Security Analyst:  analyst@itbis.com / analyst123")
    print("  SOC Engineer:      soc@itbis.com / soc123")
    print("  Security Manager:  manager@itbis.com / manager123")


if __name__ == "__main__":
    asyncio.run(seed())
