import random
from app.database import SessionLocal
from app.models.models import Employee, Department, Device, User

db = SessionLocal()

depts = db.query(Department).all()
if not depts:
    print("No departments found. Launch backend first.")
    db.close()
    exit()

dept_ids = [d.id for d in depts]
dept_map = {d.name: d.id for d in depts}

emp_seed_list = [
    {"employee_id": "EMP-10023", "name": "John Doe", "email": "john.doe@company.com", "dept": "Engineering", "designation": "Senior Software Engineer", "privileges": "CODE_WRITE, DATABASE_READ, VPN_ACCESS", "dev": "DEV-LAP-889"},
    {"employee_id": "EMP-10087", "name": "Jane Smith", "email": "jane.smith@company.com", "dept": "Finance", "designation": "Financial Analyst", "privileges": "FINANCE_WRITE, BANKING_ACCESS", "dev": "DEV-DESK-201"},
    {"employee_id": "EMP-10104", "name": "CERT User ACM1443", "email": "acm1443@cert.enterprise.org", "dept": "Information Technology", "designation": "Systems Administrator", "privileges": "ADMIN_ROOT, FIREWALL_WRITE, VPN_ACCESS", "dev": "DEV-SYS-104"},
    {"employee_id": "EMP-10105", "name": "CERT User BRP0622", "email": "brp0622@cert.enterprise.org", "dept": "Engineering", "designation": "DevOps Architect", "privileges": "KUBERNETES_ADMIN, DOCKER_WRITE, AWS_PROD", "dev": "DEV-OPS-622"},
    {"employee_id": "EMP-10106", "name": "CERT User HRP0834", "email": "hrp0834@cert.enterprise.org", "dept": "Information Technology", "designation": "Database Engineer", "privileges": "DATABASE_ADMIN, SQL_EXEC, BACKUP_WRITE", "dev": "DEV-DB-834"},
    {"employee_id": "EMP-10107", "name": "CERT User JLM0364", "email": "jlm0364@cert.enterprise.org", "dept": "Engineering", "designation": "Frontend Specialist", "privileges": "CODE_WRITE, VITE_BUILD, GIT_WRITE", "dev": "DEV-FE-364"},
    {"employee_id": "EMP-10108", "name": "Elena Smirnov", "email": "elena.smirnov@company.com", "dept": "Human Resources", "designation": "HR Compliance Lead", "privileges": "HR_DATABASE_READ, SALARY_VIEW", "dev": "DEV-HR-108"},
    {"employee_id": "EMP-10109", "name": "John White", "email": "john.white@intel.org", "dept": "Information Technology", "designation": "SOC Threat Analyst", "privileges": "SIEM_MONITOR, LOG_READ, INCIDENT_TRIAGE", "dev": "DEV-SOC-109"},
    {"employee_id": "EMP-10110", "name": "Sophia Rodriguez", "email": "sophia.rodriguez@company.com", "dept": "Finance", "designation": "Senior Accountant", "privileges": "PAYROLL_WRITE, BANK_API_ACCESS", "dev": "DEV-FIN-110"},
    {"employee_id": "EMP-10111", "name": "Marcus Vance", "email": "marcus.vance@company.com", "dept": "Engineering", "designation": "Cybersecurity Lead", "privileges": "SEC_AUDIT, EDR_ADMIN, FIREWALL_READ", "dev": "DEV-SEC-111"},
    {"employee_id": "EMP-10112", "name": "CERT User DKP1109", "email": "dkp1109@cert.enterprise.org", "dept": "Engineering", "designation": "Backend Software Developer", "privileges": "CODE_WRITE, FASTAPI_DEPLOY, REDIS_READ", "dev": "DEV-BE-112"},
    {"employee_id": "EMP-10113", "name": "CERT User RGG0234", "email": "rgg0234@cert.enterprise.org", "dept": "Information Technology", "designation": "Network Security Ops", "privileges": "VPN_ADMIN, ROUTER_WRITE, PCAP_READ", "dev": "DEV-NET-234"},
    {"employee_id": "EMP-10114", "name": "CERT User NJS0045", "email": "njs0045@cert.enterprise.org", "dept": "Finance", "designation": "Audit & Compliance Officer", "privileges": "AUDIT_LOG_READ, COMPLIANCE_WRITE", "dev": "DEV-AUD-045"},
    {"employee_id": "EMP-10115", "name": "Alex Mercer", "email": "alex.mercer@company.com", "dept": "Engineering", "designation": "AI/ML Research Scientist", "privileges": "GPU_CLUSTER_ACCESS, MODEL_TRAIN_WRITE", "dev": "DEV-AI-115"},
    {"employee_id": "EMP-10116", "name": "David Miller", "email": "david.miller@company.com", "dept": "Human Resources", "designation": "Talent Acquisition Manager", "privileges": "ONBOARDING_WRITE, RECRUIT_READ", "dev": "DEV-HR-116"},
    {"employee_id": "EMP-10117", "name": "CERT User KAB0912", "email": "kab0912@cert.enterprise.org", "dept": "Information Technology", "designation": "Infrastructure Specialist", "privileges": "CLOUD_INFRA_WRITE, TERRAFORM_APPLY", "dev": "DEV-INFRA-912"},
    {"employee_id": "EMP-10118", "name": "CERT User TMF1203", "email": "tmf1203@cert.enterprise.org", "dept": "Engineering", "designation": "QA Automation Engineer", "privileges": "TEST_PIPELINE_WRITE, PYTEST_EXEC", "dev": "DEV-QA-203"},
    {"employee_id": "EMP-10119", "name": "CERT User WLD0491", "email": "wld0491@cert.enterprise.org", "dept": "Finance", "designation": "Financial Risk Modeler", "privileges": "RISK_MODEL_READ, PORTFOLIO_READ", "dev": "DEV-RISK-491"},
    {"employee_id": "EMP-10120", "name": "Samantha Green", "email": "samantha.green@company.com", "dept": "Information Technology", "designation": "Helpdesk Manager", "privileges": "TICKET_ADMIN, ACTIVE_DIRECTORY_READ", "dev": "DEV-HD-120"}
]

count_added = 0
for emp in emp_seed_list:
    existing = db.query(Employee).filter(Employee.employee_id == emp["employee_id"]).first()
    if not existing:
        d_id = dept_map.get(emp["dept"], dept_ids[0])
        new_emp = Employee(
            employee_id=emp["employee_id"],
            name=emp["name"],
            email=emp["email"],
            department_id=d_id,
            designation=emp["designation"],
            manager_id=None,
            access_privileges=emp["privileges"]
        )
        db.add(new_emp)
        db.flush()

        # Add associated device
        dev = Device(
            device_id=emp["dev"],
            device_name=f"{emp['name'].split()[0]}'s Workstation",
            device_type=random.choice(["Laptop", "Desktop Workstation", "Secure Tablet"]),
            ip_address=f"192.168.{random.randint(1,10)}.{random.randint(10,250)}",
            mac_address=f"52:54:00:{random.randint(10,99)}:{random.randint(10,99)}:{random.randint(10,99)}",
            employee_id=new_emp.id,
            status="Active"
        )
        db.add(dev)
        count_added += 1

db.commit()
print(f"Successfully seeded {count_added} monitored personnel into employees table.")
total = db.query(Employee).count()
print("Total employees in database:", total)
db.close()
