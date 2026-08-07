from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from database.db import db
from models import Employee, RiskScore, RiskHistory
from services.risk_service import RiskScoreService
from services.investigation_service import AuditService
from middleware.auth import roles_required
from utils.response import api_response, api_error

risk_bp = Blueprint('risk_routes', __name__)

@risk_bp.route('/api/risk', methods=['GET'])
@jwt_required()
@roles_required('ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER', 'SECURITY_ANALYST', 'SOC_ENGINEER')
def get_risks():
    """
    GET /api/risk
    Returns paginated, searchable, and level-filtered list of risk scores.
    """
    search = request.args.get('search', '')
    level = request.args.get('level', '') # low, medium, high, critical
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 15, type=int)

    query = RiskScore.query.join(Employee, Employee.employee_code == RiskScore.employee_code)

    # Search filter
    if search:
        query = query.filter(
            (Employee.employee_code.ilike(f'%{search}%')) |
            (Employee.first_name.ilike(f'%{search}%')) |
            (Employee.last_name.ilike(f'%{search}%')) |
            (Employee.department.ilike(f'%{search}%'))
        )

    # Risk level filter
    if level:
        level = level.lower()
        if level == 'low':
            query = query.filter(RiskScore.risk_score <= 30.0)
        elif level == 'medium':
            query = query.filter((RiskScore.risk_score > 30.0) & (RiskScore.risk_score <= 60.0))
        elif level == 'high':
            query = query.filter((RiskScore.risk_score > 60.0) & (RiskScore.risk_score <= 80.0))
        elif level == 'critical':
            query = query.filter(RiskScore.risk_score > 80.0)

    # Order descending
    query = query.order_by(RiskScore.risk_score.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    results = []
    for item in pagination.items:
        emp = Employee.query.filter_by(employee_code=item.employee_code).first()
        results.append({
            'id': item.id,
            'employee_code': item.employee_code,
            'employee_name': f"{emp.first_name} {emp.last_name}" if emp else "Unknown",
            'department': emp.department if emp else "N/A",
            'designation': emp.designation if emp else "N/A",
            'risk_score': item.risk_score,
            'last_updated': (item.last_updated.isoformat() + 'Z') if item.last_updated else None
        })

    return api_response(
        success=True,
        message="Risk scores retrieved successfully.",
        data={
            'items': results,
            'total': pagination.total,
            'page': pagination.page,
            'pages': pagination.pages,
            'per_page': pagination.per_page
        }
    )

@risk_bp.route('/api/risk/<employee_code>', methods=['GET'])
@jwt_required()
def get_employee_risk_detail(employee_code):
    """
    GET /api/risk/<employee_code>
    Returns risk scoring details and trend history for a specific employee.
    """
    claims = get_jwt()
    current_role = claims.get('role', 'EMPLOYEE').upper()
    current_emp_code = Employee.query.filter_by(id=claims.get('employee_id')).first()
    
    # Standard employee can only view their own risk profile
    if current_role == 'EMPLOYEE':
        if not current_emp_code or current_emp_code.employee_code != employee_code:
            return api_error(message="Access denied. Employees can only view their own risk score details.", status_code=403)

    rs = RiskScore.query.filter_by(employee_code=employee_code).first()
    if not rs:
        return api_error(message="Risk score record not found for this employee.", status_code=404)

    history = RiskHistory.query.filter_by(employee_code=employee_code).order_by(RiskHistory.recorded_at.desc()).limit(30).all()
    
    emp = Employee.query.filter_by(employee_code=employee_code).first()

    return api_response(
        success=True,
        message="Employee risk score profile retrieved.",
        data={
            'employee_code': employee_code,
            'employee_name': f"{emp.first_name} {emp.last_name}" if emp else "Unknown",
            'department': emp.department if emp else "N/A",
            'risk_score': rs.risk_score,
            'last_updated': (rs.last_updated.isoformat() + 'Z') if rs.last_updated else None,
            'history': [h.to_dict() for h in history]
        }
    )

@risk_bp.route('/api/risk/calculate', methods=['POST'])
@jwt_required()
@roles_required('ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER')
def trigger_risk_calculation():
    """
    POST /api/risk/calculate
    Triggers risk score calculation on-demand.
    """
    user_id = int(get_jwt_identity())
    ip_addr = request.remote_addr

    body = request.get_json(silent=True) or {}
    target_code = body.get('employee_code')

    if target_code:
        emp = Employee.query.filter_by(employee_code=target_code).first()
        if not emp:
            return api_error(message=f"Employee with code {target_code} not found.", status_code=404)
        
        score = RiskScoreService.calculate_and_save_employee_risk(target_code)
        
        AuditService.log_action(
            user_id=user_id,
            action="CALCULATE_RISK_SINGLE",
            target_type="EMPLOYEE",
            target_id=emp.id,
            description=f"Triggered manual risk calculation for {target_code}. Resulting score: {score}%",
            ip_address=ip_addr
        )

        return api_response(
            success=True,
            message=f"Risk index recalculated for employee {target_code} successfully.",
            data={'employee_code': target_code, 'risk_score': score}
        )
    else:
        # Run global calculation
        count = RiskScoreService.calculate_all_employee_risks()
        
        AuditService.log_action(
            user_id=user_id,
            action="CALCULATE_RISK_GLOBAL",
            target_type="SYSTEM",
            target_id=None,
            description=f"Triggered manual global risk calculations for {count} employees.",
            ip_address=ip_addr
        )

        return api_response(
            success=True,
            message=f"Global risk indices recalculated successfully for {count} employees.",
            data={'calculated_count': count}
        )
