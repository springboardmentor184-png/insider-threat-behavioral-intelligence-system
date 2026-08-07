import unittest
import json
from datetime import datetime, date
from app import create_app
from database.db import db
from models.user import User
from models.employee import Employee
from models.role import Role
from models.alert import Alert
from models.audit_log import AuditLog
from models.notification import Notification
from models.risk_history import RiskHistory
from models.analytics_cache import AnalyticsCache
from models.investigation import Investigation, InvestigationEvent, InvestigationNote, Evidence
from config import Config

class TestConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    TESTING = True
    DEBUG = False
    WTF_CSRF_ENABLED = False

class Milestone3IntegrationTestCase(unittest.TestCase):
    def setUp(self):
        """
        Runs before each test method. Set up app context, tables, and seeding.
        """
        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()

        # Seed behavior metrics for calculation checks
        emp = Employee.query.filter_by(employee_code="EMP0001").first()
        if emp:
            from models.behavior_baseline import BehaviorBaseline
            from models.behavior_profile import BehaviorProfile
            from models.behavioral_feature import BehaviorFeature
            
            # Baseline seeding
            baseline = BehaviorBaseline(
                employee_code="EMP0001",
                normal_login_hour=8.5,
                normal_logout_hour=17.5,
                avg_usb_per_day=0.1,
                avg_files_per_day=5.0,
                avg_emails_per_day=12.0,
                avg_websites_per_day=15.0
            )
            db.session.add(baseline)
            
            # Profile features seeding
            profile = BehaviorProfile(
                employee_code="EMP0001",
                avg_login_time=11.2, # Late login deviation
                avg_logout_time=18.0,
                usb_usage_frequency=1.2, # Elevated USB installs
                file_access_frequency=28.0, # High file copy actions
                internal_email_count=15,
                external_email_count=45,
                web_browsing_frequency=85.0,
                last_updated=datetime.utcnow()
            )
            db.session.add(profile)
            
            features = BehaviorFeature(
                employee_code="EMP0001",
                failed_logins=4,
                activity_after_hours=2.5,
                usb_usage=1.2,
                job_search_websites=6,
                late_login=0.6,
                weekend_login=1,
                multiple_devices=1,
                average_session_duration=9.5,
                last_updated=datetime.utcnow()
            )
            db.session.add(features)
            db.session.commit()

    def tearDown(self):
        """
        Runs after each test method. Drops database context.
        """
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def get_auth_headers(self):
        """
        Helper function to sign-in seeded admin user and get headers.
        """
        payload = {"username": "admin", "password": "password123"}
        res = self.client.post("/api/auth/login", data=json.dumps(payload), content_type="application/json")
        token = res.get_json()["data"]["access_token"]
        return {"Authorization": f"Bearer {token}"}

    def test_risk_calculations_and_deviations(self):
        """
        Verify the behavior risk scoring engine recalculates risk scores
        and returns details correctly via the REST API.
        """
        headers = self.get_auth_headers()
        
        # 1. Trigger full recalculation
        res = self.client.post("/api/risk/calculate", headers=headers)
        data = res.get_json()
        
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data["success"])
        self.assertGreater(data["data"]["calculated_count"], 0)

        # 2. Get risk registry list
        res_list = self.client.get("/api/risk", headers=headers)
        list_data = res_list.get_json()
        self.assertEqual(res_list.status_code, 200)
        self.assertTrue(list_data["success"])
        self.assertGreater(len(list_data["data"]["items"]), 0)

        # 3. Get individual employee deviations
        res_emp = self.client.get("/api/risk/EMP0001", headers=headers)
        emp_data = res_emp.get_json()
        self.assertEqual(res_emp.status_code, 200)
        self.assertTrue(emp_data["success"])
        self.assertEqual(emp_data["data"]["employee_code"], "EMP0001")
        self.assertGreaterEqual(emp_data["data"]["risk_score"], 0)

    def test_alert_lifecycle_and_auto_investigation(self):
        """
        Verify alert generation, severity changes, and auto-opening of cases.
        """
        headers = self.get_auth_headers()
        
        # 1. Post a high risk alert targeting EMP0001
        alert_payload = {
            "employee_code": "EMP0001",
            "threat_type": "Data Exfiltration Probe",
            "severity": "CRITICAL",
            "risk_score": 85.0,
            "description": "Employee mass copied critical engineering models to unauthorized external USB."
        }
        res_create = self.client.post("/api/alerts", data=json.dumps(alert_payload), content_type="application/json", headers=headers)
        create_data = res_create.get_json()
        self.assertEqual(res_create.status_code, 200)
        self.assertTrue(create_data["success"])
        alert_id = create_data["data"]["id"]
        
        # Verify alert exists in database
        alert = Alert.query.get(alert_id)
        self.assertIsNotNone(alert)
        self.assertEqual(alert.risk_score, 85.0)

        # 2. Check if a Case Investigation was automatically opened (because risk score 85 > threshold 70)
        self.assertIsNotNone(alert.investigation_id)
        investigation = Investigation.query.get(alert.investigation_id)
        self.assertIsNotNone(investigation)
        self.assertEqual(investigation.status, "OPEN")
        self.assertEqual(investigation.priority, "CRITICAL")

        # 3. Modify alert status to acknowledge / investigate
        update_payload = {"status": "INVESTIGATING"}
        res_update = self.client.put(f"/api/alerts/{alert_id}", data=json.dumps(update_payload), content_type="application/json", headers=headers)
        update_data = res_update.get_json()
        
        self.assertEqual(res_update.status_code, 200)
        self.assertEqual(Alert.query.get(alert_id).status, "INVESTIGATING")

    def test_investigation_case_notes_and_evidence(self):
        """
        Verify case folder modifications, adding notes, and attaching digital evidence logs.
        """
        headers = self.get_auth_headers()
        
        # Create investigation manually
        case_payload = {
            "employee_code": "EMP0001",
            "priority": "HIGH",
            "risk_score": 75.0
        }
        res_case = self.client.post("/api/investigations", data=json.dumps(case_payload), content_type="application/json", headers=headers)
        case_id = res_case.get_json()["data"]["id"]

        # 1. Update status to IN_PROGRESS
        update_payload = {"status": "IN_PROGRESS", "priority": "CRITICAL"}
        res_update = self.client.put(f"/api/investigations/{case_id}", data=json.dumps(update_payload), content_type="application/json", headers=headers)
        if res_update.status_code != 200:
            print("UPDATE_CASE_FAILED:", res_update.status_code, res_update.data)
        self.assertEqual(res_update.status_code, 200)
        
        caseObj = Investigation.query.get(case_id)
        self.assertEqual(caseObj.status, "IN_PROGRESS")
        self.assertEqual(caseObj.priority, "CRITICAL")

        # 2. Add an analyst comment/note
        note_payload = {"note": "This is an integration test notes trace."}
        res_note = self.client.post(f"/api/investigations/{case_id}/notes", data=json.dumps(note_payload), content_type="application/json", headers=headers)
        self.assertEqual(res_note.status_code, 200)
        self.assertEqual(len(caseObj.notes), 1)
        self.assertEqual(caseObj.notes[0].note, "This is an integration test notes trace.")

        # 3. Attach digital evidence details
        ev_payload = {
            "filename": "screenshot_exfiltrate.png",
            "filepath": "/evidence/screenshot_exfiltrate.png",
            "file_size": 245000
        }
        res_ev = self.client.post(f"/api/investigations/{case_id}/evidence", data=json.dumps(ev_payload), content_type="application/json", headers=headers)
        self.assertEqual(res_ev.status_code, 200)
        self.assertEqual(len(caseObj.evidence_files), 1)
        self.assertEqual(caseObj.evidence_files[0].filename, "screenshot_exfiltrate.png")

        # 4. Verify chronological timeline events count
        events = InvestigationEvent.query.filter_by(investigation_id=case_id).all()
        self.assertGreaterEqual(len(events), 3)

    def test_audit_logs_and_targeted_notifications(self):
        """
        Verify audit logs track case updates and targeted notifications deliver messages properly.
        """
        headers = self.get_auth_headers()
        
        # Trigger an administrative action
        alert_payload = {
            "employee_code": "EMP0001",
            "threat_type": "Malicious Probe",
            "severity": "CRITICAL",
            "risk_score": 90.0
        }
        self.client.post("/api/alerts", data=json.dumps(alert_payload), content_type="application/json", headers=headers)

        # 1. Audit log check
        audit = AuditLog.query.filter_by(action="CREATE_ALERT_MANUAL").first()
        self.assertIsNotNone(audit)
        self.assertEqual(audit.user.username, "admin")
        self.assertIn("EMP0001", audit.description)

        # 2. Targeted Notifications check
        notif = Notification.query.filter_by(recipient_role="SECURITY_ANALYST").first()
        self.assertIsNotNone(notif)
        self.assertIn("Critical Alert", notif.message)
        self.assertFalse(notif.is_read)

    def test_analytics_dashboard_cache_invalidation(self):
        """
        Verify analytics precalculations clear correctly upon database state updates.
        """
        headers = self.get_auth_headers()
        
        # 1. Access dashboard once to precalculate and cache
        res_dash = self.client.get("/api/analytics/dashboard", headers=headers)
        if res_dash.status_code != 200:
            print("DASHBOARD_FETCH_FAILED:", res_dash.status_code, res_dash.data)
        self.assertEqual(res_dash.status_code, 200)
        
        # Verify dashboard cache prefix exists
        cache = AnalyticsCache.query.filter(AnalyticsCache.cache_key.like("dashboard_%")).first()
        self.assertIsNotNone(cache)

        # 2. Trigger cache invalidation by posting new alert
        alert_payload = {
            "employee_code": "EMP0001",
            "threat_type": "Cache Invalidate Demo",
            "severity": "LOW",
            "risk_score": 15.0
        }
        self.client.post("/api/alerts", data=json.dumps(alert_payload), content_type="application/json", headers=headers)

        # Verify that dashboard cache is cleared
        cache_after = AnalyticsCache.query.filter(AnalyticsCache.cache_key.like("dashboard_%")).first()
        self.assertIsNone(cache_after)

    def test_reports_compilation_csv_exports(self):
        """
        Verify the reports module queries correct database schemas and yields CSV sheets.
        """
        headers = self.get_auth_headers()
        
        # Generate some alerts and investigations to export
        alert_payload = {
            "employee_code": "EMP0001",
            "threat_type": "Report Test Probe",
            "severity": "MEDIUM",
            "risk_score": 45.0
        }
        self.client.post("/api/alerts", data=json.dumps(alert_payload), content_type="application/json", headers=headers)

        # Trigger downloads
        reports = ["employee_risk", "alert", "investigation", "department", "security_summary"]
        for r in reports:
            res = self.client.get(f"/api/reports?type={r}&format=csv", headers=headers)
            self.assertEqual(res.status_code, 200)
            self.assertEqual(res.mimetype, "text/csv")
            csv_content = res.data.decode("utf-8")
            self.assertGreater(len(csv_content), 0)

if __name__ == "__main__":
    unittest.main()
