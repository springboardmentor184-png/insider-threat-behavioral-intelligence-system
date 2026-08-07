import os
from datetime import datetime
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from database.db import db
from models import Investigation, Employee, InvestigationEvent, InvestigationNote, Evidence
from services.investigation_service import InvestigationService, AuditService, CacheManager
from middleware.auth import roles_required
from utils.response import api_response, api_error
from werkzeug.utils import secure_filename

investigations_bp = Blueprint('investigations_routes', __name__)

@investigations_bp.route('/api/investigations', methods=['GET'])
@jwt_required()
@roles_required('ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER', 'SECURITY_ANALYST', 'SOC_ENGINEER')
def get_investigations():
    """
    GET /api/investigations
    Returns paginated, filtered, and searchable investigation cases list.
    """
    search = request.args.get('search', '')
    status = request.args.get('status', '') # OPEN, ASSIGNED, IN_PROGRESS, ESCALATED, RESOLVED, CLOSED
    priority = request.args.get('priority', '') # LOW, MEDIUM, HIGH, CRITICAL
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 15, type=int)

    query = Investigation.query

    # Search filter (employee_code, name, department)
    if search:
        query = query.join(Employee, Employee.employee_code == Investigation.employee_code).filter(
            (Investigation.employee_code.ilike(f'%{search}%')) |
            (Employee.first_name.ilike(f'%{search}%')) |
            (Employee.last_name.ilike(f'%{search}%')) |
            (Employee.department.ilike(f'%{search}%'))
        )

    # Status filter
    if status:
        query = query.filter_by(status=status.upper())

    # Priority filter
    if priority:
        query = query.filter_by(priority=priority.upper())

    # Order by updated_at descending
    query = query.order_by(Investigation.updated_at.desc())
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
        message="Investigations retrieved successfully.",
        data={
            'items': results,
            'total': pagination.total,
            'page': pagination.page,
            'pages': pagination.pages,
            'per_page': pagination.per_page
        }
    )

@investigations_bp.route('/api/investigations/<int:case_id>', methods=['GET'])
@jwt_required()
@roles_required('ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER', 'SECURITY_ANALYST', 'SOC_ENGINEER')
def get_investigation(case_id):
    """
    GET /api/investigations/<id>
    Returns detailed case folder view, containing structured timeline events, notes, and attached evidence.
    """
    case = db.session.get(Investigation, case_id)
    if not case:
        return api_error(message="Investigation case not found.", status_code=404)

    emp = Employee.query.filter_by(employee_code=case.employee_code).first()
    data = case.to_dict()
    data['employee_name'] = f"{emp.first_name} {emp.last_name}" if emp else "Unknown"
    data['department'] = emp.department if emp else "N/A"
    data['designation'] = emp.designation if emp else "N/A"

    return api_response(
        success=True,
        message="Investigation details compiled.",
        data=data
    )

@investigations_bp.route('/api/investigations', methods=['POST'])
@jwt_required()
@roles_required('ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER', 'SECURITY_ANALYST')
def create_investigation():
    """
    POST /api/investigations
    Manually instantiates a new investigation case.
    """
    user_id = int(get_jwt_identity())
    ip_addr = request.remote_addr

    body = request.get_json() or {}
    employee_code = body.get('employee_code')
    alert_id = body.get('alert_id')
    priority = body.get('priority', 'MEDIUM').upper()
    risk_score = body.get('risk_score', 50.0)

    if not employee_code:
        return api_error(message="employee_code parameter is required.", status_code=400)

    emp = Employee.query.filter_by(employee_code=employee_code).first()
    if not emp:
        return api_error(message=f"Employee profile {employee_code} not found in directory.", status_code=404)

    # Check for active case to avoid duplicate open folders
    active_case = Investigation.query.filter(
        Investigation.employee_code == employee_code,
        Investigation.status.in_(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED'])
    ).first()
    if active_case:
        return api_error(message=f"An active investigation case (ID {active_case.id}) is already open for this employee.", status_code=400)

    # Trigger case creation using service
    case = InvestigationService.trigger_case(employee_code, alert_id, risk_score)
    
    # Override priority if specified
    if priority and priority != case.priority:
        case.priority = priority
        db.session.commit()

    AuditService.log_action(
        user_id=user_id,
        action="CREATE_INVESTIGATION_MANUAL",
        target_type="INVESTIGATION",
        target_id=case.id,
        description=f"Created investigation case ID {case.id} manually for {employee_code}",
        ip_address=ip_addr
    )

    return api_response(
        success=True,
        message="Investigation case opened successfully.",
        data=case.to_dict()
    )

@investigations_bp.route('/api/investigations/<int:case_id>', methods=['PUT'])
@jwt_required()
@roles_required('ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER', 'SECURITY_ANALYST')
def update_investigation_details(case_id):
    """
    PUT /api/investigations/<id>
    Updates status, priority, assigns analyst, or appends recommendations.
    """
    user_id = int(get_jwt_identity())
    ip_addr = request.remote_addr

    case = db.session.get(Investigation, case_id)
    if not case:
        return api_error(message="Investigation case not found.", status_code=404)

    body = request.get_json() or {}
    status = body.get('status')
    priority = body.get('priority')
    assigned_analyst_id = body.get('assigned_analyst_id')
    recommendation = body.get('recommendation')
    resolution = body.get('resolution')

    audit_desc_parts = []

    # 1. Update analyst assignment
    if assigned_analyst_id is not None:
        try:
            analyst_id_int = int(assigned_analyst_id)
            # Verify employee exists as analyst
            analyst_emp = db.session.get(Employee, analyst_id_int)
            if not analyst_emp:
                return api_error(message="Assigned analyst profile not found in directory.", status_code=404)
            officer_roles = {'ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER', 'SECURITY_ANALYST', 'SOC_ENGINEER'}
            analyst_role = analyst_emp.user.role.role_name if analyst_emp.user and analyst_emp.user.role else None
            if analyst_emp.status != 'ACTIVE' or analyst_role not in officer_roles:
                return api_error(message="Cases can only be assigned to an active security officer.", status_code=400)
            
            InvestigationService.assign_case(case_id, analyst_id_int, user_id, ip_address=ip_addr)
            audit_desc_parts.append(f"assigned_analyst -> {analyst_id_int}")
        except ValueError:
            return api_error(message="Invalid assigned_analyst_id format. Must be an integer.", status_code=400)

    # 2. Update status
    if status:
        status = status.upper()
        if status not in ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED']:
            return api_error(message="Invalid status value.", status_code=400)
        
        InvestigationService.update_case_status(case_id, status, user_id, ip_address=ip_addr)
        audit_desc_parts.append(f"status -> {status}")

    # 3. Update priority
    if priority:
        priority = priority.upper()
        if priority not in ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']:
            return api_error(message="Invalid priority value.", status_code=400)
        
        old_priority = case.priority
        case.priority = priority
        audit_desc_parts.append(f"priority '{old_priority}' -> '{priority}'")
        
        # Add Timeline Event
        event = InvestigationEvent(
            investigation_id=case.id,
            event_type="PRIORITY_UPDATE",
            description=f"Analyst escalated case priority level from {old_priority} to {priority}.",
            user_id=user_id
        )
        db.session.add(event)

    # 4. Recommendations and resolution details
    if recommendation:
        case.recommendation = recommendation
        audit_desc_parts.append("recommendation updated")
    if resolution:
        case.resolution = resolution
        audit_desc_parts.append("resolution updated")

    case.updated_at = datetime.utcnow()
    db.session.commit()

    if audit_desc_parts:
        AuditService.log_action(
            user_id=user_id,
            action="UPDATE_INVESTIGATION",
            target_type="INVESTIGATION",
            target_id=case.id,
            description=f"Updated Case ID {case.id}: {', '.join(audit_desc_parts)}",
            ip_address=ip_addr
        )

    CacheManager.invalidate_by_prefix("dashboard_")

    return api_response(
        success=True,
        message="Investigation case file updated successfully.",
        data=case.to_dict()
    )

@investigations_bp.route('/api/investigations/<int:case_id>/notes', methods=['POST'])
@jwt_required()
@roles_required('ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER', 'SECURITY_ANALYST')
def add_case_note(case_id):
    """
    POST /api/investigations/<id>/notes
    Appends an analyst note to the case timeline.
    """
    user_id = int(get_jwt_identity())
    ip_addr = request.remote_addr

    body = request.get_json() or {}
    note_text = body.get('note')

    if not note_text:
        return api_error(message="note content is required.", status_code=400)

    try:
        note = InvestigationService.add_case_note(case_id, note_text, user_id, ip_address=ip_addr)
        return api_response(
            success=True,
            message="Analyst note appended to timeline successfully.",
            data=note.to_dict()
        )
    except ValueError as e:
        return api_error(message=str(e), status_code=404)

@investigations_bp.route('/api/investigations/<int:case_id>/evidence', methods=['POST'])
@jwt_required()
@roles_required('ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER', 'SECURITY_ANALYST')
def add_case_evidence(case_id):
    """
    POST /api/investigations/<id>/evidence
    Supports attaching evidence files. Accepting JSON-metadata or file uploads.
    """
    user_id = int(get_jwt_identity())
    ip_addr = request.remote_addr

    # Check if request has files (multipart form upload)
    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return api_error(message="No file selected.", status_code=400)
        
        filename = secure_filename(file.filename)
        # Create uploads folder if missing
        uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)
        
        filepath = os.path.join(uploads_dir, filename)
        file.save(filepath)
        file_size = os.path.getsize(filepath)
    else:
        # Fallback to JSON payload details
        body = request.get_json() or {}
        filename = body.get('filename')
        filepath = body.get('filepath', 'MockFilePath')
        file_size = body.get('file_size', 0)

        if not filename:
            return api_error(message="Either file upload or filename JSON parameter is required.", status_code=400)

    try:
        evidence = InvestigationService.add_case_evidence(
            case_id=case_id,
            filename=filename,
            filepath=filepath,
            file_size=file_size,
            user_id=user_id,
            ip_address=ip_addr
        )
        return api_response(
            success=True,
            message="Evidence files uploaded and linked to case successfully.",
            data=evidence.to_dict()
        )
    except ValueError as e:
        return api_error(message=str(e), status_code=404)
