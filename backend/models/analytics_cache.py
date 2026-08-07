from datetime import datetime
from database.db import db

class AnalyticsCache(db.Model):
    __tablename__ = 'analytics_cache'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    cache_key = db.Column(db.String(255), unique=True, nullable=False, index=True)
    cache_value = db.Column(db.Text, nullable=False) # JSON encoded cache content
    expires_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'cache_key': self.cache_key,
            'cache_value': self.cache_value,
            'expires_at': (self.expires_at.isoformat() + 'Z') if self.expires_at else None,
            'created_at': (self.created_at.isoformat() + 'Z') if self.created_at else None
        }
