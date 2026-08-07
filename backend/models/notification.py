from datetime import datetime
from database.db import db

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    employee_code = db.Column(db.String(50), nullable=True, index=True)
    message = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(20), default='LOW') # LOW, MEDIUM, HIGH, CRITICAL
    recipient_role = db.Column(db.String(50), nullable=True, index=True) # e.g. ADMINISTRATOR, SECURITY_ANALYST
    recipient_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    is_read = db.Column(db.Boolean, default=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    # Relationships
    recipient = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'employee_code': self.employee_code,
            'message': self.message,
            'severity': self.severity,
            'recipient_role': self.recipient_role,
            'recipient_user_id': self.recipient_user_id,
            'is_read': self.is_read,
            'created_at': (self.created_at.isoformat() + 'Z') if self.created_at else None
        }
