import json
from datetime import datetime, timedelta
from database.db import db
from config import config_instance
from models import (
    Employee, Alert, Investigation, InvestigationEvent, 
    InvestigationNote, Evidence, AuditLog, Notification, AnalyticsCache, User
)
from utils.logger import get_logger
from services.email_service import EmailNotificationService

logger = get_logger()

class CacheManager:
    @staticmethod
    def get_cached(key):
        """
        Retrieves cached value if present and not expired.
        """
        try:
            cached = AnalyticsCache.query.filter_by(cache_key=key).first()
            if cached:
                if cached.expires_at and cached.expires_at < datetime.utcnow():
                    db.session.delete(cached)
                    db.session.commit()
                    return None
                return json.loads(cached.cache_value)
        except Exception as e:
            logger.warning(f"Cache retrieval failure for key {key}: {str(e)}")
        return None

    @staticmethod
    def set_cached(key, value, expire_seconds=300):
        """
        Saves value in cache with expiration.
        """
        try:
            # Delete old if exists
            old = AnalyticsCache.query.filter_by(cache_key=key).first()
            if old:
                db.session.delete(old)
            
            new_cache = AnalyticsCache(
                cache_key=key,
                cache_value=json.dumps(value),
                expires_at=datetime.utcnow() + timedelta(seconds=expire_seconds)
            )
            db.session.add(new_cache)
            db.session.commit()
        except Exception as e:
            logger.warning(f"Cache write failure for key {key}: {str(e)}")

    @staticmethod
    def invalidate_by_prefix(prefix):
        """
        Invalidates all keys starting with prefix.
        """
        try:
            db.session.query(AnalyticsCache).filter(AnalyticsCache.cache_key.like(f"{prefix}%")).delete(synchronize_session='fetch')
            db.session.commit()
            logger.info(f"Invalidated cache keys matching prefix: {prefix}")
        except Exception as e:
            logger.warning(f"Cache invalidation failure for prefix {prefix}: {str(e)}")

class AuditService:
    @staticmethod
    def log_action(user_id, action, target_type, target_id, description, ip_address="127.0.0.1"):
        """
        Logs administrative activities to AuditLog.
        """
        try:
            audit = AuditLog(
                user_id=user_id,
                action=action,
                target_type=target_type,
                target_id=target_id,
                description=description,
                ip_address=ip_address
            )
            db.session.add(audit)
            db.session.commit()
            logger.info(f"Audit Logged: {action} on {target_type} ID {target_id} by User {user_id or 'System'}")
        except Exception as e:
            logger.error(f"Failed to write AuditLog: {str(e)}")

class NotificationService:
    @staticmethod
    def notify(employee_code, message, severity, recipient_role=None, recipient_user_id=None):
        """
        Creates notifications targeted to users or roles.
        """
        try:
            notification = Notification(
                employee_code=employee_code,
                message=message,
                severity=severity,
                recipient_role=recipient_role,
                recipient_user_id=recipient_user_id
            )
            db.session.add(notification)
            db.session.commit()
            logger.info(f"Notification Triggered: {severity} - {message} (Target Role: {recipient_role}, User: {recipient_user_id})")
        except Exception as e:
            logger.error(f"Failed to create Notification: {str(e)}")

class InvestigationService:
    @staticmethod
    def evaluate_and_trigger_workflow(employee_code, risk_score, details):
        """
        Checks if risk index crosses critical thresholds and triggers Alerts / Investigations automatically.
        """
        # If risk score exceeds configured threshold (e.g. 70)
        threshold = config_instance.AUTO_INVESTIGATION_THRESHOLD
        if risk_score >= threshold:
            logger.warning(f"High risk detected for employee {employee_code} ({risk_score}%). Evaluating automation triggers...")
            should_send_critical_email = False
            
            # Find or create a Critical Alert
            alert = Alert.query.filter(
                Alert.employee_code == employee_code,
                Alert.threat_type == "Behavioral Deviation",
                Alert.status.in_(['OPEN', 'INVESTIGATING'])
            ).first()

            if not alert:
                alert = Alert(
                    employee_code=employee_code,
                    severity="CRITICAL" if risk_score >= 80 else "HIGH",
                    threat_type="Behavioral Deviation",
                    risk_score=risk_score,
                    description=f"Automated alert generated due to high risk index of {risk_score}%. Deviation factors: {', '.join(details.keys())}."
                )
                db.session.add(alert)
                db.session.flush() # get alert id
                
                NotificationService.notify(
                    employee_code=employee_code,
                    message=f"Alert Generated: High behavioral deviation detected for employee {employee_code} ({risk_score}%).",
                    severity="HIGH" if risk_score < 80 else "CRITICAL",
                    recipient_role="SECURITY_ANALYST"
                )
                should_send_critical_email = alert.severity == 'CRITICAL'
            else:
                # Keep the existing active alert current instead of creating a
                # duplicate on every scheduled risk calculation. Escalating an
                # existing alert to CRITICAL also warrants one email.
                was_critical = alert.severity == 'CRITICAL'
                alert.risk_score = risk_score
                if risk_score >= 80:
                    alert.severity = 'CRITICAL'
                    should_send_critical_email = not was_critical
            
            # Auto-trigger investigation case
            InvestigationService.trigger_case(employee_code, alert.id, risk_score)
            if should_send_critical_email:
                EmailNotificationService.send_critical_threat_alert(alert)

    @staticmethod
    def trigger_case(employee_code, alert_id, risk_score):
        """
        Checks if an investigation is already active. If not, initializes a new case folder.
        """
        existing_case = Investigation.query.filter(
            Investigation.employee_code == employee_code,
            Investigation.status.in_(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED'])
        ).first()

        if existing_case:
            # Case is already open, update score and add timeline event
            old_score = existing_case.risk_score
            existing_case.risk_score = risk_score
            
            if abs(risk_score - old_score) > 5.0:
                event = InvestigationEvent(
                    investigation_id=existing_case.id,
                    event_type="RISK_UPDATE",
                    description=f"System updated employee threat risk score from {old_score}% to {risk_score}%."
                )
                db.session.add(event)
                
            db.session.commit()
            logger.info(f"Investigation case is already open for employee {employee_code}. Score updated.")
            return existing_case

        # Create new Investigation Case
        emp = Employee.query.filter_by(employee_code=employee_code).first()
        priority = "CRITICAL" if risk_score >= 80 else "HIGH" if risk_score >= 60 else "MEDIUM"
        
        assigned_analyst = emp.assigned_analyst_id if emp else None
        status = "ASSIGNED" if assigned_analyst else "OPEN"

        case = Investigation(
            alert_id=alert_id,
            employee_code=employee_code,
            assigned_analyst_id=assigned_analyst,
            risk_score=risk_score,
            priority=priority,
            status=status
        )
        db.session.add(case)
        db.session.flush() # retrieve ID

        # Link alert to case
        if alert_id:
            alert = db.session.get(Alert, alert_id)
            if alert:
                alert.investigation_id = case.id
                alert.status = "INVESTIGATING"

        # Create Case Timeline Events
        event1 = InvestigationEvent(
            investigation_id=case.id,
            event_type="CASE_CREATED",
            description=f"Investigation folder created automatically. Risk score: {risk_score}%. Priority: {priority}."
        )
        db.session.add(event1)

        if assigned_analyst:
            event2 = InvestigationEvent(
                investigation_id=case.id,
                event_type="CASE_ASSIGNED",
                description=f"Case assigned automatically to analyst (Employee ID: {assigned_analyst})."
            )
            db.session.add(event2)
            
            # Send Notification to analyst
            analyst_user = User.query.filter_by(employee_id=assigned_analyst).first()
            if analyst_user:
                NotificationService.notify(
                    employee_code=employee_code,
                    message=f"New Investigation Assigned: Case ID {case.id} for employee {employee_code}.",
                    severity=priority,
                    recipient_user_id=analyst_user.id
                )

        db.session.commit()
        logger.info(f"Opened new Investigation Case ID {case.id} for employee {employee_code}")
        
        # Invalidate Cache
        CacheManager.invalidate_by_prefix("dashboard_")
        
        return case

    @staticmethod
    def assign_case(case_id, analyst_employee_id, user_id, ip_address="127.0.0.1"):
        """
        Manually assigns an analyst to an investigation.
        """
        case = db.session.get(Investigation, case_id)
        if not case:
            raise ValueError("Investigation case not found.")

        old_analyst = case.assigned_analyst_id
        case.assigned_analyst_id = analyst_employee_id
        case.status = "ASSIGNED"
        case.updated_at = datetime.utcnow()

        # Update employee assigned analyst in employee directory
        emp = Employee.query.filter_by(employee_code=case.employee_code).first()
        if emp:
            emp.assigned_analyst_id = analyst_employee_id

        # Timeline Event
        event = InvestigationEvent(
            investigation_id=case.id,
            event_type="CASE_ASSIGNED",
            description=f"Case reassigned from Employee ID {old_analyst or 'None'} to Employee ID {analyst_employee_id}.",
            user_id=user_id
        )
        db.session.add(event)
        db.session.commit()

        # Audit Logging
        AuditService.log_action(
            user_id=user_id,
            action="ASSIGN_CASE",
            target_type="INVESTIGATION",
            target_id=case.id,
            description=f"Assigned Case ID {case.id} to Analyst Employee ID {analyst_employee_id}",
            ip_address=ip_address
        )

        # Notify
        analyst_user = User.query.filter_by(employee_id=analyst_employee_id).first()
        if analyst_user:
            NotificationService.notify(
                employee_code=case.employee_code,
                message=f"New Case Assignment: Investigation Case ID {case.id} has been assigned to you.",
                severity=case.priority,
                recipient_user_id=analyst_user.id
            )

        CacheManager.invalidate_by_prefix("dashboard_")
        return case

    @staticmethod
    def update_case_status(case_id, new_status, user_id, ip_address="127.0.0.1"):
        """
        Updates investigation status and records timeline stage transition.
        """
        case = db.session.get(Investigation, case_id)
        if not case:
            raise ValueError("Investigation case not found.")

        old_status = case.status
        case.status = new_status
        case.updated_at = datetime.utcnow()

        # Sync alert status
        if case.alert:
            if new_status in ['RESOLVED', 'CLOSED']:
                case.alert.status = 'RESOLVED'
            else:
                case.alert.status = 'INVESTIGATING'

        # Timeline Event
        event = InvestigationEvent(
            investigation_id=case.id,
            event_type="STATUS_UPDATE",
            description=f"Investigation status transitioned from {old_status} to {new_status}.",
            user_id=user_id
        )
        db.session.add(event)
        db.session.commit()

        # Audit logging
        AuditService.log_action(
            user_id=user_id,
            action="UPDATE_CASE_STATUS",
            target_type="INVESTIGATION",
            target_id=case.id,
            description=f"Case ID {case.id} status changed from {old_status} to {new_status}",
            ip_address=ip_address
        )

        CacheManager.invalidate_by_prefix("dashboard_")
        return case

    @staticmethod
    def add_case_note(case_id, note_text, user_id, ip_address="127.0.0.1"):
        """
        Appends an analyst note/comment to the case log.
        """
        case = db.session.get(Investigation, case_id)
        if not case:
            raise ValueError("Investigation case not found.")

        note = InvestigationNote(
            investigation_id=case_id,
            author_id=user_id,
            note=note_text
        )
        db.session.add(note)

        # Timeline Event
        event = InvestigationEvent(
            investigation_id=case_id,
            event_type="NOTE_ADDED",
            description="Analyst appended comments / investigation notes.",
            user_id=user_id
        )
        db.session.add(event)
        db.session.commit()

        # Audit logging
        AuditService.log_action(
            user_id=user_id,
            action="ADD_CASE_NOTE",
            target_type="INVESTIGATION",
            target_id=case_id,
            description=f"Added note to Case ID {case_id}",
            ip_address=ip_address
        )

        return note

    @staticmethod
    def add_case_evidence(case_id, filename, filepath, file_size, user_id, ip_address="127.0.0.1"):
        """
        Attaches files / digital evidence logs to the case folder.
        """
        case = db.session.get(Investigation, case_id)
        if not case:
            raise ValueError("Investigation case not found.")

        evidence = Evidence(
            investigation_id=case_id,
            filename=filename,
            filepath=filepath,
            file_size=file_size,
            uploaded_by_id=user_id
        )
        db.session.add(evidence)

        # Timeline Event
        event = InvestigationEvent(
            investigation_id=case_id,
            event_type="EVIDENCE_ADDED",
            description=f"Evidence file attached: '{filename}' ({file_size or 0} bytes).",
            user_id=user_id
        )
        db.session.add(event)
        db.session.commit()

        # Audit logging
        AuditService.log_action(
            user_id=user_id,
            action="ADD_CASE_EVIDENCE",
            target_type="INVESTIGATION",
            target_id=case_id,
            description=f"Attached evidence '{filename}' to Case ID {case_id}",
            ip_address=ip_address
        )

        return evidence
