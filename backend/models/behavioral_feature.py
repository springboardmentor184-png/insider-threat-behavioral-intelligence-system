from datetime import datetime
from database.db import db

class BehaviorFeature(db.Model):
    __tablename__ = 'behavior_features'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    employee_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    late_login = db.Column(db.Float, default=0.0)
    weekend_login = db.Column(db.Float, default=0.0)
    multiple_devices = db.Column(db.Integer, default=0)
    usb_usage = db.Column(db.Float, default=0.0)
    mass_file_access = db.Column(db.Float, default=0.0)
    large_file_transfer = db.Column(db.Float, default=0.0)
    external_email_ratio = db.Column(db.Float, default=0.0)
    job_search_websites = db.Column(db.Integer, default=0)
    failed_logins = db.Column(db.Integer, default=0)
    login_frequency = db.Column(db.Float, default=0.0)
    average_session_duration = db.Column(db.Float, default=0.0)
    activity_after_hours = db.Column(db.Float, default=0.0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'employee_code': self.employee_code,
            'late_login': self.late_login,
            'weekend_login': self.weekend_login,
            'multiple_devices': self.multiple_devices,
            'usb_usage': self.usb_usage,
            'mass_file_access': self.mass_file_access,
            'large_file_transfer': self.large_file_transfer,
            'external_email_ratio': self.external_email_ratio,
            'job_search_websites': self.job_search_websites,
            'failed_logins': self.failed_logins,
            'login_frequency': self.login_frequency,
            'average_session_duration': self.average_session_duration,
            'activity_after_hours': self.activity_after_hours,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }
