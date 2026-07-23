from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.routers import auth, employees, activities, analytics
from app.models.models import Role, Department, Employee, Device, ActivityLog

# Initialize database schema tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Insider Threat Behavioral Intelligence System API",
    description="Production-level API for identity monitoring, RBAC, employee profiles, and activity log ingestion.",
    version="1.0.0"
)

# Enable CORS for frontend local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production security compliance
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Headers Middleware (Clickjacking, MIME Sniffing, XSS protection)
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net"
    return response

# Register routes
app.include_router(auth.router, prefix="/api")
app.include_router(employees.router, prefix="/api")
app.include_router(activities.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")

@app.on_event("startup")
def seed_system_data():
    db = SessionLocal()
    try:
        # 1. Seed Roles
        roles = [
            {"name": "Administrator", "description": "Full system control, employee management, and configuration capability."},
            {"name": "Security Manager", "description": "Organizational risk oversight, reporting, and policy monitoring."},
            {"name": "SOC Engineer", "description": "Monitors network logs, ingests telemetry, and manages investigations."},
            {"name": "Security Analyst", "description": "Performs investigative research, filters anomalies, and analyzes log profiles."}
        ]
        db_roles = {}
        for r in roles:
            existing = db.query(Role).filter(Role.name == r["name"]).first()
            if not existing:
                db_role = Role(name=r["name"], description=r["description"])
                db.add(db_role)
                db.flush()
                db_roles[r["name"]] = db_role
            else:
                db_roles[r["name"]] = existing
        
        # 2. Seed Departments
        departments = [
            {"name": "Information Technology", "description": "Manages hardware, software, network configurations, and database endpoints."},
            {"name": "Engineering", "description": "Develops product lines, codebase repositories, and service backends."},
            {"name": "Finance", "description": "Processes corporate transactions, invoices, and bank integrations."},
            {"name": "Human Resources", "description": "Oversees employee relations, onboarding, and internal corporate compliance."}
        ]
        db_depts = {}
        for d in departments:
            existing = db.query(Department).filter(Department.name == d["name"]).first()
            if not existing:
                db_dept = Department(name=d["name"], description=d["description"])
                db.add(db_dept)
                db.flush()
                db_depts[d["name"]] = db_dept
            else:
                db_depts[d["name"]] = existing
                
        db.commit()

        # 2.5 Seed Default Administrator (for testing auth flows out-of-the-box)
        from app.models.models import User
        from app.core.security import get_password_hash
        admin_role = db_roles["Administrator"]
        existing_admin = db.query(User).filter(User.email == "admin@company.com").first()
        if not existing_admin:
            db_admin = User(
                full_name="Administrator Operator",
                username="admin_corp",
                email="admin@company.com",
                hashed_password=get_password_hash("AdminPass123!"),
                role_id=admin_role.id,
                email_verified=True,
                auth_provider="local"
            )
            db.add(db_admin)
            db.commit()


        # 3. Seed Employee Profiles (if empty)
        if db.query(Employee).count() == 0:
            emp1 = Employee(
                employee_id="EMP-10023",
                name="John Doe",
                email="john.doe@company.com",
                department_id=db_depts["Engineering"].id,
                designation="Senior Software Engineer",
                manager_id=None,
                access_privileges="CODE_WRITE, DATABASE_READ, VPN_ACCESS"
            )
            db.add(emp1)
            db.flush()

            emp2 = Employee(
                employee_id="EMP-10087",
                name="Jane Smith",
                email="jane.smith@company.com",
                department_id=db_depts["Finance"].id,
                designation="Financial Analyst",
                manager_id=None,
                access_privileges="FINANCE_WRITE, BANKING_ACCESS"
            )
            db.add(emp2)
            db.flush()

            # Link employee reporting manager
            emp1.manager_id = emp2.id
            db.add(emp1)
            
            # 4. Seed Devices
            dev1 = Device(
                device_id="DEV-LAP-889",
                device_name="John's MacBook Pro",
                device_type="Laptop",
                ip_address="192.168.1.15",
                mac_address="00:1A:2B:3C:4D:5E",
                employee_id=emp1.id,
                status="Active"
            )
            dev2 = Device(
                device_id="DEV-DESK-201",
                device_name="Jane's Office PC",
                device_type="Desktop",
                ip_address="192.168.2.110",
                mac_address="AA:BB:CC:DD:EE:FF",
                employee_id=emp2.id,
                status="Active"
            )
            db.add(dev1)
            db.add(dev2)
            db.flush()

            # 5. Seed Activity Logs (Login, File, USB, Email, Network)
            logs = [
                {
                    "employee_id": emp1.id,
                    "device_id": dev1.id,
                    "event_type": "Login",
                    "severity": "Low",
                    "details": {"auth_method": "Password", "ip": "192.168.1.15", "status": "Success"}
                },
                {
                    "employee_id": emp1.id,
                    "device_id": dev1.id,
                    "event_type": "File Access",
                    "severity": "Low",
                    "details": {"file_path": "/src/app/main.py", "action": "Read"}
                },
                {
                    "employee_id": emp1.id,
                    "device_id": dev1.id,
                    "event_type": "File Upload",
                    "severity": "Medium",
                    "details": {"file_name": "source_code_leak.zip", "size_mb": 45, "destination": "external-s3-bucket"}
                },
                {
                    "employee_id": emp1.id,
                    "device_id": dev1.id,
                    "event_type": "USB Usage",
                    "severity": "High",
                    "details": {"device_vendor": "SanDisk", "action": "Mount", "serial": "USB-990-221"}
                },
                {
                    "employee_id": emp2.id,
                    "device_id": dev2.id,
                    "event_type": "Login",
                    "severity": "Low",
                    "details": {"auth_method": "MFA", "ip": "192.168.2.110", "status": "Success"}
                },
                {
                    "employee_id": emp2.id,
                    "device_id": dev2.id,
                    "event_type": "File Download",
                    "severity": "Critical",
                    "details": {"file_name": "Q3_payroll_report.xlsx", "size_mb": 12, "classification": "Highly Confidential"}
                },
                {
                    "employee_id": emp2.id,
                    "device_id": dev2.id,
                    "event_type": "Email Activity",
                    "severity": "High",
                    "details": {"recipient": "competitor@external.com", "attachments": ["payroll_records.csv"], "subject": "Salary statistics"}
                },
                {
                    "employee_id": emp1.id,
                    "device_id": dev1.id,
                    "event_type": "Network Activity",
                    "severity": "Medium",
                    "details": {"destination_ip": "185.220.101.5", "port": 443, "bytes_sent": 849201, "domain": "tor-exit-node.net"}
                }
            ]
            for log in logs:
                db_log = ActivityLog(
                    employee_id=log["employee_id"],
                    device_id=log["device_id"],
                    event_type=log["event_type"],
                    severity=log["severity"],
                    details=log["details"]
                )
                db.add(db_log)
                
            db.commit()

            # Seed 100 mock users dataset
            from app.seed_users_postgres import seed_100_users
            seed_100_users(db)

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"status": "healthy", "service": "Insider Threat Behavioral Intelligence System API"}
