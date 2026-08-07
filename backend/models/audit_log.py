from datetime import datetime
from database.db import db

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(100), nullable=False, index=True) # e.g. CASE_ASSIGN, CASE_RESOLVE, ALERT_ACKNOWLEDGE
    target_type = db.Column(db.String(50), nullable=True) # e.g. INVESTIGATION, ALERT, EMPLOYEE
    target_id = db.Column(db.Integer, nullable=True)
    description = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else "System",
            'action': self.action,
            'target_type': self.target_type,
            'target_id': self.target_id,
            'description': self.description,
            'ip_address': self.ip_address,
            'timestamp': (self.timestamp.isoformat() + 'Z') if self.timestamp else None
        }
