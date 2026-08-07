import json
from datetime import datetime, timedelta
from database.db import db
from config import config_instance
from models import (
    Employee, BehaviorBaseline, BehaviorProfile, BehaviorFeature, 
    Anomaly, Alert, RiskScore, RiskHistory, Investigation, AuditLog, Notification
)
from utils.logger import get_logger

logger = get_logger()

class RiskEngine:
    @staticmethod
    def calculate_employee_risk(employee_code):
        """
        Dynamically calculates employee risk score (0-100) based on:
        1. Behavior-based deviations from baseline (Rule Score)
        2. Isolation Forest model anomaly scores
        3. Historical incidents & open alerts
        """
        rule_score = 0.0
        details = {}

        # Fetch employee behavioral entities
        baseline = BehaviorBaseline.query.filter_by(employee_code=employee_code).first()
        profile = BehaviorProfile.query.filter_by(employee_code=employee_code).first()
        features = BehaviorFeature.query.filter_by(employee_code=employee_code).first()

        # 1. Behavior deviation comparisons against baseline (Rule Score)
        # Indicator A: Late Login
        if profile and baseline and baseline.normal_login_hour is not None and profile.avg_login_time is not None:
            deviation = profile.avg_login_time - baseline.normal_login_hour
            if deviation > 2.0:
                rule_score += config_instance.WEIGHT_LATE_LOGIN
                details['late_login_deviation'] = f"Average login hour is {profile.avg_login_time:.2f}, baseline is {baseline.normal_login_hour:.2f} (deviation > 2h)"
        elif features and features.late_login > 0.2:
            rule_score += config_instance.WEIGHT_LATE_LOGIN
            details['late_login'] = f"Late logins ratio is high ({features.late_login:.2f})"

        # Indicator B: Weekend Login
        if profile and profile.weekend_logins > 2:
            rule_score += config_instance.WEIGHT_WEEKEND_LOGIN
            details['weekend_logins'] = f"Weekend logins count is {profile.weekend_logins}"
        elif features and features.weekend_login > 0.5:
            rule_score += config_instance.WEIGHT_WEEKEND_LOGIN
            details['weekend_login'] = f"Weekend login features trigger ({features.weekend_login:.2f})"

        # Indicator C: Multiple Failed Logins
        if profile and profile.failed_login_count > 2:
            rule_score += config_instance.WEIGHT_FAILED_LOGINS
            details['failed_login_count'] = f"Failed login attempts: {profile.failed_login_count}"
        elif features and features.failed_logins > 2:
            rule_score += config_instance.WEIGHT_FAILED_LOGINS
            details['failed_logins'] = f"Failed logins features trigger ({features.failed_logins})"

        # Indicator D: USB Device Usage Deviation
        if profile and baseline and baseline.avg_usb_per_day is not None and profile.usb_usage_frequency is not None:
            if baseline.avg_usb_per_day > 0 and profile.usb_usage_frequency > baseline.avg_usb_per_day * 2.0:
                rule_score += config_instance.WEIGHT_USB_USAGE
                details['usb_usage_deviation'] = f"USB frequency is {profile.usb_usage_frequency:.2f}/day, baseline is {baseline.avg_usb_per_day:.2f}/day (2x baseline)"
        elif features and features.usb_usage > 0.5:
            rule_score += config_instance.WEIGHT_USB_USAGE
            details['usb_usage'] = f"USB usage feature trigger ({features.usb_usage:.2f})"

        # Indicator E: Large File Transfer/Download Deviation
        if features and baseline and baseline.avg_files_per_day is not None:
            if features.large_file_transfer > baseline.avg_files_per_day * 0.5:
                rule_score += config_instance.WEIGHT_LARGE_DOWNLOAD
                details['large_download_deviation'] = f"Large file transfers count ({features.large_file_transfer:.2f}) exceeds baseline file volume threshold"
        elif features and features.large_file_transfer > 3.0:
            rule_score += config_instance.WEIGHT_LARGE_DOWNLOAD
            details['large_download'] = f"Large file transfer feature trigger ({features.large_file_transfer:.2f})"

        # Indicator F: Sensitive File Access / Mass File Access Deviation
        if profile and baseline and baseline.avg_files_per_day is not None and profile.file_access_frequency is not None:
            if baseline.avg_files_per_day > 0 and profile.file_access_frequency > baseline.avg_files_per_day * 3.0:
                rule_score += config_instance.WEIGHT_SENSITIVE_FILE_ACCESS
                details['mass_file_access_deviation'] = f"File access frequency is {profile.file_access_frequency:.2f}/day, baseline is {baseline.avg_files_per_day:.2f}/day (3x baseline)"
        elif features and features.mass_file_access > 20.0:
            rule_score += config_instance.WEIGHT_SENSITIVE_FILE_ACCESS
            details['mass_file_access'] = f"Mass file access features trigger ({features.mass_file_access:.2f})"

        # Indicator G: Excessive Email / External Email Deviation
        if profile and baseline and baseline.avg_emails_per_day is not None:
            total_emails = profile.external_email_count + profile.internal_email_count
            if baseline.avg_emails_per_day > 0 and total_emails > baseline.avg_emails_per_day * 2.5:
                rule_score += config_instance.WEIGHT_EXCESSIVE_EMAIL
                details['excessive_email_deviation'] = f"Total daily emails sent ({total_emails}) exceeds baseline limit ({baseline.avg_emails_per_day:.2f} * 2.5)"
        elif features and features.external_email_ratio > 0.6:
            rule_score += config_instance.WEIGHT_EXCESSIVE_EMAIL
            details['external_email_ratio'] = f"External email ratio is unusually high ({features.external_email_ratio:.2f})"

        # Indicator H: Unusual Web Browsing
        if profile and baseline and baseline.avg_websites_per_day is not None and profile.web_browsing_frequency is not None:
            if baseline.avg_websites_per_day > 0 and profile.web_browsing_frequency > baseline.avg_websites_per_day * 2.0:
                rule_score += config_instance.WEIGHT_UNUSUAL_WEB
                details['web_browsing_deviation'] = f"Web browsing frequency is {profile.web_browsing_frequency:.2f}/day, baseline is {baseline.avg_websites_per_day:.2f}/day (2x baseline)"
        elif profile and profile.suspicious_web_visits > 0:
            rule_score += config_instance.WEIGHT_UNUSUAL_WEB
            details['suspicious_web_visits'] = f"Visited {profile.suspicious_web_visits} suspicious/unauthorized domain(s)"
        elif features and features.job_search_websites > 1:
            rule_score += config_instance.WEIGHT_UNUSUAL_WEB
            details['job_search_websites'] = f"Unusual job search domain browsing detected ({features.job_search_websites} occurrences)"

        # Indicator I: Scan employee activity logs for administrative rule escalations
        from models.activity_log import ActivityLog
        recent_cutoff = datetime.utcnow() - timedelta(days=14)
        emp_record = Employee.query.filter_by(employee_code=employee_code).first()
        if emp_record:
            recent_logs = ActivityLog.query.filter(
                ActivityLog.employee_id == emp_record.id,
                ActivityLog.timestamp >= recent_cutoff
            ).all()

            priv_escalation = any('escalation' in log.activity_type.lower() or 'privilege' in log.description.lower() for log in recent_logs)
            folder_restriction = any('unauthorized' in log.activity_type.lower() or 'restricted' in log.description.lower() for log in recent_logs)

            if priv_escalation:
                rule_score += config_instance.WEIGHT_PRIVILEGE_ESCALATION
                details['privilege_escalation_attempt'] = "Detected recent privilege escalation attempts in event audit logs"
            if folder_restriction:
                rule_score += config_instance.WEIGHT_RESTRICTED_FOLDER
                details['restricted_folder_access'] = "Attempted access to restricted network file shares/folders"

        # Cap Rule Score contribution at 50 to allow ML and Historical to balance the scale
        rule_score = min(rule_score, 50.0)

        # 2. Isolation Forest Score contribution
        anomalies_query = Anomaly.query.filter_by(employee_code=employee_code, is_anomaly=True).all()
        anomaly_score = 0.0
        if anomalies_query:
            # Typically anomaly score is represented as values where < 0 denotes abnormality
            # Sum up magnitude of anomalies
            anomaly_score = sum(abs(a.score) * 40.0 for a in anomalies_query if a.score < 0)
            if anomaly_score > 0.0:
                details['ml_anomalies_count'] = f"Machine Learning Model flagged {len(anomalies_query)} behavioral anomalies"
        
        # Cap ML contribution at 30
        anomaly_score = min(anomaly_score, 30.0)

        # 3. Historical Incident Score contribution (open alerts and cases)
        incident_score = 0.0
        open_alerts_count = Alert.query.filter_by(employee_code=employee_code, status='OPEN').count()
        active_cases_count = Investigation.query.filter(
            Investigation.employee_code == employee_code,
            Investigation.status.in_(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED'])
        ).count()

        if open_alerts_count > 0:
            incident_score += open_alerts_count * 10.0
            details['open_alerts_count'] = f"{open_alerts_count} unresolved security alert(s) outstanding"
        if active_cases_count > 0:
            incident_score += active_cases_count * 15.0
            details['active_investigations_count'] = f"{active_cases_count} active security investigation case(s) ongoing"

        # Cap incident score contribution at 30
        incident_score = min(incident_score, 30.0)

        # Combine contributions
        combined_score = rule_score + anomaly_score + incident_score
        final_score = min(combined_score, 100.0)

        return round(final_score, 2), details

class RiskScoreService:
    @staticmethod
    def calculate_and_save_employee_risk(employee_code):
        """
        Runs calculation for a single employee, stores current risk score and records history.
        """
        score, details = RiskEngine.calculate_employee_risk(employee_code)

        # 1. Update or create current RiskScore
        rs = RiskScore.query.filter_by(employee_code=employee_code).first()
        if not rs:
            rs = RiskScore(employee_code=employee_code, risk_score=score)
            db.session.add(rs)
        else:
            rs.risk_score = score
            rs.last_updated = datetime.utcnow()

        # 2. Log entry in RiskHistory
        history = RiskHistory(
            employee_code=employee_code,
            risk_score=score,
            details=json.dumps(details)
        )
        db.session.add(history)
        db.session.commit()

        # 3. Auto-Trigger Alerts & Investigations on Criticality
        from services.investigation_service import InvestigationService
        InvestigationService.evaluate_and_trigger_workflow(employee_code, score, details)

        return score

    @staticmethod
    def calculate_all_employee_risks():
        """
        Iterates over all onboarded employees and recalculates risk indices.
        """
        employees = Employee.query.all()
        logger.info(f"Triggering global risk calculation for {len(employees)} employees...")
        
        calculated_count = 0
        for emp in employees:
            try:
                RiskScoreService.calculate_and_save_employee_risk(emp.employee_code)
                calculated_count += 1
            except Exception as ex:
                logger.error(f"Error calculating risk index for employee {emp.employee_code}: {str(ex)}", exc_info=True)
        
        logger.info(f"Global risk calculation complete. Recalculated {calculated_count} employees.")
        
        # Invalidate cache
        from services.investigation_service import CacheManager
        CacheManager.invalidate_by_prefix("dashboard_")
        
        return calculated_count

# Setup Scheduler for Automatic Recalculations
from apscheduler.schedulers.background import BackgroundScheduler
scheduler = BackgroundScheduler()

def start_risk_scheduler(app):
    """
    Starts the BackgroundScheduler running risk calculations daily.
    """
    if not scheduler.running:
        scheduler.add_job(
            func=lambda: app.app_context().push() or RiskScoreService.calculate_all_employee_risks(),
            trigger='interval',
            days=1,
            id='risk_recalc_job',
            replace_existing=True
        )
        scheduler.start()
        logger.info("APScheduler initialized for automatic daily risk score calculations.")
