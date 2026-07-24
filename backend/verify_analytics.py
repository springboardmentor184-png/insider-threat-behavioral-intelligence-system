import unittest
import json
from datetime import date, datetime
from app import create_app
from database.db import db, bcrypt
from models import Role, Employee, User, BehaviorProfile, BehaviorBaseline, BehaviorFeature, RiskScore, Anomaly, Alert, ThreatReport
from config import Config

class TestConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    TESTING = True
    DEBUG = False

class AnalyticsIntegrationTestCase(unittest.TestCase):
    def setUp(self):
        """Sets up an in-memory SQLite database and seeds default roles, permissions, and test accounts."""
        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()
        
        # In-memory tables creation
        db.create_all()
        
        # Get seeded Roles
        self.roles = {}
        for role in Role.query.all():
            self.roles[role.role_name] = role
            
        # Seed test employees
        self.employees = {}
        # 1. Admin employee
        # Seed test employees
        self.employees = {}
        # 1. Admin employee
        emp1 = Employee(employee_code="EMP_TEST_0001", first_name="Admin", last_name="User", email="admin_test@corp.com", department="Security", designation="Lead Admin", joining_date=date.today(), status="ACTIVE")
        db.session.add(emp1)
        # 2. Analyst employee
        emp2 = Employee(employee_code="EMP_TEST_0002", first_name="Analyst", last_name="User", email="analyst_test@corp.com", department="Security", designation="SOC Analyst", joining_date=date.today(), status="ACTIVE")
        db.session.add(emp2)
        # 3. SOC employee
        emp3 = Employee(employee_code="EMP_TEST_0003", first_name="SOC", last_name="User", email="soc_test@corp.com", department="Operations", designation="SOC Engineer", joining_date=date.today(), status="ACTIVE")
        db.session.add(emp3)
        # 4. Standard employee
        emp4 = Employee(employee_code="EMP_TEST_0004", first_name="Employee", last_name="User", email="emp_test@corp.com", department="Data Science", designation="Data Scientist", joining_date=date.today(), status="ACTIVE")
        db.session.add(emp4)
        
        db.session.commit()
        self.employees = {"ADMIN": emp1, "ANALYST": emp2, "SOC": emp3, "EMPLOYEE": emp4}
        
        # 5. Assigned Employee (assigned to Analyst emp2.id)
        emp_assigned = Employee(employee_code="EMP_ASSIGNED", first_name="Assigned", last_name="Staff", email="assigned@corp.com", department="Data Science", designation="Developer", joining_date=date.today(), status="ACTIVE", assigned_analyst_id=emp2.id)
        db.session.add(emp_assigned)
        # 6. Unassigned Employee (not assigned)
        emp_unassigned = Employee(employee_code="EMP_UNASSIGNED", first_name="Unassigned", last_name="Staff", email="unassigned@corp.com", department="Data Science", designation="Developer", joining_date=date.today(), status="ACTIVE")
        db.session.add(emp_unassigned)
        db.session.commit()
        self.employees["ASSIGNED"] = emp_assigned
        self.employees["UNASSIGNED"] = emp_unassigned

        # Seed users
        pass_hash = bcrypt.generate_password_hash("password123").decode('utf-8')
        user_admin = User(username="test_admin", password_hash=pass_hash, role_id=self.roles["ADMINISTRATOR"].id, employee_id=emp1.id)
        user_analyst = User(username="test_analyst", password_hash=pass_hash, role_id=self.roles["SECURITY_ANALYST"].id, employee_id=emp2.id)
        user_soc = User(username="test_soc", password_hash=pass_hash, role_id=self.roles["SOC_ENGINEER"].id, employee_id=emp3.id)
        user_emp = User(username="test_employee", password_hash=pass_hash, role_id=self.roles["EMPLOYEE"].id, employee_id=emp4.id)
        db.session.add_all([user_admin, user_analyst, user_soc, user_emp])
        
        # Seed mock analytics data for EMP_ASSIGNED
        prof = BehaviorProfile(
            employee_code="EMP_ASSIGNED", avg_login_time=9.1, avg_logout_time=18.0, login_frequency=1.2,
            weekend_logins=1, night_logins=2, failed_login_count=1, usb_usage_frequency=0.2,
            file_access_frequency=15.0, file_copy_frequency=1.0, external_email_count=5, internal_email_count=15,
            web_browsing_frequency=45.0, suspicious_web_visits=1, department="Data Science", manager="Supervisor X",
            psychometric_o=40, psychometric_c=40, psychometric_e=40, psychometric_a=40, psychometric_n=40
        )
        base = BehaviorBaseline(
            employee_code="EMP_ASSIGNED", normal_login_hour=9.0, normal_logout_hour=17.5,
            avg_usb_per_day=0.1, avg_files_per_day=10.0, avg_emails_per_day=12.0, avg_websites_per_day=40.0
        )
        feat = BehaviorFeature(
            employee_code="EMP_ASSIGNED", late_login=0.1, weekend_login=1.0, multiple_devices=1,
            usb_usage=0.2, mass_file_access=15.0, large_file_transfer=1.0, external_email_ratio=0.25,
            job_search_websites=1, failed_logins=1, login_frequency=1.2, average_session_duration=8.9,
            activity_after_hours=3.0
        )
        risk = RiskScore(employee_code="EMP_ASSIGNED", risk_score=35.5)
        anom = Anomaly(employee_code="EMP_ASSIGNED", score=-0.05, is_anomaly=True, details="Weekend login activity")
        alert = Alert(employee_code="EMP_ASSIGNED", severity="MEDIUM", threat_type="Late Night Login", description="Late night logon warning")
        report = ThreatReport(employee_code="EMP_ASSIGNED", risk_score=35.5, detected_anomalies="Weekend logins", behavior_changes="Shifts in logins", threat_level="MEDIUM", recommendations="Audit access")
        
        db.session.add_all([prof, base, feat, risk, anom, alert, report])
        db.session.commit()
        
        # Get tokens
        self.tokens = {}
        for role_key, username in [("admin", "test_admin"), ("analyst", "test_analyst"), ("soc", "test_soc"), ("employee", "test_employee")]:
            res = self.client.post("/api/auth/login", data=json.dumps({"username": username, "password": "password123"}), content_type="application/json")
            data = json.loads(res.data)
            self.tokens[role_key] = data["data"]["access_token"]

    def tearDown(self):
        """Drops context."""
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def get_auth_header(self, username):
        return {"Authorization": f"Bearer {self.tokens[username]}"}

    def test_analytics_overview_rbac(self):
        """Verify GET /api/analytics/overview permits Admin, Analyst, SOC and rejects Employee."""
        # 1. Admin
        res = self.client.get("/api/analytics/overview", headers=self.get_auth_header("admin"))
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["total_analyzed_users"], 1)
        self.assertEqual(data["data"]["average_risk_score"], 35.5)

        # 2. Analyst
        res = self.client.get("/api/analytics/overview", headers=self.get_auth_header("analyst"))
        self.assertEqual(res.status_code, 200)

        # 3. SOC
        res = self.client.get("/api/analytics/overview", headers=self.get_auth_header("soc"))
        self.assertEqual(res.status_code, 200)

        # 4. Employee (should return 403 Forbidden)
        res = self.client.get("/api/analytics/overview", headers=self.get_auth_header("employee"))
        self.assertEqual(res.status_code, 403)

    def test_risk_distribution_rbac(self):
        """Verify GET /api/analytics/risk-distribution permits Admin/Analyst and rejects SOC/Employee."""
        # 1. Admin
        res = self.client.get("/api/analytics/risk-distribution", headers=self.get_auth_header("admin"))
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data["data"]["low"], 1) # risk 35.5 is low

        # 2. Analyst
        res = self.client.get("/api/analytics/risk-distribution", headers=self.get_auth_header("analyst"))
        self.assertEqual(res.status_code, 200)

        # 3. SOC (should return 403)
        res = self.client.get("/api/analytics/risk-distribution", headers=self.get_auth_header("soc"))
        self.assertEqual(res.status_code, 403)

        # 4. Employee (should return 403)
        res = self.client.get("/api/analytics/risk-distribution", headers=self.get_auth_header("employee"))
        self.assertEqual(res.status_code, 403)

    def test_high_risk_users_rbac_and_isolation(self):
        """Verify high-risk list returns assigned employee for Analyst, all for Admin, and 403 for SOC."""
        # 1. Admin gets all
        res = self.client.get("/api/analytics/high-risk-users", headers=self.get_auth_header("admin"))
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(len(data["data"]), 1)
        self.assertEqual(data["data"][0]["employee_code"], "EMP_ASSIGNED")

        # 2. Analyst gets assigned list
        res = self.client.get("/api/analytics/high-risk-users", headers=self.get_auth_header("analyst"))
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(len(data["data"]), 1)
        self.assertEqual(data["data"][0]["employee_code"], "EMP_ASSIGNED")

        # 3. SOC (should return 403)
        res = self.client.get("/api/analytics/high-risk-users", headers=self.get_auth_header("soc"))
        self.assertEqual(res.status_code, 403)

    def test_employee_analytics_dossier_rbac(self):
        """Verify detailed dossier access permissions per employee scope."""
        # 1. Admin can fetch assigned
        res = self.client.get("/api/analytics/employee/EMP_ASSIGNED", headers=self.get_auth_header("admin"))
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data["data"]["risk_score"], 35.5)

        # 2. Analyst can fetch assigned
        res = self.client.get("/api/analytics/employee/EMP_ASSIGNED", headers=self.get_auth_header("analyst"))
        self.assertEqual(res.status_code, 200)

        # 3. Analyst CANNOT fetch unassigned employee (should return 403)
        res = self.client.get("/api/analytics/employee/EMP_UNASSIGNED", headers=self.get_auth_header("analyst"))
        self.assertEqual(res.status_code, 403)

        # 4. SOC cannot fetch detailed profile (should return 403)
        res = self.client.get("/api/analytics/employee/EMP_ASSIGNED", headers=self.get_auth_header("soc"))
        self.assertEqual(res.status_code, 403)

        # 5. Employee cannot fetch another employee's dossier (should return 403)
        res = self.client.get("/api/analytics/employee/EMP_ASSIGNED", headers=self.get_auth_header("employee"))
        self.assertEqual(res.status_code, 403)

if __name__ == "__main__":
    unittest.main()
