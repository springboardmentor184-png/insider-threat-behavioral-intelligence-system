from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from database.db import db
from models import Alert, Employee
from services.investigation_service import AuditService, NotificationService, InvestigationService, CacheManager
from services.email_service import EmailNotificationService
from middleware.auth import roles_required
from utils.response import api_response, api_error

alerts_bp = Blueprint('alerts_routes', __name__)

@alerts_bp.route('/api/alerts', methods=['GET'])
@jwt_required()
@roles_required('ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER', 'SECURITY_ANALYST', 'SOC_ENGINEER')
def get_alerts():
    """
    GET /api/alerts
    Returns paginated, filtered, and searchable security alerts list.
    """
    search = request.args.get('search', '')
    status = request.args.get('status', '') # OPEN, INVESTIGATING, RESOLVED, DISMISSED
    severity = request.args.get('severity', '') # LOW, MEDIUM, HIGH, CRITICAL
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 15, type=int)

    query = Alert.query

    # Search filter
    if search:
        query = query.filter(
            (Alert.employee_code.ilike(f'%{search}%')) |
            (Alert.threat_type.ilike(f'%{search}%')) |
            (Alert.description.ilike(f'%{search}%'))
        )

    # Status filter
    if status:
        query = query.filter_by(status=status.upper())

    # Severity filter
    if severity:
        query = query.filter_by(severity=severity.upper())

    # Order by timestamp descending
    query = query.order_by(Alert.timestamp.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    results = []
    for item in pagination.items:
        emp = Employee.query.filter_by(employee_code=item.employee_code).first()
        item_dict = item.to_dict()
        item_dict['employee_name'] = f"{emp.first_name} {emp.last_name}" if emp else "Unknown"
        item_dict['department'] = emp.department if emp else "N/A"
        results.append(item_dict)

    return api_response(
        success=True,
        message="Alerts retrieved successfully.",
        data={
            'items': results,
            'total': pagination.total,
            'page': pagination.page,
            'pages': pagination.pages,
            'per_page': pagination.per_page
        }
    )

@alerts_bp.route('/api/alerts', methods=['POST'])
@jwt_required()
@roles_required('ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER')
def create_custom_alert():
    """
    POST /api/alerts
    Manually creates a new security alert.
    """
    user_id = int(get_jwt_identity())
    ip_addr = request.remote_addr

    body = request.get_json() or {}
    employee_code = body.get('employee_code')
    threat_type = body.get('threat_type')
    severity = body.get('severity', 'MEDIUM').upper()
    description = body.get('description', '')
    risk_score = body.get('risk_score', 0.0)

    if not employee_code or not threat_type:
        return api_error(message="Missing required parameters: employee_code and threat_type are required.", status_code=400)

    emp = Employee.query.filter_by(employee_code=employee_code).first()
    if not emp:
        return api_error(message=f"Employee profile {employee_code} not found.", status_code=404)

    new_alert = Alert(
        employee_code=employee_code,
        severity=severity,
        threat_type=threat_type,
        description=description,
        risk_score=risk_score
    )
    db.session.add(new_alert)
    db.session.commit()

    if severity == 'CRITICAL':
        EmailNotificationService.send_critical_threat_alert(new_alert)

    # Log Audit action
    AuditService.log_action(
        user_id=user_id,
        action="CREATE_ALERT_MANUAL",
        target_type="ALERT",
        target_id=new_alert.id,
        description=f"Created alert {new_alert.id} ({threat_type}) manually for {employee_code}",
        ip_address=ip_addr
    )

    # Notifications trigger if High or Critical
    if severity in ['HIGH', 'CRITICAL']:
        NotificationService.notify(
            employee_code=employee_code,
            message=f"Critical Alert: {threat_type} triggered manually for {employee_code}.",
            severity=severity,
            recipient_role="SECURITY_ANALYST"
        )
        # Evaluate automatic case opening
        InvestigationService.trigger_case(employee_code, new_alert.id, risk_score)

    CacheManager.invalidate_by_prefix("dashboard_")

    return api_response(
        success=True,
        message="Custom security alert generated successfully.",
        data=new_alert.to_dict()
    )

@alerts_bp.route('/api/alerts/<int:alert_id>', methods=['PUT'])
@jwt_required()
@roles_required('ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER', 'SECURITY_ANALYST')
def update_alert(alert_id):
    """
    PUT /api/alerts/<id>
    Updates the status or severity of an alert (Acknowledge, Resolve, Archive, Escalate).
    """
    user_id = int(get_jwt_identity())
    ip_addr = request.remote_addr

    alert = db.session.get(Alert, alert_id)
    if not alert:
        return api_error(message="Security alert record not found.", status_code=404)

    body = request.get_json() or {}
    status = body.get('status')
    severity = body.get('severity')
    became_critical = False

    # Audit description trace builder
    audit_desc_parts = []

    # 1. Update status
    if status:
        status = status.upper()
        if status not in ['OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED']:
            return api_error(message="Invalid status value. Must be OPEN, INVESTIGATING, RESOLVED, or DISMISSED.", status_code=400)
        
        old_status = alert.status
        alert.status = status
        audit_desc_parts.append(f"status '{old_status}' -> '{status}'")
        
        # If resolving / closing alert, sync to investigation if present
        if status in ['RESOLVED', 'DISMISSED'] and alert.investigation_id:
            case = db.session.get(Investigation, alert.investigation_id)
            if case and case.status not in ['RESOLVED', 'CLOSED']:
                case.status = 'RESOLVED' if status == 'RESOLVED' else 'CLOSED'

    # 2. Update severity (Escalation route)
    if severity:
        severity = severity.upper()
        if severity not in ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']:
            return api_error(message="Invalid severity level. Must be LOW, MEDIUM, HIGH, or CRITICAL.", status_code=400)
        
        old_severity = alert.severity
        alert.severity = severity
        became_critical = severity == 'CRITICAL' and old_severity != 'CRITICAL'
        audit_desc_parts.append(f"severity '{old_severity}' -> '{severity}'")

        # Escalate trigger - auto open case if escalated to HIGH or CRITICAL
        if severity in ['HIGH', 'CRITICAL'] and old_severity in ['LOW', 'MEDIUM']:
            InvestigationService.trigger_case(alert.employee_code, alert.id, alert.risk_score or 50.0)

    db.session.commit()

    if became_critical:
        EmailNotificationService.send_critical_threat_alert(alert)

    # Log action to administrative audit registry
    AuditService.log_action(
        user_id=user_id,
        action="UPDATE_ALERT",
        target_type="ALERT",
        target_id=alert.id,
        description=f"Updated alert {alert.id} metrics: {', '.join(audit_desc_parts)}",
        ip_address=ip_addr
    )

    CacheManager.invalidate_by_prefix("dashboard_")

    return api_response(
        success=True,
        message="Alert attributes updated successfully.",
        data=alert.to_dict()
    )
