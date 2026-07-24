from database.db import db

class Permission(db.Model):
    __tablename__ = 'permissions'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    permission_name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)

    # Relationships
    role_permissions = db.relationship('RolePermission', back_populates='permission', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f"<Permission {self.permission_name}>"

    def to_dict(self):
        return {
            'id': self.id,
            'permission_name': self.permission_name,
            'description': self.description
        }
