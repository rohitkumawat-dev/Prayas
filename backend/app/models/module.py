from app import db
from datetime import datetime, timezone

class Module(db.Model):
    __tablename__ = 'modules'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    order = db.Column(db.Integer, nullable=False, default=0)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    lessons = db.relationship('Lesson', backref='module', cascade="all, delete-orphan", order_by="Lesson.order")
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'order': self.order,
            'course_id': self.course_id,
            'lessons': [lesson.to_dict() for lesson in self.lessons] if self.lessons else [],
            'quiz': self.quizzes[0].to_dict() if self.quizzes else None
        }
