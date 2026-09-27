from app import db
from datetime import datetime, timezone

class Course(db.Model):
    __tablename__ = 'courses'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))
    difficulty = db.Column(db.String(50)) # beginner, intermediate, advanced
    duration_hours = db.Column(db.Float)
    thumbnail = db.Column(db.String(255))
    is_published = db.Column(db.Boolean, default=False)
    trainer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    modules = db.relationship('Module', backref='course', cascade="all, delete-orphan")
    enrollments = db.relationship('Enrollment', backref='course', cascade="all, delete-orphan")
    quizzes = db.relationship('Quiz', backref='course_ref', cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'difficulty': self.difficulty,
            'duration_hours': self.duration_hours,
            'thumbnail': self.thumbnail,
            'is_published': self.is_published,
            'trainer_id': self.trainer_id,
            'trainer_name': self.trainer.name if self.trainer else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
