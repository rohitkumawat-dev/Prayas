from app import db
from datetime import datetime, timezone

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='trainee') # trainee, trainer, admin
    avatar = db.Column(db.String(255))
    bio = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    status = db.Column(db.String(20), nullable=False, default='active') # active, pending, rejected
    is_super_admin = db.Column(db.Boolean, default=False, nullable=False)
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    approved_at = db.Column(db.DateTime, nullable=True)
    rejected_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    rejected_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    courses = db.relationship('Course', backref='trainer', lazy=True, foreign_keys='Course.trainer_id')
    enrollments = db.relationship('Enrollment', backref='user', lazy=True)
    activities = db.relationship('Activity', backref='user', lazy=True, foreign_keys='Activity.user_id')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'avatar': self.avatar,
            'bio': self.bio,
            'is_active': bool(self.is_active),
            'status': self.status,
            'is_super_admin': bool(self.is_super_admin) if self.is_super_admin is not None else False,
            'approved_by': self.approved_by,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'rejected_by': self.rejected_by,
            'rejected_at': self.rejected_at.isoformat() if self.rejected_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
