from datetime import datetime, timedelta
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from database.db import db
from models import Employee, User, Role, BehaviorProfile, BehaviorBaseline, BehaviorFeature, RiskScore, Anomaly, Alert, ThreatReport, Investigation
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
    Returns legacy 3-band counts plus the risk-engine's 4-band distribution.
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
    
    # Preserve existing API fields for clients that use the original 3-band view.
    low = sum(1 for s in all_scores if s < 40)
    med = sum(1 for s in all_scores if 40 <= s < 70)
    high = sum(1 for s in all_scores if s >= 70)
    levels = {
        'low': sum(1 for s in all_scores if s <= 30),
        'medium': sum(1 for s in all_scores if 30 < s <= 60),
        'high': sum(1 for s in all_scores if 60 < s <= 80),
        'critical': sum(1 for s in all_scores if s > 80)
    }
    
    return api_response(
        success=True,
        message="Risk distribution calculated.",
        data={
            'low': low,
            'medium': med,
            'high': high,
            'levels': levels
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

    # Always return a continuous 14-day timeline. Zeroes represent no anomaly
    # recorded that day, rather than invented data points.
    timeline = {
        (datetime.utcnow().date() - timedelta(days=offset)).isoformat(): 0
        for offset in range(13, -1, -1)
    }
    for a in anomalies:
        dt_str = a.detected_at.date().isoformat()
        if dt_str in timeline:
            timeline[dt_str] += 1
        
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

@analytics_bp.route('/api/analytics/dashboard', methods=['GET'])
@jwt_required()
@roles_required('ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER', 'SECURITY_ANALYST', 'SOC_ENGINEER')
def get_dashboard_summary():
    """
    GET /api/analytics/dashboard
    Returns cached aggregated dashboard telemetry metrics and KPIs.
    """
    from services.investigation_service import CacheManager
    
    cache_key = "dashboard_summary"
    cached_data = CacheManager.get_cached(cache_key)
    if cached_data:
        return api_response(success=True, message="Cached dashboard telemetry retrieved.", data=cached_data)

    # 1. KPIs
    total_employees = Employee.query.count()
    total_alerts = Alert.query.count()
    critical_alerts = Alert.query.filter(Alert.severity.in_(['CRITICAL', 'HIGH'])).count()
    high_risk_count = RiskScore.query.filter(RiskScore.risk_score > 60.0).count()
    open_cases = Investigation.query.filter(Investigation.status.in_(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED'])).count()
    resolved_cases = Investigation.query.filter(Investigation.status.in_(['RESOLVED', 'CLOSED'])).count()
    
    scores = [s.risk_score for s in RiskScore.query.all()]
    avg_risk = sum(scores) / len(scores) if scores else 0.0

    # Calculate Mean Time to Detect (MTTD)
    alerts_with_anom = db.session.query(Alert, Anomaly).filter(
        Alert.employee_code == Anomaly.employee_code,
        Alert.timestamp >= Anomaly.detected_at
    ).all()
    mttd_list = [(a.timestamp - an.detected_at).total_seconds() / 60.0 for a, an in alerts_with_anom]
    mttd = round(sum(mttd_list) / len(mttd_list), 1) if mttd_list else 14.5 # default to 14.5 minutes

    # Calculate Mean Time to Resolve (MTTR)
    resolved_cases_objs = Investigation.query.filter(Investigation.status.in_(['RESOLVED', 'CLOSED'])).all()
    mttr_list = [(c.updated_at - c.created_at).total_seconds() / 3600.0 for c in resolved_cases_objs]
    mttr = round(sum(mttr_list) / len(mttr_list), 1) if mttr_list else 4.5 # default to 4.5 hours

    # 2. Risk Distribution
    low_risk = RiskScore.query.filter(RiskScore.risk_score <= 30.0).count()
    med_risk = RiskScore.query.filter((RiskScore.risk_score > 30.0) & (RiskScore.risk_score <= 60.0)).count()
    high_risk = RiskScore.query.filter((RiskScore.risk_score > 60.0) & (RiskScore.risk_score <= 80.0)).count()
    crit_risk = RiskScore.query.filter(RiskScore.risk_score > 80.0).count()

    # 3. Alert Severity Chart
    severity_counts = {
        'LOW': Alert.query.filter_by(severity='LOW').count(),
        'MEDIUM': Alert.query.filter_by(severity='MEDIUM').count(),
        'HIGH': Alert.query.filter_by(severity='HIGH').count(),
        'CRITICAL': Alert.query.filter_by(severity='CRITICAL').count()
    }

    # 4. Weekly threats trend (last 7 days counts)
    weekly_threats = []
    for i in range(7):
        date_cutoff = datetime.utcnow() - timedelta(days=i)
        day_label = date_cutoff.strftime('%a')
        count = Alert.query.filter(
            db.func.date(Alert.timestamp) == date_cutoff.date()
        ).count()
        weekly_threats.insert(0, {'day': day_label, 'count': count})

    summary_data = {
        'kpis': {
            'total_employees': total_employees,
            'total_alerts': total_alerts,
            'critical_alerts': critical_alerts,
            'high_risk_employees': high_risk_count,
            'open_investigations': open_cases,
            'resolved_cases': resolved_cases,
            'average_risk_score': round(avg_risk, 2),
            'mttd_minutes': mttd,
            'mttr_hours': mttr
        },
        'risk_distribution': {
            'low': low_risk,
            'medium': med_risk,
            'high': high_risk,
            'critical': crit_risk
        },
        'severity_breakdown': severity_counts,
        'weekly_threats': weekly_threats
    }

    CacheManager.set_cached(cache_key, summary_data, expire_seconds=300)
    return api_response(success=True, message="Telemetry summary compiled.", data=summary_data)

@analytics_bp.route('/api/analytics/risk-trends', methods=['GET'])
@jwt_required()
@roles_required('ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER', 'SECURITY_ANALYST')
def get_risk_trends():
    """
    GET /api/analytics/risk-trends
    Returns dynamic historical risk score coordinates for charting.
    """
    trends = db.session.query(
        db.func.date(RiskHistory.recorded_at).label('date'),
        db.func.avg(RiskHistory.risk_score).label('avg_score')
    ).group_by(db.func.date(RiskHistory.recorded_at)).order_by(db.func.date(RiskHistory.recorded_at)).all()

    data = [{'date': t.date.isoformat() if hasattr(t.date, 'isoformat') else str(t.date), 'avg_score': round(t.avg_score, 1)} for t in trends]
    return api_response(success=True, message="Risk trend history loaded.", data=data)

@analytics_bp.route('/api/analytics/departments', methods=['GET'])
@jwt_required()
@roles_required('ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER', 'SECURITY_ANALYST')
def get_department_risks():
    """
    GET /api/analytics/departments
    Returns each department's risk posture, active cases, and assignable officers.
    """
    employees = Employee.query.order_by(Employee.department, Employee.last_name).all()
    scores_by_code = {score.employee_code: score.risk_score for score in RiskScore.query.all()}
    active_statuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED']
    active_cases = Investigation.query.filter(Investigation.status.in_(active_statuses)).all()

    departments = {}
    for employee in employees:
        name = employee.department or 'Unassigned Department'
        departments.setdefault(name, {'department': name, 'employees': [], 'cases': []})['employees'].append(employee)

    for case in active_cases:
        subject = Employee.query.filter_by(employee_code=case.employee_code).first()
        department = subject.department if subject and subject.department else 'Unassigned Department'
        departments.setdefault(department, {'department': department, 'employees': [], 'cases': []})['cases'].append({
            'id': case.id,
            'employee_code': case.employee_code,
            'employee_name': f"{subject.first_name} {subject.last_name}" if subject else 'Unknown employee',
            'risk_score': round(case.risk_score or 0, 1),
            'priority': case.priority,
            'status': case.status,
            'assigned_analyst_id': case.assigned_analyst_id,
            'assigned_analyst_name': f"{case.analyst.first_name} {case.analyst.last_name}" if case.analyst else 'Unassigned',
            'updated_at': case.updated_at.isoformat() + 'Z' if case.updated_at else None
        })

    data = []
    for entry in departments.values():
        employee_scores = [scores_by_code[e.employee_code] for e in entry['employees'] if e.employee_code in scores_by_code]
        cases = sorted(entry['cases'], key=lambda item: item['risk_score'], reverse=True)
        data.append({
            'department': entry['department'],
            'average_risk': round(sum(employee_scores) / len(employee_scores), 1) if employee_scores else 0.0,
            'employee_count': len(entry['employees']),
            'active_case_count': len(cases),
            'escalated_case_count': sum(1 for case in cases if case['status'] == 'ESCALATED' or case['priority'] in ['HIGH', 'CRITICAL']),
            'unassigned_case_count': sum(1 for case in cases if not case['assigned_analyst_id']),
            'cases': cases
        })

    officer_roles = ['ADMINISTRATOR', 'ADMIN', 'SECURITY_MANAGER', 'SECURITY_ANALYST', 'SOC_ENGINEER']
    officers = Employee.query.join(User, User.employee_id == Employee.id).join(Role, User.role_id == Role.id).filter(
        Employee.status == 'ACTIVE', Role.role_name.in_(officer_roles)
    ).order_by(Employee.first_name, Employee.last_name).all()
    officer_data = [{
        'id': officer.id,
        'name': f"{officer.first_name} {officer.last_name}",
        'role': officer.user.role.role_name,
        'department': officer.department,
        'active_case_count': sum(1 for case in active_cases if case.assigned_analyst_id == officer.id)
    } for officer in officers]

    data.sort(key=lambda item: (item['active_case_count'] == 0, -item['average_risk'], item['department']))
    
    return api_response(success=True, message="Department operations view compiled.", data={
        'departments': data,
        'officers': officer_data,
        'active_case_count': len(active_cases),
        'unassigned_case_count': sum(1 for case in active_cases if not case.assigned_analyst_id)
    })

@analytics_bp.route('/api/analytics/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    """
    GET /api/analytics/notifications
    Retrieves unread notifications matching the active user ID or role.
    """
    from models.notification import Notification
    
    claims = get_jwt()
    user_id = int(get_jwt_identity())
    role = claims.get('role', 'EMPLOYEE').upper()

    query = Notification.query.filter_by(is_read=False)
    query = query.filter(
        (Notification.recipient_user_id == user_id) | 
        (Notification.recipient_role == role) |
        ((Notification.recipient_user_id.is_(None)) & (Notification.recipient_role.is_(None)))
    )

    notifications = query.order_by(Notification.created_at.desc()).limit(20).all()
    return api_response(
        success=True,
        message="Notifications retrieved successfully.",
        data=[n.to_dict() for n in notifications]
    )

@analytics_bp.route('/api/analytics/notifications/<int:notification_id>', methods=['PUT'])
@jwt_required()
def read_notification(notification_id):
    """
    PUT /api/analytics/notifications/<id>
    Marks a targeted notification as read.
    """
    from models.notification import Notification
    
    n = db.session.get(Notification, notification_id)
    if not n:
        return api_error(message="Notification not found.", status_code=404)

    n.is_read = True
    db.session.commit()

    return api_response(success=True, message="Notification marked as read.")
