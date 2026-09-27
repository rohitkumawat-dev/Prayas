from app import db
from datetime import datetime, timezone

class Lesson(db.Model):
    __tablename__ = 'lessons'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    type = db.Column(db.String(50)) # text, video, document
    duration_minutes = db.Column(db.Integer, default=0)
    order = db.Column(db.Integer, nullable=False, default=0)
    module_id = db.Column(db.Integer, db.ForeignKey('modules.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'type': self.type,
            'duration_minutes': self.duration_minutes,
            'order': self.order,
            'module_id': self.module_id
        }
