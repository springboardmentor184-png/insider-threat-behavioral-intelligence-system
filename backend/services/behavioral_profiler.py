"""
Behavioral Profiling Service: Computes historical behavioral baselines for employees.
"""

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone
import collections
from typing import List, Dict, Any

from backend.models.dataset import Employee, LogonEvent, DeviceEvent, FileEvent, EmailEvent, HttpEvent, EmployeeBaseline


class BehavioralProfilerService:
    @staticmethod
    async def compute_employee_baseline(db: AsyncSession, employee_id: str) -> EmployeeBaseline:
        """
        Compute baseline behavior stats for a single employee based on their historical events in the DB.
        """
        # Fetch all logon events
        logon_stmt = select(LogonEvent).where(LogonEvent.employee_id == employee_id)
        logons = (await db.execute(logon_stmt)).scalars().all()

        # Fetch all device events
        device_stmt = select(DeviceEvent).where(DeviceEvent.employee_id == employee_id)
        devices = (await db.execute(device_stmt)).scalars().all()

        # Fetch all file events
        file_stmt = select(FileEvent).where(FileEvent.employee_id == employee_id)
        files = (await db.execute(file_stmt)).scalars().all()

        # Fetch all email events
        email_stmt = select(EmailEvent).where(EmailEvent.employee_id == employee_id)
        emails = (await db.execute(email_stmt)).scalars().all()

        # Fetch all http events
        http_stmt = select(HttpEvent).where(HttpEvent.employee_id == employee_id)
        https = (await db.execute(http_stmt)).scalars().all()

        # Track unique days of activity to calculate daily averages
        active_days = set()
        for log in logons:
            active_days.add(log.timestamp.date())
        for dev in devices:
            active_days.add(dev.timestamp.date())
        for f in files:
            active_days.add(f.timestamp.date())
        for em in emails:
            active_days.add(em.timestamp.date())
        for ht in https:
            active_days.add(ht.timestamp.date())

        num_days = len(active_days) or 1

        # 1. Logon Stats
        total_logons = len(logons)
        avg_daily_logons = total_logons / num_days

        after_hours_logons = 0
        weekend_logons = 0
        pc_counts = collections.Counter()

        for log in logons:
            # After hours: 6:00 PM (18) to 8:00 AM (8)
            hour = log.timestamp.hour
            if hour >= 18 or hour < 8:
                after_hours_logons += 1
            # Weekend: Saturday (5) or Sunday (6)
            if log.timestamp.weekday() in (5, 6):
                weekend_logons += 1
            if log.activity.lower() == "logon":
                pc_counts[log.pc] += 1

        after_hours_logon_ratio = after_hours_logons / total_logons if total_logons > 0 else 0.0
        weekend_logon_ratio = weekend_logons / total_logons if total_logons > 0 else 0.0

        # Select common PCs (those representing at least 20% of logons)
        common_pcs_list = []
        for pc, count in pc_counts.items():
            if count >= max(1, int(total_logons * 0.2)):
                common_pcs_list.append(pc)
        common_pcs = ",".join(common_pcs_list)

        # 2. USB Stats
        usb_connects = [dev for dev in devices if dev.activity.lower() == "connect"]
        avg_daily_usb_connects = len(usb_connects) / num_days

        # 3. File Stats
        avg_daily_file_accesses = len(files) / num_days

        # 4. Email Stats
        avg_daily_emails_sent = len(emails) / num_days
        total_attachments = sum(em.attachments for em in emails)
        avg_email_attachment_count = total_attachments / len(emails) if len(emails) > 0 else 0.0
        total_size = sum(em.size for em in emails)
        avg_email_size = total_size / len(emails) if len(emails) > 0 else 0.0

        # 5. Web Browsing Stats
        avg_daily_web_browses = len(https) / num_days

        job_search_count = 0
        cloud_upload_count = 0
        job_domains = ["monster.com", "indeed.com", "careerbuilder.com", "simplyhired.com"]
        cloud_domains = ["dropbox.com", "drive.google.com", "mediafire.com", "megaupload.com", "box.com"]

        for ht in https:
            url = ht.url.lower()
            if any(domain in url for domain in job_domains):
                job_search_count += 1
            if any(domain in url for domain in cloud_domains):
                cloud_upload_count += 1

        job_search_ratio = job_search_count / len(https) if len(https) > 0 else 0.0
        cloud_upload_ratio = cloud_upload_count / len(https) if len(https) > 0 else 0.0

        # Fetch or create baseline
        baseline_stmt = select(EmployeeBaseline).where(EmployeeBaseline.employee_id == employee_id)
        baseline = (await db.execute(baseline_stmt)).scalar_one_or_none()

        if not baseline:
            baseline = EmployeeBaseline(employee_id=employee_id)
            db.add(baseline)

        baseline.avg_daily_logons = avg_daily_logons
        baseline.after_hours_logon_ratio = after_hours_logon_ratio
        baseline.weekend_logon_ratio = weekend_logon_ratio
        baseline.avg_daily_usb_connects = avg_daily_usb_connects
        baseline.avg_daily_file_accesses = avg_daily_file_accesses
        baseline.avg_daily_emails_sent = avg_daily_emails_sent
        baseline.avg_email_attachment_count = avg_email_attachment_count
        baseline.avg_email_size = avg_email_size
        baseline.avg_daily_web_browses = avg_daily_web_browses
        baseline.job_search_ratio = job_search_ratio
        baseline.cloud_upload_ratio = cloud_upload_ratio
        baseline.common_pcs = common_pcs
        baseline.updated_at = datetime.now(timezone.utc)

        await db.flush()
        return baseline

    @classmethod
    async def compute_all_baselines(cls, db: AsyncSession) -> int:
        """
        Recompute baselines for all active employees. Returns count.
        """
        emp_stmt = select(Employee).where(Employee.is_active == True)
        employees = (await db.execute(emp_stmt)).scalars().all()
        
        count = 0
        for emp in employees:
            await cls.compute_employee_baseline(db, emp.employee_id)
            count += 1
        
        await db.commit()
        return count
