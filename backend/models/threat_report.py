from datetime import datetime
from database.db import db

class ThreatReport(db.Model):
    __tablename__ = 'threat_reports'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    employee_code = db.Column(db.String(50), nullable=False, index=True)
    risk_score = db.Column(db.Float, default=0.0)
    detected_anomalies = db.Column(db.Text, nullable=True)
    behavior_changes = db.Column(db.Text, nullable=True)
    threat_level = db.Column(db.String(20), default='LOW') # LOW, MEDIUM, HIGH, CRITICAL
    recommendations = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'employee_code': self.employee_code,
            'risk_score': self.risk_score,
            'detected_anomalies': self.detected_anomalies,
            'behavior_changes': self.behavior_changes,
            'threat_level': self.threat_level,
            'recommendations': self.recommendations,
            'created_at': (self.created_at.isoformat() + 'Z') if self.created_at else None
        }
