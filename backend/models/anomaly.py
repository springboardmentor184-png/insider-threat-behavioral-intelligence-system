from datetime import datetime
from database.db import db

class Anomaly(db.Model):
    __tablename__ = 'anomalies'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    employee_code = db.Column(db.String(50), nullable=False, index=True)
    score = db.Column(db.Float, default=0.0) # Anomaly score from model
    is_anomaly = db.Column(db.Boolean, default=False)
    detected_at = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'employee_code': self.employee_code,
            'score': self.score,
            'is_anomaly': self.is_anomaly,
            'detected_at': (self.detected_at.isoformat() + 'Z') if self.detected_at else None,
            'details': self.details
        }
