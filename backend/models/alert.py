from datetime import datetime
from database.db import db

class Alert(db.Model):
    __tablename__ = 'alerts'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    employee_code = db.Column(db.String(50), nullable=False, index=True)
    severity = db.Column(db.String(20), default='LOW') # LOW, MEDIUM, HIGH, CRITICAL
    threat_type = db.Column(db.String(100), nullable=False) # Unauthorized Login, Late Night Login, etc.
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    status = db.Column(db.String(20), default='OPEN') # OPEN, INVESTIGATING, RESOLVED, DISMISSED
    description = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'employee_code': self.employee_code,
            'severity': self.severity,
            'threat_type': self.threat_type,
            'timestamp': (self.timestamp.isoformat() + 'Z') if self.timestamp else None,
            'status': self.status,
            'description': self.description
        }
