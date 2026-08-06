"""
Threat Investigation Module (Module 7 & 9)
Manages incident creation, unified activity timelines, evidence attachment, and analyst assignments.
"""

from datetime import datetime, timezone
from sqlalchemy import select, func, desc, or_
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Optional

from backend.models.dataset import (
    Employee, BehavioralAnomaly, Incident, IncidentEvidence,
    LogonEvent, DeviceEvent, FileEvent, EmailEvent, HttpEvent
)


class InvestigationService:
    @classmethod
    async def create_incident(
        cls,
        db: AsyncSession,
        employee_id: str,
        title: str,
        description: str,
        severity: str,
        created_by: str,
        assigned_analyst: Optional[str] = None
    ) -> Incident:
        """
        Create a new investigation case/incident for an employee.
        """
        # Generate auto-incremented incident number INC-YYYY-XXX
        count_stmt = select(func.count(Incident.id))
        total_incidents = (await db.execute(count_stmt)).scalar() or 0
        incident_number = f"INC-{datetime.now(timezone.utc).year}-{(total_incidents + 1):03d}"

        incident = Incident(
            incident_number=incident_number,
            employee_id=employee_id,
            title=title,
            description=description,
            severity=severity,
            status="Open",
            assigned_analyst=assigned_analyst or created_by,
            created_by=created_by,
            created_at=datetime.now(timezone.utc)
        )
        db.add(incident)
        await db.commit()
        await db.refresh(incident)
        return incident

    @classmethod
    async def get_all_incidents(
        cls,
        db: AsyncSession,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Incident]:
        """
        Fetch filtered investigation cases. Auto-seeds initial cases for high-risk employees if empty.
        """
        count_stmt = select(func.count(Incident.id))
        total_inc = (await db.execute(count_stmt)).scalar() or 0
        if total_inc == 0:
            try:
                anom_stmt = select(BehavioralAnomaly.employee_id).group_by(BehavioralAnomaly.employee_id).order_by(func.count(BehavioralAnomaly.id).desc()).limit(5)
                anom_emp_ids = list((await db.execute(anom_stmt)).scalars().all())
                if not anom_emp_ids:
                    emp_stmt = select(Employee.employee_id).limit(5)
                    anom_emp_ids = list((await db.execute(emp_stmt)).scalars().all())

                for emp_id in anom_emp_ids:
                    clean_id = emp_id.replace("EMP-", "").strip()
                    emp = (await db.execute(select(Employee).where((Employee.employee_id == emp_id) | (Employee.employee_id == clean_id)))).scalar_one_or_none()
                    emp_name = emp.full_name if emp else f"Employee {clean_id}"
                    
                    await cls.create_incident(
                        db,
                        employee_id=clean_id,
                        title=f"Behavioral Threat Investigation: {emp_name}",
                        description=f"Auto-generated threat investigation case for {emp_name} (EMP-{clean_id}) monitoring off-hours data transfers and unusual logon patterns.",
                        severity="High",
                        created_by="ITBIS Threat Engine",
                        assigned_analyst="analyst@itbis.com"
                    )
            except Exception as seed_err:
                print(f"[INCIDENTS SEED WARNING] {seed_err}")

        from sqlalchemy.orm import selectinload
        stmt = select(Incident).options(selectinload(Incident.evidence)).order_by(desc(Incident.created_at))
        if status:
            stmt = stmt.where(Incident.status == status)
        if severity:
            stmt = stmt.where(Incident.severity == severity)
        if search:
            stmt = stmt.where(
                or_(
                    Incident.title.ilike(f"%{search}%"),
                    Incident.incident_number.ilike(f"%{search}%"),
                    Incident.employee_id.ilike(f"%{search}%")
                )
            )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    @classmethod
    async def update_incident(
        cls,
        db: AsyncSession,
        incident_id: int,
        status: Optional[str] = None,
        assigned_analyst: Optional[str] = None,
        severity: Optional[str] = None
    ) -> Incident:
        """
        Update status, severity, or assigned analyst for an incident case.
        """
        stmt = select(Incident).where(Incident.id == incident_id)
        incident = (await db.execute(stmt)).scalar_one_or_none()
        if not incident:
            raise ValueError("Incident case not found")

        if status:
            incident.status = status
        if assigned_analyst:
            incident.assigned_analyst = assigned_analyst
        if severity:
            incident.severity = severity

        await db.commit()
        await db.refresh(incident)
        return incident

    @classmethod
    async def attach_evidence(
        cls,
        db: AsyncSession,
        incident_id: int,
        added_by: str,
        note: str,
        anomaly_id: Optional[int] = None,
        event_type: Optional[str] = None,
        event_id: Optional[str] = None
    ) -> IncidentEvidence:
        """
        Attach evidence, anomalies, or analyst notes to an incident case.
        """
        evidence = IncidentEvidence(
            incident_id=incident_id,
            anomaly_id=anomaly_id,
            event_type=event_type or "Note",
            event_id=event_id,
            note=note,
            added_by=added_by,
            created_at=datetime.now(timezone.utc)
        )
        db.add(evidence)
        await db.commit()
        await db.refresh(evidence)
        return evidence

    @classmethod
    async def get_activity_timeline(cls, db: AsyncSession, employee_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Merge logon, device, file, email, and HTTP logs into a unified activity timeline for an employee.
        Supports both raw employee IDs and 'EMP-' prefixed IDs.
        """
        clean_id = employee_id.replace("EMP-", "").strip()
        emp_ids = list(set([employee_id, clean_id, f"EMP-{clean_id}"]))

        logons = (await db.execute(select(LogonEvent).where(LogonEvent.employee_id.in_(emp_ids)).order_by(desc(LogonEvent.timestamp)).limit(limit))).scalars().all()
        devices = (await db.execute(select(DeviceEvent).where(DeviceEvent.employee_id.in_(emp_ids)).order_by(desc(DeviceEvent.timestamp)).limit(limit))).scalars().all()
        files = (await db.execute(select(FileEvent).where(FileEvent.employee_id.in_(emp_ids)).order_by(desc(FileEvent.timestamp)).limit(limit))).scalars().all()
        emails = (await db.execute(select(EmailEvent).where(EmailEvent.employee_id.in_(emp_ids)).order_by(desc(EmailEvent.timestamp)).limit(limit))).scalars().all()
        https = (await db.execute(select(HttpEvent).where(HttpEvent.employee_id.in_(emp_ids)).order_by(desc(HttpEvent.timestamp)).limit(limit))).scalars().all()
        anomalies = (await db.execute(select(BehavioralAnomaly).where(BehavioralAnomaly.employee_id.in_(emp_ids)).order_by(desc(BehavioralAnomaly.timestamp)).limit(limit))).scalars().all()

        timeline = []
        for l in logons:
            timeline.append({
                "timestamp": l.timestamp.isoformat(),
                "event_type": "Logon",
                "pc": l.pc,
                "activity": l.activity,
                "details": f"System Logon event on host {l.pc} ({l.activity})"
            })
        for d in devices:
            timeline.append({
                "timestamp": d.timestamp.isoformat(),
                "event_type": "Device",
                "pc": d.pc,
                "activity": d.activity,
                "details": f"USB Device {d.activity} on host {d.pc}"
            })
        for f in files:
            timeline.append({
                "timestamp": f.timestamp.isoformat(),
                "event_type": "File",
                "pc": f.pc,
                "activity": "File Touch",
                "details": f"Accessed file: {f.filename}"
            })
        for e in emails:
            timeline.append({
                "timestamp": e.timestamp.isoformat(),
                "event_type": "Email",
                "pc": e.pc,
                "activity": "Email Sent",
                "details": f"Sent email to {e.to_address} (Size: {e.size} bytes, Attachments: {e.attachments})"
            })
        for h in https:
            timeline.append({
                "timestamp": h.timestamp.isoformat(),
                "event_type": "HTTP",
                "pc": h.pc,
                "activity": "Web Browse",
                "details": f"Browsed URL: {h.url[:80]}"
            })
        for a in anomalies:
            timeline.append({
                "timestamp": a.timestamp.isoformat(),
                "event_type": "ANOMALY_ALERT",
                "pc": a.pc or "N/A",
                "activity": f"ALERT: {a.category}",
                "details": f"[{a.severity.upper()}] {a.description}"
            })

        # Sort timeline descending by timestamp
        timeline.sort(key=lambda x: x["timestamp"], reverse=True)
        return timeline[:limit]
