"""
Anomaly Detection Service: Runs threat detection models and rules on employee logs.
"""

import json
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone, timedelta
import collections
from typing import List, Dict, Any

from backend.models.dataset import (
    Employee, LogonEvent, DeviceEvent, FileEvent, EmailEvent, HttpEvent, 
    EmployeeBaseline, BehavioralAnomaly
)
from backend.services.behavioral_profiler import BehavioralProfilerService


class AnomalyDetectorService:
    @classmethod
    async def analyze_employee(cls, db: AsyncSession, employee_id: str) -> int:
        """
        Analyze logs of an employee against their baseline, generating anomalies.
        Returns the number of new anomalies generated.
        """
        # Ensure baseline exists, if not, compute it
        baseline_stmt = select(EmployeeBaseline).where(EmployeeBaseline.employee_id == employee_id)
        baseline = (await db.execute(baseline_stmt)).scalar_one_or_none()
        
        if not baseline:
            baseline = await BehavioralProfilerService.compute_employee_baseline(db, employee_id)

        anomalies_count = 0

        # Fetch all events to run scans
        logons = (await db.execute(select(LogonEvent).where(LogonEvent.employee_id == employee_id))).scalars().all()
        devices = (await db.execute(select(DeviceEvent).where(DeviceEvent.employee_id == employee_id))).scalars().all()
        files = (await db.execute(select(FileEvent).where(FileEvent.employee_id == employee_id))).scalars().all()
        emails = (await db.execute(select(EmailEvent).where(EmailEvent.employee_id == employee_id))).scalars().all()
        https = (await db.execute(select(HttpEvent).where(HttpEvent.employee_id == employee_id))).scalars().all()

        # Parse common PCs
        common_pcs = set(pc.strip() for pc in baseline.common_pcs.split(",") if pc.strip())

        # Keep track of existing anomaly timestamps/categories to prevent duplicates
        existing_stmt = select(BehavioralAnomaly).where(BehavioralAnomaly.employee_id == employee_id)
        existing_anomalies = (await db.execute(existing_stmt)).scalars().all()
        existing_keys = {(a.timestamp, a.category) for a in existing_anomalies}

        # Fetch target employee info for alert context with robust ID matching
        clean_id = employee_id.replace("EMP-", "").strip()
        emp_stmt = select(Employee).where((Employee.employee_id == employee_id) | (Employee.employee_id == clean_id))
        emp_obj = (await db.execute(emp_stmt)).scalar_one_or_none()
        if emp_obj:
            emp_name = emp_obj.full_name
            emp_dept = emp_obj.department or "General"
            display_emp_id = emp_obj.employee_id
        else:
            emp_name = f"Employee {clean_id}"
            emp_dept = "General"
            display_emp_id = clean_id

        async def add_anomaly(ts: datetime, cat: str, sev: str, desc: str, pc_val: str, details_dict: dict):
            nonlocal anomalies_count
            # Clean timestamp to remove timezone info for comparison with DB
            compare_ts = ts.replace(tzinfo=None) if ts.tzinfo else ts
            key = (compare_ts, cat)
            if key in existing_keys:
                return
            
            anomaly = BehavioralAnomaly(
                employee_id=employee_id,
                timestamp=ts,
                category=cat,
                severity=sev,
                description=desc,
                details=json.dumps(details_dict),
                status="Open",
                pc=pc_val,
                created_at=datetime.now(timezone.utc)
            )
            db.add(anomaly)
            existing_keys.add(key)
            anomalies_count += 1

            # Dispatch Realtime Monitoring Notification & Email Alert to Administrators & Security Managers
            if sev in ("Critical", "High", "Medium"):
                from backend.services.notification_service import NotificationService
                from backend.services.email_service import EmailService
                from backend.models.user import User
                from backend.models.enums import UserRole
                from backend.models.dataset import Incident
                from backend.services.investigation_service import InvestigationService

                # Ensure an Investigation Incident Case exists for this employee
                inc_stmt = select(Incident).where(
                    (Incident.employee_id.in_([employee_id, display_emp_id, clean_id])) & 
                    (Incident.status.in_(["Open", "Under Investigation"]))
                )
                existing_inc = (await db.execute(inc_stmt)).scalar_one_or_none()
                if not existing_inc:
                    try:
                        await InvestigationService.create_incident(
                            db,
                            employee_id=display_emp_id,
                            title=f"Behavioral Anomaly Alert: {cat}",
                            description=f"Auto-generated threat investigation case for {emp_name} (EMP-{display_emp_id}) due to {sev} severity anomaly pattern.",
                            severity=sev,
                            created_by="ITBIS Threat Engine",
                            assigned_analyst="Unassigned"
                        )
                    except Exception as inc_err:
                        print(f"[INVESTIGATION AUTO-CREATE WARNING] {inc_err}")

                # Query admin and security manager emails
                recip_stmt = select(User.email).where(User.role.in_([UserRole.ADMINISTRATOR, UserRole.SECURITY_MANAGER]))
                admin_emails = list((await db.execute(recip_stmt)).scalars().all())
                if not admin_emails:
                    admin_emails = ["admin@itbis.com", "manager@itbis.com"]

                # In-app notification
                await NotificationService.create_notification(
                    db,
                    user_email="all",
                    title=f"Anomaly Alert [{sev.upper()}]: EMP-{display_emp_id} ({emp_name})",
                    message=f"{desc} (Category: {cat}, Workstation: {pc_val})",
                    category="Threat Alert"
                )

                # Real-time Email Security Alert with Technical Explanation
                await EmailService.notify_threat_alert(
                    recipients=admin_emails,
                    employee_id=display_emp_id,
                    anomaly_category=cat,
                    severity=sev,
                    details=desc,
                    employee_name=emp_name,
                    department=emp_dept,
                    pc_val=pc_val,
                    explanation=f"{desc}\n\nTechnical Parameters: {json.dumps(details_dict, indent=2)}"
                )

        # ----------------------------------------------------
        # RULE 1: Logon Hours & Unauthorized PCs
        # ----------------------------------------------------
        for log in logons:
            if log.activity.lower() == "logon":
                hour = log.timestamp.hour
                is_after_hours = (hour >= 18 or hour < 8)
                is_weekend = (log.timestamp.weekday() in (5, 6))

                # After-hours Logon Anomaly
                if is_after_hours and baseline.after_hours_logon_ratio < 0.15:
                    await add_anomaly(
                        ts=log.timestamp,
                        cat="Unusual Login Time",
                        sev="Medium" if is_weekend else "Low",
                        desc=f"Logon activity after-hours ({log.timestamp.strftime('%H:%M')}) is unusual for this user.",
                        pc_val=log.pc,
                        details_dict={"event_id": log.event_id, "hour": hour, "after_hours_ratio": baseline.after_hours_logon_ratio}
                    )

                # Weekend Logon Anomaly
                if is_weekend and baseline.weekend_logon_ratio < 0.05:
                    await add_anomaly(
                        ts=log.timestamp,
                        cat="Unusual Login Time",
                        sev="Medium",
                        desc="Weekend logon activity is out of pattern for this employee.",
                        pc_val=log.pc,
                        details_dict={"event_id": log.event_id, "day": log.timestamp.strftime('%A'), "weekend_ratio": baseline.weekend_logon_ratio}
                    )

                # Unauthorized PC Logon Anomaly
                if common_pcs and log.pc not in common_pcs:
                    await add_anomaly(
                        ts=log.timestamp,
                        cat="Unauthorized Access Attempts",
                        sev="Medium",
                        desc=f"Employee logged into Host PC {log.pc} which is not part of their common logon profile.",
                        pc_val=log.pc,
                        details_dict={"event_id": log.event_id, "common_pcs": list(common_pcs)}
                    )

        # ----------------------------------------------------
        # RULE 2: USB Connections (After hours/Unusual)
        # ----------------------------------------------------
        for dev in devices:
            if dev.activity.lower() == "connect":
                hour = dev.timestamp.hour
                is_after_hours = (hour >= 18 or hour < 8)
                is_weekend = (dev.timestamp.weekday() in (5, 6))

                if is_after_hours or is_weekend:
                    await add_anomaly(
                        ts=dev.timestamp,
                        cat="Suspicious Device Usage",
                        sev="High",
                        desc=f"USB connection detected after-hours ({dev.timestamp.strftime('%H:%M') or 'weekend'}). High exfiltration risk.",
                        pc_val=dev.pc,
                        details_dict={"event_id": dev.event_id, "hour": hour, "weekend": is_weekend}
                    )
                elif baseline.avg_daily_usb_connects < 0.2:
                    await add_anomaly(
                        ts=dev.timestamp,
                        cat="Suspicious Device Usage",
                        sev="Medium",
                        desc="USB storage connection by an employee who historically rarely uses external devices.",
                        pc_val=dev.pc,
                        details_dict={"event_id": dev.event_id, "avg_daily_usb_connects": baseline.avg_daily_usb_connects}
                    )

        # ----------------------------------------------------
        # RULE 3: Daily File Access Spikes & Sensitive Extensions
        # ----------------------------------------------------
        # Group file events by day
        files_by_day = collections.defaultdict(list)
        for f in files:
            files_by_day[f.timestamp.date()].append(f)

        for day, day_files in files_by_day.items():
            count = len(day_files)
            # Flag spike
            if count > max(5, int(baseline.avg_daily_file_accesses * 3.0)):
                # Take first event timestamp on that day
                sample_event = day_files[0]
                await add_anomaly(
                    ts=datetime.combine(day, datetime.min.time(), tzinfo=timezone.utc),
                    cat="Abnormal Data Download",
                    sev="High",
                    desc=f"Daily file access count ({count}) is significantly higher than historical baseline.",
                    pc_val=sample_event.pc,
                    details_dict={"file_count": count, "avg_daily_baseline": baseline.avg_daily_file_accesses}
                )

            # Check individual files for ZIP or EXE copies
            for f in day_files:
                ext = f.filename.split(".")[-1].lower() if "." in f.filename else ""
                if ext in ("zip", "exe"):
                    await add_anomaly(
                        ts=f.timestamp,
                        cat="Excessive File Transfers",
                        sev="Medium",
                        desc=f"Accessed or created a files with potential exfiltration/malware extension: {f.filename}.",
                        pc_val=f.pc,
                        details_dict={"event_id": f.event_id, "filename": f.filename}
                    )

        # ----------------------------------------------------
        # RULE 4: Email Volume Spikes & External Domains
        # ----------------------------------------------------
        emails_by_day = collections.defaultdict(list)
        for em in emails:
            emails_by_day[em.timestamp.date()].append(em)

        for day, day_emails in emails_by_day.items():
            count = len(day_emails)
            if count > max(10, int(baseline.avg_daily_emails_sent * 3.0)):
                sample_event = day_emails[0]
                await add_anomaly(
                    ts=datetime.combine(day, datetime.min.time(), tzinfo=timezone.utc),
                    cat="Exfiltration Indicator",
                    sev="Medium",
                    desc=f"Daily email sending count ({count}) spiked significantly above baseline.",
                    pc_val=sample_event.pc,
                    details_dict={"email_count": count, "avg_daily_baseline": baseline.avg_daily_emails_sent}
                )

        for em in emails:
            # Check for large attachments sent outside dtaa.com
            is_external = not em.to_address.lower().endswith("@dtaa.com")
            if is_external and em.attachments > 0 and em.size > 50000:
                await add_anomaly(
                    ts=em.timestamp,
                    cat="Exfiltration Indicator",
                    sev="High",
                    desc=f"Large attachment ({em.size // 1024} KB) sent to external recipient: {em.to_address}.",
                    pc_val=em.pc,
                    details_dict={"event_id": em.event_id, "to_address": em.to_address, "size": em.size, "attachments": em.attachments}
                )

        # ----------------------------------------------------
        # RULE 5: Leak Sites and Cloud Upload spikes
        # ----------------------------------------------------
        job_domains = ["monster.com", "indeed.com", "careerbuilder.com", "simplyhired.com"]
        cloud_domains = ["dropbox.com", "drive.google.com", "mediafire.com", "megaupload.com", "box.com"]
        leak_domains = ["wikileaks.org", "wikileaks.com"]

        cloud_visits_by_day = collections.defaultdict(int)
        for ht in https:
            url = ht.url.lower()
            day = ht.timestamp.date()

            # WikiLeaks visit is CRITICAL
            if any(leak in url for leak in leak_domains):
                await add_anomaly(
                    ts=ht.timestamp,
                    cat="Exfiltration Indicator",
                    sev="Critical",
                    desc=f"Visited classified leak site: {ht.url}",
                    pc_val=ht.pc,
                    details_dict={"event_id": ht.event_id, "url": ht.url}
                )

            # Job search visits
            if any(job in url for job in job_domains) and baseline.job_search_ratio < 0.05:
                await add_anomaly(
                    ts=ht.timestamp,
                    cat="Insider Risk Indicators",
                    sev="Low",
                    desc=f"Web search for employment/job sites detected: {ht.url}.",
                    pc_val=ht.pc,
                    details_dict={"event_id": ht.event_id, "url": ht.url}
                )

            # Cloud storage counts
            if any(cloud in url for cloud in cloud_domains):
                cloud_visits_by_day[day] += 1

        for day, count in cloud_visits_by_day.items():
            expected_cloud_daily = baseline.avg_daily_web_browses * baseline.cloud_upload_ratio
            if count > max(5, int(expected_cloud_daily * 3.0)):
                await add_anomaly(
                    ts=datetime.combine(day, datetime.min.time(), tzinfo=timezone.utc),
                    cat="Exfiltration Indicator",
                    sev="High",
                    desc=f"Daily cloud storage uploads count ({count}) is significantly higher than user baseline.",
                    pc_val="N/A",
                    details_dict={"cloud_visit_count": count, "baseline_expected": expected_cloud_daily}
                )

        await db.flush()
        return anomalies_count

    @classmethod
    async def analyze_all_employees(cls, db: AsyncSession) -> int:
        """
        Scan all active employees for anomalies and dispatch full individual anomaly report emails.
        """
        from backend.services.email_service import EmailService
        from backend.services.risk_scorer import RiskScorerService
        from backend.models.user import User
        from backend.models.enums import UserRole
        from sqlalchemy import desc

        emp_stmt = select(Employee).where(Employee.is_active == True)
        employees = (await db.execute(emp_stmt)).scalars().all()

        recip_stmt = select(User.email).where(User.role.in_([UserRole.ADMINISTRATOR, UserRole.SECURITY_MANAGER]))
        mgr_emails = list((await db.execute(recip_stmt)).scalars().all())
        if not mgr_emails:
            mgr_emails = ["admin@itbis.com", "manager@itbis.com"]

        total = 0
        for emp in employees:
            new_anom = await cls.analyze_employee(db, emp.employee_id)
            total += new_anom
            if new_anom > 0:
                # Fetch full anomalies list for this specific employee
                anom_stmt = select(BehavioralAnomaly).where(BehavioralAnomaly.employee_id == emp.employee_id).order_by(desc(BehavioralAnomaly.timestamp))
                anomalies = (await db.execute(anom_stmt)).scalars().all()
                anom_list = [
                    {
                        "category": a.category,
                        "severity": a.severity,
                        "description": a.description,
                        "pc": a.pc or "N/A",
                        "timestamp": a.timestamp.strftime("%Y-%m-%d %H:%M UTC")
                    }
                    for a in anomalies
                ]
                risk_cat = RiskScorerService.categorize_risk(emp.risk_score)

                # Send Full Individual Employee Anomaly Report to Managers/Admins
                await EmailService.send_employee_anomaly_report_email(
                    recipients=mgr_emails,
                    employee_id=emp.employee_id,
                    employee_name=emp.full_name,
                    department=emp.department or "General",
                    risk_score=emp.risk_score,
                    risk_category=risk_cat,
                    anomalies=anom_list
                )
        
        await db.commit()
        return total
