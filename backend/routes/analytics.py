from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt
from database.db import db
from models import Employee, User, BehaviorProfile, BehaviorBaseline, BehaviorFeature, RiskScore, Anomaly, Alert, ThreatReport
from middleware.auth import roles_required
from utils.response import api_response, api_error

analytics_bp = Blueprint('analytics', __name__)

def check_analyst_assignment(analyst_employee_id, target_employee_code):
    """Helper to check if target employee is assigned to the current analyst."""
    emp = Employee.query.filter_by(employee_code=target_employee_code).first()
    if not emp:
        return False
    return emp.assigned_analyst_id == analyst_employee_id

@analytics_bp.route('/api/analytics/overview', methods=['GET'])
@jwt_required()
@roles_required('ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER', 'SECURITY_ANALYST', 'SOC_ENGINEER')
def get_overview():
    """
    GET /api/analytics/overview
    Returns aggregate stats (Total Analyzed, Average Risk, Alerts counts).
    """
    total_users = BehaviorProfile.query.count()
    
    # Calculate average risk score
    scores = [s.risk_score for s in RiskScore.query.all()]
    avg_risk = sum(scores) / len(scores) if scores else 0.0
    
    critical_alerts = Alert.query.filter(Alert.severity.in_(['CRITICAL', 'HIGH'])).count()
    open_alerts = Alert.query.filter_by(status='OPEN').count()
    
    return api_response(
        success=True,
        message="Analytics overview retrieved successfully.",
        data={
            'total_analyzed_users': total_users,
            'average_risk_score': round(avg_risk, 2),
            'critical_alerts_count': critical_alerts,
            'open_alerts_count': open_alerts,
            'status': "SECURE" if critical_alerts == 0 else "WARNING"
        }
    )

@analytics_bp.route('/api/analytics/risk-distribution', methods=['GET'])
@jwt_required()
@roles_required('ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER', 'SECURITY_ANALYST')
def get_risk_distribution():
    """
    GET /api/analytics/risk-distribution
    Returns user counts in low (0-39), medium (40-69), high (70-100) risk brackets.
    """
    claims = get_jwt()
    role = claims.get('role', 'EMPLOYEE').upper()
    employee_id = claims.get('employee_id')
    
    # Filter queryset based on analyst assignments
    query = RiskScore.query
    if role in ['SECURITY_ANALYST']:
        query = query.join(Employee, Employee.employee_code == RiskScore.employee_code)\
                     .filter(Employee.assigned_analyst_id == employee_id)
                     
    all_scores = [s.risk_score for s in query.all()]
    
    low = sum(1 for s in all_scores if s < 40)
    med = sum(1 for s in all_scores if 40 <= s < 70)
    high = sum(1 for s in all_scores if s >= 70)
    
    return api_response(
        success=True,
        message="Risk distribution calculated.",
        data={
            'low': low,
            'medium': med,
            'high': high
        }
    )

@analytics_bp.route('/api/analytics/high-risk-users', methods=['GET'])
@jwt_required()
@roles_required('ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER', 'SECURITY_ANALYST')
def get_high_risk_users():
    """
    GET /api/analytics/high-risk-users
    Returns top high-risk profiles sorted descending by risk score.
    """
    claims = get_jwt()
    role = claims.get('role', 'EMPLOYEE').upper()
    employee_id = claims.get('employee_id')
    
    query = RiskScore.query
    if role in ['SECURITY_ANALYST']:
        query = query.join(Employee, Employee.employee_code == RiskScore.employee_code)\
                     .filter(Employee.assigned_analyst_id == employee_id)
                     
    top_scores = query.order_by(RiskScore.risk_score.desc()).limit(15).all()
    
    results = []
    for rs in top_scores:
        emp = Employee.query.filter_by(employee_code=rs.employee_code).first()
        results.append({
            'employee_code': rs.employee_code,
            'employee_name': f"{emp.first_name} {emp.last_name}" if emp else "Unknown User",
            'department': emp.department if emp else "N/A",
            'risk_score': round(rs.risk_score, 2)
        })
        
    return api_response(
        success=True,
        message="High-risk users retrieved.",
        data=results
    )

@analytics_bp.route('/api/analytics/employee/<employee_id_or_code>', methods=['GET'])
@jwt_required()
def get_employee_analytics(employee_id_or_code):
    """
    GET /api/analytics/employee/<employee_id_or_code>
    Returns detailed profile, baseline, features, risk scores, anomalies, alerts, and threat reports.
    """
    claims = get_jwt()
    role = claims.get('role', 'EMPLOYEE').upper()
    employee_id = claims.get('employee_id')
    
    # Try retrieving by ID first, then by employee_code
    emp = None
    try:
        emp_id_int = int(employee_id_or_code)
        emp = db.session.get(Employee, emp_id_int)
    except ValueError:
        pass
        
    if not emp:
        emp = Employee.query.filter_by(employee_code=employee_id_or_code).first()
        
    if not emp:
        return api_error(message="Employee profile not found in directory.", status_code=404)
        
    code = emp.employee_code
    
    # RBAC Authorization logic
    if role in ['SOC_ENGINEER']:
        return api_error(message="SOC Engineers are restricted to operational events view only.", status_code=403)
        
    if role in ['EMPLOYEE'] and employee_id != emp.id:
        return api_error(message="Access denied. Employees can only retrieve personal risk scores.", status_code=403)
        
    if role in ['SECURITY_ANALYST'] and emp.assigned_analyst_id != employee_id:
        return api_error(message="Access denied. This employee profile is not assigned to you.", status_code=403)

    # Gather data from collections
    profile = BehaviorProfile.query.filter_by(employee_code=code).first()
    baseline = BehaviorBaseline.query.filter_by(employee_code=code).first()
    features = BehaviorFeature.query.filter_by(employee_code=code).first()
    risk = RiskScore.query.filter_by(employee_code=code).first()
    anomalies = Anomaly.query.filter_by(employee_code=code).all()
    alerts = Alert.query.filter_by(employee_code=code).all()
    report = ThreatReport.query.filter_by(employee_code=code).order_by(ThreatReport.created_at.desc()).first()

    return api_response(
        success=True,
        message="Employee analytics compiled.",
        data={
            'employee': emp.to_dict(),
            'profile': profile.to_dict() if profile else None,
            'baseline': baseline.to_dict() if baseline else None,
            'features': features.to_dict() if features else None,
            'risk_score': risk.risk_score if risk else 0.0,
            'anomalies': [a.to_dict() for a in anomalies],
            'alerts': [al.to_dict() for al in alerts],
            'latest_report': report.to_dict() if report else None
        }
    )

@analytics_bp.route('/api/analytics/behavior-trend', methods=['GET'])
@jwt_required()
@roles_required('ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER', 'SECURITY_ANALYST')
def get_behavior_trend():
    """
    GET /api/analytics/behavior-trend
    Returns dynamic timeseries points of anomaly volumes.
    """
    claims = get_jwt()
    role = claims.get('role', 'EMPLOYEE').upper()
    employee_id = claims.get('employee_id')
    
    query = Anomaly.query
    if role in ['SECURITY_ANALYST']:
        query = query.join(Employee, Employee.employee_code == Anomaly.employee_code)\
                     .filter(Employee.assigned_analyst_id == employee_id)
                     
    anomalies = query.all()
    
    # Group by date
    timeline = {}
    for a in anomalies:
        dt_str = a.detected_at.date().isoformat()
        timeline[dt_str] = timeline.get(dt_str, 0) + 1
        
    sorted_trend = [{'date': k, 'count': v} for k, v in sorted(timeline.items())]
    return api_response(
        success=True,
        message="Historical behavioral anomaly trend compiled.",
        data=sorted_trend
    )

@analytics_bp.route('/api/analytics/threat-summary', methods=['GET'])
@jwt_required()
@roles_required('ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER', 'SECURITY_ANALYST', 'SOC_ENGINEER')
def get_threat_summary():
    """
    GET /api/analytics/threat-summary
    Returns generated alerts summarized by threat type and severity.
    """
    claims = get_jwt()
    role = claims.get('role', 'EMPLOYEE').upper()
    employee_id = claims.get('employee_id')
    
    query = Alert.query
    if role in ['SECURITY_ANALYST']:
        query = query.join(Employee, Employee.employee_code == Alert.employee_code)\
                     .filter(Employee.assigned_analyst_id == employee_id)
                     
    alerts = query.all()
    
    breakdown = {}
    severity_counts = {'LOW': 0, 'MEDIUM': 0, 'HIGH': 0, 'CRITICAL': 0}
    
    for a in alerts:
        breakdown[a.threat_type] = breakdown.get(a.threat_type, 0) + 1
        sev = a.severity.upper()
        if sev in severity_counts:
            severity_counts[sev] += 1
            
    return api_response(
        success=True,
        message="Threat summary metrics calculated.",
        data={
            'threat_type_breakdown': breakdown,
            'severity_breakdown': severity_counts
        }
    )

@analytics_bp.route('/api/analytics/abnormal-reports', methods=['GET'])
@jwt_required()
@roles_required('ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER', 'SECURITY_ANALYST')
def get_abnormal_reports():
    """
    GET /api/analytics/abnormal-reports
    Returns a list of employee threat reports where deviations exist.
    """
    claims = get_jwt()
    role = claims.get('role', 'EMPLOYEE').upper()
    employee_id = claims.get('employee_id')
    
    query = ThreatReport.query
    if role in ['SECURITY_ANALYST']:
        query = query.join(Employee, Employee.employee_code == ThreatReport.employee_code)\
                     .filter(Employee.assigned_analyst_id == employee_id)
                     
    reports = query.order_by(ThreatReport.risk_score.desc()).all()
    
    results = []
    for rep in reports:
        emp = Employee.query.filter_by(employee_code=rep.employee_code).first()
        if not emp:
            continue
        results.append({
            'employee_code': rep.employee_code,
            'employee_name': f"{emp.first_name} {emp.last_name}",
            'department': emp.department,
            'risk_score': round(rep.risk_score, 2),
            'threat_level': rep.threat_level,
            'detected_anomalies': rep.detected_anomalies,
            'behavior_changes': rep.behavior_changes,
            'recommendations': rep.recommendations
        })
        
    return api_response(
        success=True,
        message="Employee threat reports compiled.",
        data=results
    )
