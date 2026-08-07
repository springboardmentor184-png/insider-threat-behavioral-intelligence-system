from datetime import datetime
from database.db import db

class RiskHistory(db.Model):
    __tablename__ = 'risk_history'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    employee_code = db.Column(db.String(50), nullable=False, index=True)
    risk_score = db.Column(db.Float, default=0.0)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    details = db.Column(db.Text, nullable=True) # JSON or descriptive text of scores/reasons

    def to_dict(self):
        return {
            'id': self.id,
            'employee_code': self.employee_code,
            'risk_score': self.risk_score,
            'recorded_at': (self.recorded_at.isoformat() + 'Z') if self.recorded_at else None,
            'details': self.details
        }
