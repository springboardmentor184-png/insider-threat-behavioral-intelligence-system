from datetime import datetime
from database.db import db

class BehaviorBaseline(db.Model):
    __tablename__ = 'behavior_baselines'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    employee_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    normal_login_hour = db.Column(db.Float, nullable=True)
    normal_logout_hour = db.Column(db.Float, nullable=True)
    avg_usb_per_day = db.Column(db.Float, nullable=True)
    avg_files_per_day = db.Column(db.Float, nullable=True)
    avg_emails_per_day = db.Column(db.Float, nullable=True)
    avg_websites_per_day = db.Column(db.Float, nullable=True)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'employee_code': self.employee_code,
            'normal_login_hour': self.normal_login_hour,
            'normal_logout_hour': self.normal_logout_hour,
            'avg_usb_per_day': self.avg_usb_per_day,
            'avg_files_per_day': self.avg_files_per_day,
            'avg_emails_per_day': self.avg_emails_per_day,
            'avg_websites_per_day': self.avg_websites_per_day,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }
