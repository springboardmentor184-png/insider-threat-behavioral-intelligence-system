import csv
import io
from flask import Blueprint, request, make_response, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from database.db import db
from models import Employee, RiskScore, Alert, Investigation, BehaviorBaseline
from services.investigation_service import CacheManager
from middleware.auth import roles_required
from utils.response import api_response, api_error

reports_bp = Blueprint('reports_routes', __name__)

@reports_bp.route('/api/reports', methods=['GET'])
@jwt_required()
@roles_required('ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER', 'SECURITY_ANALYST')
def generate_reports():
    """
    GET /api/reports
    Generates downloadable reports: Employee Risk, Investigation, Security Summary, Alerts, Department, or Executive Summary.
    Supports CSV and JSON formats, with filters.
    """
    report_type = request.args.get('type', 'security_summary').lower() # employee_risk, investigation, security_summary, alert, department, executive
    export_format = request.args.get('format', 'csv').lower() # csv, json
    
    # Filters
    department = request.args.get('department', '')
    level = request.args.get('level', '')
    start_date_str = request.args.get('start_date', '')
    end_date_str = request.args.get('end_date', '')

    # Initialize data sets
    if report_type == 'employee_risk':
        # Compile employee risk rows
        query = RiskScore.query.join(Employee, Employee.employee_code == RiskScore.employee_code)
        if department:
            query = query.filter(Employee.department == department)
        if level:
            level = level.lower()
            if level == 'low':
                query = query.filter(RiskScore.risk_score <= 30)
            elif level == 'medium':
                query = query.filter((RiskScore.risk_score > 30) & (RiskScore.risk_score <= 60))
            elif level == 'high':
                query = query.filter((RiskScore.risk_score > 60) & (RiskScore.risk_score <= 80))
            elif level == 'critical':
                query = query.filter(RiskScore.risk_score > 80)

        data = []
        for r in query.all():
            emp = Employee.query.filter_by(employee_code=r.employee_code).first()
            data.append({
                'employee_code': r.employee_code,
                'employee_name': f"{emp.first_name} {emp.last_name}" if emp else "Unknown",
                'department': emp.department if emp else "N/A",
                'designation': emp.designation if emp else "N/A",
                'risk_score': r.risk_score,
                'threat_level': 'CRITICAL' if r.risk_score > 80 else 'HIGH' if r.risk_score > 60 else 'MEDIUM' if r.risk_score > 30 else 'LOW',
                'last_updated': r.last_updated.isoformat() if r.last_updated else None
            })
        
        headers = ['employee_code', 'employee_name', 'department', 'designation', 'risk_score', 'threat_level', 'last_updated']

    elif report_type == 'investigation':
        query = Investigation.query
        if department:
            query = query.join(Employee, Employee.employee_code == Investigation.employee_code).filter(Employee.department == department)
        if level: # matches priority
            query = query.filter_by(priority=level.upper())

        data = []
        for c in query.all():
            emp = Employee.query.filter_by(employee_code=c.employee_code).first()
            data.append({
                'case_id': c.id,
                'employee_code': c.employee_code,
                'employee_name': f"{emp.first_name} {emp.last_name}" if emp else "Unknown",
                'priority': c.priority,
                'status': c.status,
                'risk_score': c.risk_score,
                'recommendation': c.recommendation or 'None',
                'resolution': c.resolution or 'Unresolved',
                'created_at': c.created_at.isoformat() if c.created_at else None
            })
        
        headers = ['case_id', 'employee_code', 'employee_name', 'priority', 'status', 'risk_score', 'recommendation', 'resolution', 'created_at']

    elif report_type == 'alert':
        query = Alert.query
        if level: # matches severity
            query = query.filter_by(severity=level.upper())
        if department:
            query = query.join(Employee, Employee.employee_code == Alert.employee_code).filter(Employee.department == department)

        data = []
        for a in query.all():
            emp = Employee.query.filter_by(employee_code=a.employee_code).first()
            data.append({
                'alert_id': a.id,
                'employee_code': a.employee_code,
                'employee_name': f"{emp.first_name} {emp.last_name}" if emp else "Unknown",
                'threat_type': a.threat_type,
                'severity': a.severity,
                'status': a.status,
                'risk_score': a.risk_score or 0.0,
                'description': a.description or '',
                'timestamp': a.timestamp.isoformat() if a.timestamp else None
            })
        
        headers = ['alert_id', 'employee_code', 'employee_name', 'threat_type', 'severity', 'status', 'risk_score', 'description', 'timestamp']

    elif report_type == 'department':
        # Department metrics
        depts = db.session.query(Employee.department).distinct().all()
        data = []
        for d in depts:
            dept_name = d[0]
            if department and dept_name != department:
                continue
            
            # Find employees
            emp_codes = [e.employee_code for e in Employee.query.filter_by(department=dept_name).all()]
            if not emp_codes:
                continue
            
            scores = [r.risk_score for r in RiskScore.query.filter(RiskScore.employee_code.in_(emp_codes)).all()]
            avg_score = sum(scores) / len(scores) if scores else 0.0
            alerts_count = Alert.query.filter(Alert.employee_code.in_(emp_codes)).count()
            cases_count = Investigation.query.filter(Investigation.employee_code.in_(emp_codes)).count()

            data.append({
                'department_name': dept_name,
                'employee_count': len(emp_codes),
                'average_risk_score': round(avg_score, 2),
                'total_alerts': alerts_count,
                'active_investigations': cases_count
            })
        
        headers = ['department_name', 'employee_count', 'average_risk_score', 'total_alerts', 'active_investigations']

    else: # security_summary / executive_summary
        # Yield core executive highlights
        total_employees = Employee.query.count()
        total_alerts = Alert.query.count()
        open_alerts = Alert.query.filter_by(status='OPEN').count()
        critical_alerts = Alert.query.filter(Alert.severity.in_(['CRITICAL', 'HIGH'])).count()
        active_cases = Investigation.query.filter(Investigation.status.in_(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED'])).count()
        resolved_cases = Investigation.query.filter_by(status='RESOLVED').count()
        
        all_scores = [rs.risk_score for rs in RiskScore.query.all()]
        avg_risk = sum(all_scores) / len(all_scores) if all_scores else 0.0

        data = [{
            'metric': 'Total Onboarded Employees', 'value': total_employees
        }, {
            'metric': 'Average Enterprise Threat Risk Index', 'value': f"{round(avg_risk, 2)}%"
        }, {
            'metric': 'Total Security Alerts Generated', 'value': total_alerts
        }, {
            'metric': 'Active/Unresolved Alerts', 'value': open_alerts
        }, {
            'metric': 'Critical Severity Alerts Flagged', 'value': critical_alerts
        }, {
            'metric': 'Active Investigation Cases Ongoing', 'value': active_cases
        }, {
            'metric': 'Resolved Cases Total', 'value': resolved_cases
        }]
        
        headers = ['metric', 'value']

    # Export formats
    if export_format == 'csv':
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=headers)
        writer.writeheader()
        for row in data:
            writer.writerow(row)
        
        response = make_response(output.getvalue())
        response.headers['Content-Disposition'] = f'attachment; filename=cyberguard_{report_type}_report.csv'
        response.headers['Content-type'] = 'text/csv'
        return response
    else: # json/pdf data format
        return make_response(jsonify({
            'success': True,
            'report_type': report_type,
            'headers': headers,
            'data': data
        }), 200)
