from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute

from app.core.config import settings
from app.database.base import Base
from app.database.session import engine

# Import Models
from app.models.employee import Employee
from app.models.department import Department
from app.models.role import Role
from app.models.activity import ActivityLog
from app.models.behavior_profile import BehaviorProfile

# Create Database Tables
Base.metadata.create_all(bind=engine)

# Run database seeding on startup
import sys
import os
from app.database.session import SessionLocal
from app.models.department import Department
from app.models.role import Role

def run_startup_seed():
    """Run database seeding and migrations on application startup"""
    db = SessionLocal()
    try:
        # Ensure all roles exist
        if db.query(Role).count() == 0:
            import uuid
            for role in [
                Role(id=uuid.uuid4(), role_name="Administrator", description="System administrator", permissions={}),
                Role(id=uuid.uuid4(), role_name="Security Analyst", description="Security analyst", permissions={}),
                Role(id=uuid.uuid4(), role_name="Manager", description="Business manager", permissions={}),
                Role(id=uuid.uuid4(), role_name="Standard Employee", description="Standard employee", permissions={}),
            ]:
                db.add(role)
            db.commit()

        # Ensure all departments exist
        if db.query(Department).count() == 0:
            import uuid
            for department in [
                Department(id=uuid.uuid4(), department_name="Engineering", department_code="engineering", description="Engineering team"),
                Department(id=uuid.uuid4(), department_name="Security / SOC", department_code="security", description="Security operations center"),
                Department(id=uuid.uuid4(), department_name="Human Resources", department_code="hr", description="Human resources team"),
                Department(id=uuid.uuid4(), department_name="IT Administration", department_code="it", description="Information technology administration"),
                Department(id=uuid.uuid4(), department_name="Management", department_code="management", description="Management and executive leadership"),
            ]:
                db.add(department)
            db.commit()

        # Ensure admin account exists
        admin_email = "admin@insidershield.com"
        existing_admin = db.query(Employee).filter_by(email=admin_email).first()
        if not existing_admin:
            from app.core.security import get_password_hash
            import uuid
            admin_role = db.query(Role).filter_by(role_name="Administrator").first()
            it_dept = db.query(Department).filter_by(department_code="it").first()
            if admin_role and it_dept:
                admin_employee = Employee(
                    id=uuid.uuid4(),
                    employee_id="ADMIN001",
                    first_name="System",
                    last_name="Administrator",
                    email=admin_email,
                    password_hash=get_password_hash("Admin@123"),
                    role_id=admin_role.id,
                    department_id=it_dept.id,
                    is_active=True,
                )
                db.add(admin_employee)
                db.commit()

        # Fix existing users with NULL role_id
        users_without_role = db.query(Employee).filter(Employee.role_id == None).all()
        if users_without_role:
            admin_role = db.query(Role).filter_by(role_name="Administrator").first()
            it_dept = db.query(Department).filter_by(department_code="it").first()
            for user in users_without_role:
                user.role_id = admin_role.id
                if user.department_id is None:
                    user.department_id = it_dept.id
                db.add(user)
            db.commit()

    except Exception as e:
        db.rollback()
        # Log but don't fail startup if seeding has issues
        print(f"Warning: Database seeding encountered an issue: {e}")
    finally:
        db.close()

# Run seeding on startup
run_startup_seed()

# Import Routers
from app.api.v1.auth import router as auth_router
from app.api.v1.employee import router as employee_router
from app.api.v1.activity import router as activity_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.health import router as health_router
from app.api.v1.behavior import router as behavior_router
from app.api.v1.threat import router as threat_router
from app.api.v1.reports import router as reports_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise Insider Threat Behavioral Intelligence Platform API",
    version=settings.VERSION,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(
    health_router,
    prefix="/health",
    tags=["Health"],
)

app.include_router(
    auth_router,
    prefix="/api/v1/auth",
    tags=["Auth"],
)

app.include_router(
    employee_router,
    prefix="/api/v1/employees",
    tags=["Employees"],
)

app.include_router(
    activity_router,
    prefix="/api/v1/activities",
    tags=["Activities"],
)

app.include_router(
    dashboard_router,
    prefix="/api/v1/dashboard",
    tags=["Dashboard"],
)

app.include_router(
    behavior_router,
    prefix="/api/v1/behavior",
    tags=["Behavior Profiling"],
)

app.include_router(
    threat_router,
    prefix="/api/v1/threat",
    tags=["Threat Detection"],
)

app.include_router(
    reports_router,
    prefix="/api/v1/reports",
    tags=["Reports"],
)


@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "Running",
    }