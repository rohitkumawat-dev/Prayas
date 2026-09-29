from app import db
from datetime import datetime, timezone

class Quiz(db.Model):
    __tablename__ = 'quizzes'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    passing_score = db.Column(db.Float, default=70.0)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    module_id = db.Column(db.Integer, db.ForeignKey('modules.id', ondelete='CASCADE'), nullable=True)
    time_limit_minutes = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    questions = db.relationship('Question', backref='quiz', cascade="all, delete-orphan", order_by="Question.order")
    module_ref = db.relationship('Module', backref=db.backref('quizzes', cascade="all, delete-orphan"), foreign_keys=[module_id])

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'passing_score': self.passing_score,
            'course_id': self.course_id,
            'module_id': self.module_id,
            'time_limit_minutes': self.time_limit_minutes,
            'questions_count': len(self.questions),
            'is_final': self.module_id is None,
            'module_title': self.module_ref.title if self.module_ref else None
        }

class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id', ondelete='CASCADE'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.String(255), nullable=False)
    option_b = db.Column(db.String(255), nullable=False)
    option_c = db.Column(db.String(255))
    option_d = db.Column(db.String(255))
    correct_option = db.Column(db.String(1), nullable=False) # a, b, c, d
    order = db.Column(db.Integer, default=0)
    points = db.Column(db.Integer, default=1)

    def to_dict(self, include_answer=False):
        data = {
            'id': self.id,
            'quiz_id': self.quiz_id,
            'text': self.text,
            'option_a': self.option_a,
            'option_b': self.option_b,
            'option_c': self.option_c,
            'option_d': self.option_d,
            'order': self.order,
            'points': self.points
        }
        if include_answer:
            data['correct_option'] = self.correct_option
        return data
