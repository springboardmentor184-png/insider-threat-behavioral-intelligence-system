from datetime import datetime
from database.db import db

class Investigation(db.Model):
    __tablename__ = 'investigations'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    alert_id = db.Column(db.Integer, db.ForeignKey('alerts.id'), nullable=True)
    employee_code = db.Column(db.String(50), nullable=False, index=True)
    assigned_analyst_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=True)
    risk_score = db.Column(db.Float, default=0.0)
    priority = db.Column(db.String(20), default='MEDIUM') # LOW, MEDIUM, HIGH, CRITICAL
    status = db.Column(db.String(20), default='OPEN') # OPEN, ASSIGNED, IN_PROGRESS, ESCALATED, RESOLVED, CLOSED
    evidence_desc = db.Column(db.Text, nullable=True) # Text overview of evidence
    recommendation = db.Column(db.Text, nullable=True)
    resolution = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    alert = db.relationship('Alert', backref=db.backref('investigation', uselist=False))
    analyst = db.relationship('Employee', foreign_keys=[assigned_analyst_id])
    notes = db.relationship('InvestigationNote', back_populates='investigation', lazy=True, cascade="all, delete-orphan")
    evidence_files = db.relationship('Evidence', back_populates='investigation', lazy=True, cascade="all, delete-orphan")
    events = db.relationship('InvestigationEvent', back_populates='investigation', lazy=True, cascade="all, delete-orphan", order_by="InvestigationEvent.timestamp.asc()")

    def to_dict(self):
        return {
            'id': self.id,
            'alert_id': self.alert_id,
            'employee_code': self.employee_code,
            'assigned_analyst_id': self.assigned_analyst_id,
            'assigned_analyst_name': f"{self.analyst.first_name} {self.analyst.last_name}" if self.analyst else "Unassigned",
            'risk_score': self.risk_score,
            'priority': self.priority,
            'status': self.status,
            'evidence_desc': self.evidence_desc,
            'recommendation': self.recommendation,
            'resolution': self.resolution,
            'created_at': (self.created_at.isoformat() + 'Z') if self.created_at else None,
            'updated_at': (self.updated_at.isoformat() + 'Z') if self.updated_at else None,
            'notes': [note.to_dict() for note in self.notes] if self.notes else [],
            'evidence_files': [ev.to_dict() for ev in self.evidence_files] if self.evidence_files else [],
            'events': [ev.to_dict() for ev in self.events] if self.events else []
        }

class InvestigationEvent(db.Model):
    __tablename__ = 'investigation_events'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    investigation_id = db.Column(db.Integer, db.ForeignKey('investigations.id'), nullable=False)
    event_type = db.Column(db.String(100), nullable=False) # e.g. CASE_CREATED, CASE_ASSIGNED, EVIDENCE_ADDED, NOTE_ADDED, CASE_RESOLVED, CASE_CLOSED
    description = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    # Relationships
    investigation = db.relationship('Investigation', back_populates='events')
    user = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'investigation_id': self.investigation_id,
            'event_type': self.event_type,
            'description': self.description,
            'timestamp': (self.timestamp.isoformat() + 'Z') if self.timestamp else None,
            'user_id': self.user_id,
            'username': self.user.username if self.user else "System"
        }

class InvestigationNote(db.Model):
    __tablename__ = 'investigation_notes'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    investigation_id = db.Column(db.Integer, db.ForeignKey('investigations.id'), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    note = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    investigation = db.relationship('Investigation', back_populates='notes')
    author = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'investigation_id': self.investigation_id,
            'author_id': self.author_id,
            'author_name': self.author.username if self.author else "System",
            'note': self.note,
            'created_at': (self.created_at.isoformat() + 'Z') if self.created_at else None
        }

class Evidence(db.Model):
    __tablename__ = 'evidence'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    investigation_id = db.Column(db.Integer, db.ForeignKey('investigations.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(512), nullable=False)
    file_size = db.Column(db.Integer, nullable=True) # in bytes
    uploaded_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    investigation = db.relationship('Investigation', back_populates='evidence_files')
    uploader = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'investigation_id': self.investigation_id,
            'filename': self.filename,
            'filepath': self.filepath,
            'file_size': self.file_size,
            'uploaded_by_id': self.uploaded_by_id,
            'uploader_name': self.uploader.username if self.uploader else "System",
            'uploaded_at': (self.uploaded_at.isoformat() + 'Z') if self.uploaded_at else None
        }
