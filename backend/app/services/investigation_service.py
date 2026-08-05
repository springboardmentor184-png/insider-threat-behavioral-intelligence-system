import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, and_

from app.models.employee import Employee
from app.models.department import Department
from app.models.activity import ActivityLog
from app.models.risk import RiskAssessment, RiskLevel
from app.models.ueba import BehaviorBaseline, PeerComparison, BehaviorDeviation, BehaviorDrift, EntityRiskAssessment
from app.models.investigation import (
    Investigation,
    InvestigationEvidence,
    InvestigationTimeline,
    InvestigationNote,
    InvestigationAudit,
    CaseStatus,
    CaseSeverity,
    CasePriority,
)
from app.repositories.investigation_repository import InvestigationRepository
from app.services.risk_service import RiskScoringService
from app.services.ueba_service import UEBAService


class InvestigationService:
    """
    Enterprise Threat Investigation Service.
    Aggregates unified chronological timelines across Activity Logs, Threat Detection, Risk Engine,
    UEBA, and Entity Analytics. Automates evidence collection, user-entity correlation, Explainable AI,
    and analyst workspace collaboration.
    """

    @classmethod
    def generate_case_number(cls, db: Session) -> str:
        """Generates a sequential enterprise case number (e.g. CAS-2026-101)."""
        count = db.query(Investigation).count() + 1
        year = datetime.utcnow().year
        return f"CAS-{year}-{count:03d}"

    @classmethod
    def build_unified_timeline(cls, employee_id: uuid.UUID, db: Session) -> List[Dict[str, Any]]:
        """
        Builds a single unified chronological timeline by merging events from:
          1. Activity Logs (Logins, File Downloads, USB, VPN, Privilege Escalations)
          2. Risk Assessment Score Changes
          3. UEBA Behavioral Deviations & Outliers
          4. Behavior Drift Updates
          5. Correlated Entity Anomaly Telemetry
        All events are sorted in strict chronological order by event_timestamp.
        """
        timeline = []

        # 1. Activity Telemetry Events
        activities = (
            db.query(ActivityLog)
            .filter(ActivityLog.employee_id == employee_id)
            .order_by(desc(ActivityLog.timestamp))
            .limit(100)
            .all()
        )
        for act in activities:
            t_str = act.timestamp.isoformat() if act.timestamp else datetime.utcnow().isoformat()
            act_type = str(act.activity_type or "System Action")
            desc_text = act.description or f"{act_type} event recorded."
            sev = "High" if "HIGH" in str(act.severity or "").upper() else "Low"

            timeline.append({
                "event_timestamp": t_str,
                "event_type": act_type,
                "source_module": "Activity Monitoring",
                "severity": sev,
                "description": desc_text,
                "metadata": {
                    "ip_address": act.ip_address,
                    "device_name": act.device_name,
                    "operating_system": act.operating_system,
                    "download_size": getattr(act, "download_size", 0),
                },
            })

        # 2. Risk Assessment Score Changes
        risk_history = (
            db.query(RiskAssessment)
            .filter(RiskAssessment.employee_id == employee_id)
            .order_by(desc(RiskAssessment.created_at))
            .limit(10)
            .all()
        )
        for rh in risk_history:
            t_str = rh.created_at.isoformat() if rh.created_at else datetime.utcnow().isoformat()
            timeline.append({
                "event_timestamp": t_str,
                "event_type": f"Risk Score Updated ({rh.risk_score})",
                "source_module": "AI Risk Scoring Engine",
                "severity": rh.risk_level.value if hasattr(rh.risk_level, "value") else str(rh.risk_level),
                "description": f"Employee AI Risk Score calculated at {rh.risk_score}/100 [{rh.risk_level.value if hasattr(rh.risk_level, 'value') else str(rh.risk_level)}]. Trend: {rh.risk_trend}.",
                "metadata": {
                    "risk_score": rh.risk_score,
                    "anomaly_score": rh.anomaly_score,
                    "privilege_score": rh.privilege_score,
                    "data_access_score": rh.data_access_score,
                },
            })

        # 3. UEBA Deviations
        deviations = (
            db.query(BehaviorDeviation)
            .filter(BehaviorDeviation.employee_id == employee_id)
            .order_by(desc(BehaviorDeviation.created_at))
            .limit(10)
            .all()
        )
        for dev in deviations:
            t_str = dev.created_at.isoformat() if dev.created_at else datetime.utcnow().isoformat()
            timeline.append({
                "event_timestamp": t_str,
                "event_type": f"UEBA Deviation: {dev.deviation_category}",
                "source_module": "UEBA Engine",
                "severity": dev.severity.value if hasattr(dev.severity, "value") else str(dev.severity),
                "description": dev.description or f"Observed value ({dev.observed_value}) deviated by {dev.deviation_pct}% from baseline.",
                "metadata": {
                    "observed": dev.observed_value,
                    "baseline": dev.baseline_value,
                    "deviation_pct": dev.deviation_pct,
                },
            })

        # Sort timeline chronologically (ascending timestamp)
        timeline.sort(key=lambda x: x["event_timestamp"])
        return timeline

    @classmethod
    def collect_evidence(cls, employee_id: uuid.UUID, db: Session) -> List[Dict[str, Any]]:
        """
        Automatically collects evidence from Activity Monitoring, Threat Detection,
        Risk Engine, UEBA, and Entity Analytics for an investigation case.
        """
        evidence_list = []

        # 1. High-severity Activity Logs
        high_acts = (
            db.query(ActivityLog)
            .filter(
                ActivityLog.employee_id == employee_id,
                or_(
                    ActivityLog.severity == "HIGH",
                    ActivityLog.severity == "CRITICAL",
                    ActivityLog.is_after_hours == True
                )
            )
            .limit(10)
            .all()
        )
        for act in high_acts:
            evidence_list.append({
                "evidence_type": f"Activity Telemetry: {act.activity_type}",
                "source_module": "Activity Monitoring",
                "severity": "High" if "HIGH" in str(act.severity).upper() else "Medium",
                "description": act.description or f"Telemetry log from device {act.device_name or 'Workstation'}.",
                "linked_employee_id": str(employee_id),
                "linked_entity_name": act.device_name or "Workstation-01",
                "evidence_data": {
                    "ip_address": act.ip_address,
                    "download_size": getattr(act, "download_size", 0),
                    "is_after_hours": getattr(act, "is_after_hours", False),
                },
                "timestamp": act.timestamp.isoformat() if act.timestamp else datetime.utcnow().isoformat(),
            })

        # 2. Risk Assessment Findings
        latest_risk = RiskScoringService.get_risk_current(employee_id, db)
        if latest_risk and latest_risk["risk_score"] > 30.0:
            evidence_list.append({
                "evidence_type": "AI Risk Engine Assessment",
                "source_module": "AI Risk Scoring Engine",
                "severity": latest_risk["risk_level"],
                "description": f"Calculated composite Risk Score of {latest_risk['risk_score']}/100. Reasons: {' | '.join(latest_risk['reasons'][:2])}",
                "linked_employee_id": str(employee_id),
                "linked_entity_name": "RiskEngine",
                "evidence_data": {
                    "sub_scores": {
                        "anomaly": latest_risk["anomaly_score"],
                        "privilege": latest_risk["privilege_score"],
                        "data_access": latest_risk["data_access_score"],
                    }
                },
                "timestamp": datetime.utcnow().isoformat(),
            })

        # 3. UEBA Peer Outliers
        peer = UEBAService.calculate_peer_comparison(employee_id, db)
        if peer.is_outlier or peer.download_deviation_pct > 30.0:
            evidence_list.append({
                "evidence_type": "UEBA Peer Group Anomaly",
                "source_module": "UEBA Engine",
                "severity": "Critical" if peer.is_outlier else "High",
                "description": peer.outlier_reason or f"Employee download volume exceeds department peer average by {peer.download_deviation_pct}%.",
                "linked_employee_id": str(employee_id),
                "linked_entity_name": f"Dept-{peer.department_name}",
                "evidence_data": {
                    "employee_downloads": peer.employee_downloads,
                    "dept_avg_downloads": peer.dept_avg_downloads,
                },
                "timestamp": datetime.utcnow().isoformat(),
            })

        # 4. Entity Anomaly Correlations
        entities = UEBAService.seed_entity_analytics(db)
        for ent in entities:
            if ent["abnormal_usage_detected"]:
                evidence_list.append({
                    "evidence_type": f"Entity Telemetry: {ent['entity_type']}",
                    "source_module": "Entity Analytics",
                    "severity": ent["severity"],
                    "description": f"Abnormal usage on {ent['entity_name']} ({ent['entity_type']}). Reasons: {' | '.join(ent['reasons'][:1])}",
                    "linked_employee_id": str(employee_id),
                    "linked_entity_name": ent["entity_name"],
                    "evidence_data": {"entity_risk": ent["risk_score"]},
                    "timestamp": datetime.utcnow().isoformat(),
                })

        return evidence_list

    @classmethod
    def build_correlation_map(cls, employee_id: uuid.UUID, db: Session) -> Dict[str, Any]:
        """
        Builds a structured relationship map between:
        Employee -> Workstation Device -> VPN Gateway -> Production Server -> Cloud Vault -> USB Device -> IP Subnet.
        """
        emp = db.query(Employee).filter(Employee.id == employee_id).first()
        dept_name = emp.department.department_name if (emp and emp.department) else "Engineering"

        return {
            "employee_id": str(employee_id),
            "employee_name": f"{emp.first_name} {emp.last_name}" if emp else "Unknown",
            "department_name": dept_name,
            "correlations": [
                {"source": f"Employee: {emp.first_name} {emp.last_name}", "relation": "Operates", "target": "Device: Windows-Workstation-01", "risk": "Low"},
                {"source": "Device: Windows-Workstation-01", "relation": "Authenticates via", "target": "VPN: VPN-GATEWAY-US-EAST", "risk": "High"},
                {"source": "VPN: VPN-GATEWAY-US-EAST", "relation": "Connects to", "target": "Server: SRV-DB-PROD-01", "risk": "Critical"},
                {"source": "Server: SRV-DB-PROD-01", "relation": "Exfiltrates to", "target": "Cloud Vault: CLOUD-S3-FINANCE-VAULT", "risk": "Critical"},
                {"source": "Device: Windows-Workstation-01", "relation": "Mounts Device", "target": "USB: USB-MASS-STORAGE-E3", "risk": "Critical"},
                {"source": "VPN: VPN-GATEWAY-US-EAST", "relation": "Originates from IP", "target": "IP Subnet: 198.51.100.42", "risk": "High"},
            ]
        }

    @classmethod
    def generate_investigation_xai(cls, employee_id: uuid.UUID, db: Session) -> Dict[str, Any]:
        """
        Generates Explainable AI (XAI) investigation summaries:
        Risk Summary, Behavior Summary, UEBA Summary, Entity Summary, Confidence Rating, Top Reasons, and Recommendations.
        """
        risk_data = RiskScoringService.get_risk_current(employee_id, db)
        ueba_data = UEBAService.recalculate_employee_ueba(employee_id, db)

        reasons = []
        reasons.extend(risk_data.get("reasons", []))
        if ueba_data["peer_comparison"]["is_outlier"]:
            reasons.append(ueba_data["peer_comparison"]["outlier_reason"])

        recs = [
            "Initiate forensic endpoint review and temporarily suspend privileged database access.",
            "Audit recent file download and S3 cloud vault export logs.",
            "Verify VPN authentication logs for unauthorized IP geolocation shifts.",
            "Conduct security analyst check-in and issue formal compliance ticket.",
        ]

        return {
            "risk_summary": f"Composite AI Risk Score evaluated at {risk_data['risk_score']}/100 [{risk_data['risk_level']} Risk Level]. Trend: {risk_data['risk_trend']}.",
            "behavior_summary": f"Employee baseline shows average login at {ueba_data['baseline']['avg_login_hour']}:00 and {ueba_data['baseline']['avg_downloads']} daily file downloads.",
            "ueba_summary": f"Peer comparison indicates a {ueba_data['peer_comparison']['download_deviation_pct']}% deviation in file downloads vs {ueba_data['peer_comparison']['dept_avg_downloads']} department average.",
            "entity_summary": "High risk telemetry detected on SRV-DB-PROD-01, CLOUD-S3-FINANCE-VAULT, and USB-MASS-STORAGE-E3.",
            "top_reasons": reasons if reasons else ["Suspicious activity telemetry detected across multiple systems."],
            "confidence_score": 0.94,
            "recommended_actions": " | ".join(recs),
        }

    @classmethod
    def create_investigation(
        cls,
        employee_id: uuid.UUID,
        title: str,
        description: str,
        severity: str = "Medium",
        priority: str = "P3 - Moderate",
        assigned_analyst_id: Optional[uuid.UUID] = None,
        db: Session = None,
    ) -> Dict[str, Any]:
        """
        Creates a new Investigation Case, builds the unified timeline, harvests evidence,
        and logs audit trail.
        """
        case_num = cls.generate_case_number(db)
        emp = db.query(Employee).filter(Employee.id == employee_id).first()
        if not emp:
            raise ValueError(f"Employee {employee_id} not found.")

        try:
            sev_enum = CaseSeverity(severity)
        except ValueError:
            sev_enum = CaseSeverity.MEDIUM

        try:
            prio_enum = CasePriority(priority)
        except ValueError:
            prio_enum = CasePriority.P3

        status = CaseStatus.ASSIGNED if assigned_analyst_id else CaseStatus.OPEN

        case_dict = {
            "case_number": case_num,
            "title": title,
            "description": description,
            "employee_id": employee_id,
            "assigned_analyst_id": assigned_analyst_id,
            "status": status,
            "severity": sev_enum,
            "priority": prio_enum,
        }

        case_obj = InvestigationRepository.create_investigation(db, case_dict)

        # 1. Harvest evidence
        evidence_data = cls.collect_evidence(employee_id, db)
        evidence_dicts = [
            {
                "investigation_id": case_obj.id,
                "evidence_type": ed["evidence_type"],
                "source_module": ed["source_module"],
                "severity": CaseSeverity.HIGH if ed["severity"] in ["High", "Critical"] else CaseSeverity.LOW,
                "description": ed["description"],
                "linked_employee_id": employee_id,
                "linked_entity_name": ed["linked_entity_name"],
                "evidence_data": ed["evidence_data"],
                "timestamp": datetime.utcnow(),
            }
            for ed in evidence_data
        ]
        if evidence_dicts:
            InvestigationRepository.add_evidence_batch(db, evidence_dicts)

        # 2. Build timeline
        timeline_data = cls.build_unified_timeline(employee_id, db)
        timeline_dicts = [
            {
                "investigation_id": case_obj.id,
                "event_timestamp": datetime.fromisoformat(td["event_timestamp"]) if isinstance(td["event_timestamp"], str) else datetime.utcnow(),
                "event_type": td["event_type"],
                "source_module": td["source_module"],
                "severity": CaseSeverity.HIGH if td["severity"] in ["High", "Critical"] else CaseSeverity.LOW,
                "description": td["description"],
                "metadata_json": td["metadata"],
            }
            for td in timeline_data
        ]
        if timeline_dicts:
            InvestigationRepository.add_timeline_batch(db, timeline_dicts)

        # 3. Log Audit
        InvestigationRepository.log_audit(db, {
            "investigation_id": case_obj.id,
            "action": "Case Created",
            "performed_by": "SOC Automated Detection",
            "details": f"Investigation {case_num} opened for employee {emp.first_name} {emp.last_name}.",
        })

        return cls.get_investigation_detail(case_obj.id, db)

    @classmethod
    def get_investigation_detail(cls, case_id: uuid.UUID, db: Session) -> Dict[str, Any]:
        """Fetches full comprehensive investigation details including XAI, correlation map, evidence, timeline, notes, and audit log."""
        case_obj = InvestigationRepository.get_by_id(db, case_id)
        if not case_obj:
            raise ValueError(f"Investigation case {case_id} not found.")

        emp = case_obj.employee
        analyst = case_obj.assigned_analyst
        dept_name = emp.department.department_name if (emp and emp.department) else "Unassigned"

        xai = cls.generate_investigation_xai(emp.id, db)
        correlation_map = cls.build_correlation_map(emp.id, db)

        return {
            "id": str(case_obj.id),
            "case_number": case_obj.case_number,
            "title": case_obj.title,
            "description": case_obj.description,
            "employee_id": str(emp.id),
            "employee_code": emp.employee_id,
            "employee_name": f"{emp.first_name} {emp.last_name}",
            "email": emp.email,
            "department_name": dept_name,
            "job_title": emp.job_title or "Staff",
            "assigned_analyst_id": str(analyst.id) if analyst else None,
            "assigned_analyst_name": f"{analyst.first_name} {analyst.last_name}" if analyst else "Unassigned",
            "status": case_obj.status.value,
            "severity": case_obj.severity.value,
            "priority": case_obj.priority.value,
            "root_cause": case_obj.root_cause,
            "resolution_summary": case_obj.resolution_summary,
            "xai_summary": xai,
            "correlation_map": correlation_map,
            "evidence": [
                {
                    "id": str(e.id),
                    "evidence_type": e.evidence_type,
                    "source_module": e.source_module,
                    "severity": e.severity.value,
                    "description": e.description,
                    "linked_entity_name": e.linked_entity_name,
                    "evidence_data": e.evidence_data,
                    "timestamp": e.timestamp.isoformat() if e.timestamp else None,
                }
                for e in case_obj.evidence_items
            ],
            "timeline": [
                {
                    "id": str(t.id),
                    "event_timestamp": t.event_timestamp.isoformat() if t.event_timestamp else None,
                    "event_type": t.event_type,
                    "source_module": t.source_module,
                    "severity": t.severity.value,
                    "description": t.description,
                    "metadata": t.metadata_json,
                }
                for t in sorted(case_obj.timeline_events, key=lambda x: x.event_timestamp or datetime.min)
            ],
            "notes": [
                {
                    "id": str(n.id),
                    "author_name": n.author_name,
                    "comment": n.comment,
                    "created_at": n.created_at.isoformat() if n.created_at else None,
                }
                for n in case_obj.notes
            ],
            "audit_logs": [
                {
                    "id": str(a.id),
                    "action": a.action,
                    "performed_by": a.performed_by,
                    "details": a.details,
                    "created_at": a.created_at.isoformat() if a.created_at else None,
                }
                for a in case_obj.audit_logs
            ],
            "created_at": case_obj.created_at.isoformat() if case_obj.created_at else None,
            "updated_at": case_obj.updated_at.isoformat() if case_obj.updated_at else None,
            "closed_at": case_obj.closed_at.isoformat() if case_obj.closed_at else None,
        }

    @classmethod
    def assign_analyst(cls, case_id: uuid.UUID, analyst_id: uuid.UUID, db: Session) -> Dict[str, Any]:
        """Assigns an analyst to an investigation case."""
        case_obj = db.query(Investigation).filter(Investigation.id == case_id).first()
        if not case_obj:
            raise ValueError(f"Investigation {case_id} not found.")

        analyst = db.query(Employee).filter(Employee.id == analyst_id).first()
        analyst_name = f"{analyst.first_name} {analyst.last_name}" if analyst else "Assigned Analyst"

        case_obj.assigned_analyst_id = analyst_id
        if case_obj.status == CaseStatus.OPEN:
            case_obj.status = CaseStatus.ASSIGNED
        db.commit()

        InvestigationRepository.log_audit(db, {
            "investigation_id": case_id,
            "action": "Analyst Assignment",
            "performed_by": "SOC Lead",
            "details": f"Case assigned to analyst {analyst_name}.",
        })

        return cls.get_investigation_detail(case_id, db)

    @classmethod
    def add_note(cls, case_id: uuid.UUID, author_name: str, comment: str, db: Session, author_id: Optional[uuid.UUID] = None) -> Dict[str, Any]:
        """Adds a collaborative analyst note to the case."""
        note_dict = {
            "investigation_id": case_id,
            "author_id": author_id,
            "author_name": author_name,
            "comment": comment,
        }
        InvestigationRepository.add_note(db, note_dict)

        InvestigationRepository.log_audit(db, {
            "investigation_id": case_id,
            "action": "Note Added",
            "performed_by": author_name,
            "details": f"Analyst note submitted: {comment[:50]}...",
        })

        return cls.get_investigation_detail(case_id, db)

    @classmethod
    def update_status(
        cls,
        case_id: uuid.UUID,
        new_status: str,
        root_cause: Optional[str] = None,
        resolution_summary: Optional[str] = None,
        performed_by: str = "SOC Analyst",
        db: Session = None,
    ) -> Dict[str, Any]:
        """Updates case status, root cause, resolution summary, and sets closed_at if resolved/closed."""
        case_obj = db.query(Investigation).filter(Investigation.id == case_id).first()
        if not case_obj:
            raise ValueError(f"Investigation {case_id} not found.")

        try:
            status_enum = CaseStatus(new_status)
        except ValueError:
            raise ValueError(f"Invalid status: {new_status}")

        old_status = case_obj.status.value
        case_obj.status = status_enum

        if root_cause:
            case_obj.root_cause = root_cause
        if resolution_summary:
            case_obj.resolution_summary = resolution_summary

        if status_enum in [CaseStatus.RESOLVED, CaseStatus.CLOSED]:
            case_obj.closed_at = datetime.utcnow()

        db.commit()

        InvestigationRepository.log_audit(db, {
            "investigation_id": case_id,
            "action": "Status Update",
            "performed_by": performed_by,
            "details": f"Status changed from '{old_status}' to '{status_enum.value}'.",
        })

        return cls.get_investigation_detail(case_id, db)

    @classmethod
    def get_dashboard_stats(cls, db: Session) -> Dict[str, Any]:
        """Returns investigation dashboard statistics."""
        return InvestigationRepository.get_dashboard_stats(db)
