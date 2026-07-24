from database.db import db

class Role(db.Model):
    __tablename__ = 'roles'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    role_name = db.Column(db.String(50), unique=True, nullable=False)

    # Relationships
    users = db.relationship('User', back_populates='role', lazy=True)
    role_permissions = db.relationship('RolePermission', back_populates='role', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f"<Role {self.role_name}>"

    def to_dict(self):
        return {
            'id': self.id,
            'role_name': self.role_name
        }
    
    def get_permissions(self):
        """Get all permissions for this role"""
        return [rp.permission.permission_name for rp in self.role_permissions]

