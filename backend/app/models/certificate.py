from app import db
from datetime import datetime, timezone

class Certificate(db.Model):
    __tablename__ = 'certificates'
    id = db.Column(db.Integer, primary_key=True)
    certificate_uid = db.Column(db.String(100), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    issued_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    trainer_name = db.Column(db.String(100))
    course_title = db.Column(db.String(200))

    cert_user = db.relationship('User', backref='certificates', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'certificate_uid': self.certificate_uid,
            'user_id': self.user_id,
            'course_id': self.course_id,
            'issued_at': self.issued_at.isoformat() if self.issued_at else None,
            'trainer_name': self.trainer_name,
            'course_title': self.course_title,
            'user_name': self.cert_user.name if self.cert_user else None
        }
