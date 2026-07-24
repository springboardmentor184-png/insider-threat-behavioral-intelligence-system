from datetime import datetime
from database.db import db

class BehaviorProfile(db.Model):
    __tablename__ = 'behavior_profiles'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    employee_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    avg_login_time = db.Column(db.Float, nullable=True)  # float representation of hour
    avg_logout_time = db.Column(db.Float, nullable=True) # float representation of hour
    login_frequency = db.Column(db.Float, nullable=True)  # logins per day
    weekend_logins = db.Column(db.Integer, default=0)
    night_logins = db.Column(db.Integer, default=0)
    failed_login_count = db.Column(db.Integer, default=0)
    usb_usage_frequency = db.Column(db.Float, nullable=True) # connects per day
    file_access_frequency = db.Column(db.Float, nullable=True)
    file_copy_frequency = db.Column(db.Float, nullable=True)
    external_email_count = db.Column(db.Integer, default=0)
    internal_email_count = db.Column(db.Integer, default=0)
    web_browsing_frequency = db.Column(db.Float, nullable=True)
    suspicious_web_visits = db.Column(db.Integer, default=0)
    department = db.Column(db.String(100), nullable=True)
    manager = db.Column(db.String(100), nullable=True)
    psychometric_o = db.Column(db.Integer, nullable=True)
    psychometric_c = db.Column(db.Integer, nullable=True)
    psychometric_e = db.Column(db.Integer, nullable=True)
    psychometric_a = db.Column(db.Integer, nullable=True)
    psychometric_n = db.Column(db.Integer, nullable=True)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'employee_code': self.employee_code,
            'avg_login_time': self.avg_login_time,
            'avg_logout_time': self.avg_logout_time,
            'login_frequency': self.login_frequency,
            'weekend_logins': self.weekend_logins,
            'night_logins': self.night_logins,
            'failed_login_count': self.failed_login_count,
            'usb_usage_frequency': self.usb_usage_frequency,
            'file_access_frequency': self.file_access_frequency,
            'file_copy_frequency': self.file_copy_frequency,
            'external_email_count': self.external_email_count,
            'internal_email_count': self.internal_email_count,
            'web_browsing_frequency': self.web_browsing_frequency,
            'suspicious_web_visits': self.suspicious_web_visits,
            'department': self.department,
            'manager': self.manager,
            'psychometric_o': self.psychometric_o,
            'psychometric_c': self.psychometric_c,
            'psychometric_e': self.psychometric_e,
            'psychometric_a': self.psychometric_a,
            'psychometric_n': self.psychometric_n,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }
