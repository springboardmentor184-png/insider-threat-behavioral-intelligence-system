from datetime import datetime
from database.db import db

class RiskScore(db.Model):
    __tablename__ = 'risk_scores'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    employee_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    risk_score = db.Column(db.Float, default=0.0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'employee_code': self.employee_code,
            'risk_score': self.risk_score,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }
