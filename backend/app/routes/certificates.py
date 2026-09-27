from flask import Blueprint, g
from app import db
from app.models.certificate import Certificate
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.lesson import Lesson
from app.models.lesson_progress import LessonProgress
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.utils.helpers import success_response, error_response
from app.utils.decorators import token_required
import uuid
from datetime import datetime, timezone

certificates_bp = Blueprint('certificates', __name__)

@certificates_bp.route('', methods=['GET'])
@token_required
def get_certificates():
    certs = Certificate.query.filter_by(user_id=g.current_user.id).all()
    return success_response([c.to_dict() for c in certs])

@certificates_bp.route('/<int:id>', methods=['GET'])
@token_required
def get_certificate(id):
    cert = Certificate.query.get(id)
    if not cert or cert.user_id != g.current_user.id:
        return error_response('Certificate not found', 404)
    return success_response(cert.to_dict())

@certificates_bp.route('/claim/<int:course_id>', methods=['POST'])
@token_required
def claim_certificate(course_id):
    course = Course.query.get(course_id)
    if not course:
        return error_response('Course not found', 404)
        
    existing_cert = Certificate.query.filter_by(user_id=g.current_user.id, course_id=course_id).first()
    if existing_cert:
        return success_response(existing_cert.to_dict(), 'Certificate already claimed')
        
    # Verify all lessons completed
    lesson_ids = [l.id for m in course.modules for l in m.lessons]
    completed_lessons = LessonProgress.query.filter(
        LessonProgress.user_id == g.current_user.id,
        LessonProgress.lesson_id.in_(lesson_ids),
        LessonProgress.completed == True
    ).count()
    
    if len(lesson_ids) > 0 and completed_lessons < len(lesson_ids):
        return error_response('Not all lessons are completed', 400)
        
    # Verify all quizzes passed
    quizzes = Quiz.query.filter_by(course_id=course_id).all()
    for q in quizzes:
        passed_attempt = QuizAttempt.query.filter_by(
            user_id=g.current_user.id, quiz_id=q.id, passed=True
        ).first()
        if not passed_attempt:
            return error_response('Not all quizzes are passed', 400)
            
    # Mark enrollment completed
    enrollment = Enrollment.query.filter_by(user_id=g.current_user.id, course_id=course_id).first()
    if enrollment:
        enrollment.status = 'completed'
        enrollment.completed_at = datetime.now(timezone.utc)
        
    cert = Certificate(
        certificate_uid=str(uuid.uuid4()),
        user_id=g.current_user.id,
        course_id=course_id,
        trainer_name=course.trainer.name if course.trainer else 'Unknown',
        course_title=course.title
    )
    db.session.add(cert)
    db.session.commit()
    
    return success_response(cert.to_dict(), 'Certificate claimed successfully', 201)
