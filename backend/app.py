import os
from flask import Flask, request, send_from_directory, render_template_string
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from werkzeug.exceptions import HTTPException
from marshmallow import ValidationError
from sqlalchemy.exc import SQLAlchemyError

from config import config_instance
from database.db import db, migrate, bcrypt
from routes.auth import auth_bp
from routes.employee import employee_bp
from routes.activity import activity_bp
from routes.admin import admin_bp
from utils.logger import get_logger
from utils.response import api_error

# Initialize logger
logger = get_logger()

def create_app(config_class=config_instance):
    app = Flask(__name__, static_folder='../frontend', static_url_path='/static')
    app.config.from_object(config_class)

    # Initialize Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    
    # Configure JWT
    jwt = JWTManager(app)
    
    # Configure CORS
    CORS(app)

    # ==========================================
    # FRONTEND ROUTES
    # ==========================================
    
    @app.route('/', methods=['GET'])
    def index():
        """Serve index/home page"""
        return send_from_directory('../frontend', 'login_cyberguard/code.html')
    
    @app.route('/login', methods=['GET'])
    def login():
        """Serve login page"""
        return send_from_directory('../frontend', 'login_cyberguard/code.html')
    
    @app.route('/register', methods=['GET'])
    def register():
        """Serve registration page"""
        return send_from_directory('../frontend', 'register_cyberguard/code.html')
    
    @app.route('/dashboard', methods=['GET'])
    def dashboard():
        """Serve dashboard page"""
        return send_from_directory('../frontend', 'dashboard.html')
    
    @app.route('/admin/dashboard', methods=['GET'])
    def admin_dashboard():
        """Serve admin dashboard"""
        from middleware.permissions import requires_role
        return send_from_directory('../frontend/admin', 'dashboard.html')
    
    @app.route('/analyst/dashboard', methods=['GET'])
    def analyst_dashboard():
        """Serve security analyst dashboard"""
        return send_from_directory('../frontend/analyst', 'dashboard.html')
    
    @app.route('/soc/dashboard', methods=['GET'])
    def soc_dashboard():
        """Serve SOC engineer dashboard"""
        return send_from_directory('../frontend/soc', 'dashboard.html')
    
    @app.route('/employee/dashboard', methods=['GET'])
    def employee_dashboard():
        """Serve employee dashboard"""
        return send_from_directory('../frontend/employee', 'dashboard.html')
    
    @app.route('/api.js', methods=['GET'])
    def api_js():
        """Serve API client library"""
        return send_from_directory('../frontend', 'api.js')
    
    @app.route('/static/<path:filename>', methods=['GET'])
    def static_files(filename):
        """Serve static files from frontend"""
        return send_from_directory('../frontend', filename)

    # Register Blueprints
    from routes.analytics import analytics_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(employee_bp)
    app.register_blueprint(activity_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(analytics_bp)

    # ==========================================
    # CENTRALIZED ERROR HANDLING
    # ==========================================

    @app.errorhandler(ValidationError)
    def handle_validation_error(e):
        logger.warning(f"Validation Failure: {e.messages}")
        return api_error(message="Input validation failed.", errors=e.messages, status_code=400)

    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        logger.warning(f"HTTP Exception: {e.description} (Code: {e.code})")
        return api_error(message=e.description, status_code=e.code)

    @app.errorhandler(SQLAlchemyError)
    def handle_db_error(e):
        logger.error(f"Database Failure: {str(e)}", exc_info=True)
        return api_error(message="A database system error occurred. Action rolled back.", status_code=500)

    @app.errorhandler(Exception)
    def handle_generic_exception(e):
        logger.error(f"Unhandled Application Exception: {str(e)}", exc_info=True)
        return api_error(message="An unexpected system error occurred. Please contact security team.", status_code=500)

    # ==========================================
    # REQUEST LOGGING MIDDLEWARE
    # ==========================================

    @app.before_request
    def log_incoming_request():
        # Exclude static/assets logging if any to save log size
        if not request.path.startswith('/static'):
            logger.info(f"API Request: {request.method} {request.path} from IP: {request.remote_addr} - Agent: {request.user_agent.string[:100]}")

    # ==========================================
    # DATABASE SEEDING
    # ==========================================
    with app.app_context():
        try:
            # Import all models to ensure they are registered for create_all()
            from models import Role, Employee, User, ActivityLog, Permission, RolePermission, BehaviorProfile, BehaviorBaseline, BehaviorFeature, RiskScore, Anomaly, Alert, ThreatReport
            
            # Create tables if they do not exist (useful for SQLite out-of-the-box run)
            db.create_all()
            
            # Run lightweight column migration in SQLite if columns are missing
            try:
                inspector = db.inspect(db.engine)
                columns = [c['name'] for c in inspector.get_columns('employees')]
                with db.engine.connect() as conn:
                    if 'authorized_workstations' not in columns:
                        conn.execute(db.text("ALTER TABLE employees ADD COLUMN authorized_workstations VARCHAR(255)"))
                        logger.info("Migration: Added 'authorized_workstations' column to employees table.")
                    if 'authorized_usbs' not in columns:
                        conn.execute(db.text("ALTER TABLE employees ADD COLUMN authorized_usbs VARCHAR(255)"))
                        logger.info("Migration: Added 'authorized_usbs' column to employees table.")
                    if 'assigned_analyst_id' not in columns:
                        conn.execute(db.text("ALTER TABLE employees ADD COLUMN assigned_analyst_id INTEGER"))
                        logger.info("Migration: Added 'assigned_analyst_id' column to employees table.")
                    conn.commit()
            except Exception as migrate_err:
                logger.warning(f"Lightweight migration notice: {str(migrate_err)}")
            
            # Seed Roles
            from models.role import Role
            roles_to_seed = ['ADMINISTRATOR', 'SECURITY_ANALYST', 'SOC_ENGINEER', 'EMPLOYEE', 'SECURITY_MANAGER']
            for role_name in roles_to_seed:
                if not Role.query.filter_by(role_name=role_name).first():
                    r = Role(role_name=role_name)
                    db.session.add(r)
            db.session.commit()
            
            # Seed Permissions
            from services.permission_service import seed_permissions
            seed_permissions()
            
            # Seed Default Administrator account if none exists
            from models.user import User
            admin_role = Role.query.filter_by(role_name='ADMINISTRATOR').first()
            if admin_role and not User.query.filter_by(username='admin').first():
                admin_pass_hash = bcrypt.generate_password_hash('password123').decode('utf-8')
                
                # Optionally seed linked employee profile for admin
                from models.employee import Employee
                from datetime import date
                
                admin_employee = Employee.query.filter_by(employee_code='EMP0001').first()
                if not admin_employee:
                    admin_employee = Employee(
                        employee_code='EMP0001',
                        first_name='Admin',
                        last_name='User',
                        email='admin@enterprise-security.com',
                        phone='+1234567890',
                        department='CyberSecurity Operations',
                        designation='Chief Security Architect',
                        joining_date=date.today(),
                        status='ACTIVE',
                        authorized_workstations='WS-01, WS-Admin',
                        authorized_usbs='USB-01'
                    )
                    db.session.add(admin_employee)
                    db.session.flush() # get id
                
                admin_user = User(
                    username='admin',
                    password_hash=admin_pass_hash,
                    role_id=admin_role.id,
                    employee_id=admin_employee.id
                )
                db.session.add(admin_user)
                db.session.commit()
                logger.info("Default administrator account successfully seeded. Username: 'admin', Password: 'password123'")
        except Exception as e:
            logger.error(f"Error seeding database: {str(e)}")

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
