from datetime import datetime
from database.db import db

class Employee(db.Model):
    __tablename__ = 'employees'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    employee_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=True)
    department = db.Column(db.String(100), nullable=False)
    designation = db.Column(db.String(100), nullable=False)
    joining_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='ACTIVE')
    authorized_workstations = db.Column(db.String(255), nullable=True)
    authorized_usbs = db.Column(db.String(255), nullable=True)
    assigned_analyst_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='employee', uselist=False, cascade="all, delete-orphan")
    activity_logs = db.relationship('ActivityLog', back_populates='employee', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Employee {self.employee_code} - {self.first_name} {self.last_name}>"

    def to_dict(self):
        # Determine online status based on latest login/logout auth event
        is_online = False
        if self.activity_logs:
            # Sort activity logs by timestamp descending
            sorted_logs = sorted(self.activity_logs, key=lambda log: log.timestamp, reverse=True)
            # Find the most recent LOGIN_SUCCESS or LOGOUT event
            auth_logs = [log for log in sorted_logs if log.activity_type in ['LOGIN_SUCCESS', 'LOGOUT']]
            if auth_logs:
                is_online = auth_logs[0].activity_type == 'LOGIN_SUCCESS'

        return {
            'id': self.id,
            'employee_code': self.employee_code,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'department': self.department,
            'designation': self.designation,
            'joining_date': self.joining_date.isoformat() if self.joining_date else None,
            'status': self.status,
            'is_online': is_online,
            'role_name': self.user.role.role_name if self.user and self.user.role else 'EMPLOYEE',
            'authorized_workstations': self.authorized_workstations,
            'authorized_usbs': self.authorized_usbs,
            'assigned_analyst_id': self.assigned_analyst_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
