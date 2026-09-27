from flask import Blueprint, g, request
from app import db
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt, QuizAnswer
from app.models.enrollment import Enrollment
from app.models.activity import Activity
from app.utils.helpers import success_response, error_response
from app.utils.decorators import token_required
from datetime import datetime, timezone

quizzes_bp = Blueprint('quizzes', __name__)

@quizzes_bp.route('/<int:id>', methods=['GET'])
@token_required
def get_quiz(id):
    quiz = Quiz.query.get(id)
    if not quiz:
        return error_response('Quiz not found', 404)
        
    enrollment = Enrollment.query.filter_by(user_id=g.current_user.id, course_id=quiz.course_id).first()
    is_valid_enrollment = enrollment and enrollment.status in ['active', 'completed']
    if not is_valid_enrollment and g.current_user.role == 'trainee':
        return error_response('Must be enrolled to view quiz', 403)
        
    data = quiz.to_dict()
    data['questions'] = [q.to_dict(include_answer=False) for q in quiz.questions]
    return success_response(data)

@quizzes_bp.route('/<int:id>/submit', methods=['POST'])
@token_required
def submit_quiz(id):
    quiz = Quiz.query.get(id)
    if not quiz:
        return error_response('Quiz not found', 404)
        
    enrollment = Enrollment.query.filter_by(user_id=g.current_user.id, course_id=quiz.course_id).first()
    is_valid_enrollment = enrollment and enrollment.status in ['active', 'completed']
    if not is_valid_enrollment and g.current_user.role == 'trainee':
        return error_response('Must be enrolled to submit quiz', 403)
        
    data = request.get_json() or {}
    answers = data.get('answers', {}) # {question_id: selected_option}
    
    total_points = sum([q.points for q in quiz.questions])
    score = 0
    
    attempt = QuizAttempt(user_id=g.current_user.id, quiz_id=id, total_points=total_points)
    db.session.add(attempt)
    db.session.flush() # get attempt.id
    
    for question in quiz.questions:
        selected = answers.get(str(question.id))
        is_correct = selected == question.correct_option
        if is_correct:
            score += question.points
            
        ans = QuizAnswer(
            attempt_id=attempt.id,
            question_id=question.id,
            selected_option=selected,
            is_correct=is_correct
        )
        db.session.add(ans)
        
    attempt.score = score
    attempt.percentage = round((score / total_points * 100), 1) if total_points > 0 else 0
    attempt.passed = attempt.percentage >= quiz.passing_score
    attempt.completed_at = datetime.now(timezone.utc)
    
    activity = Activity(
        user_id=g.current_user.id,
        type='quiz_submit',
        description=f"Scored {attempt.percentage:.1f}% on quiz: {quiz.title}"
    )
    db.session.add(activity)
    db.session.commit()
    
    return success_response(attempt.to_dict(), 'Quiz submitted')

@quizzes_bp.route('/<int:id>/attempts', methods=['GET'])
@token_required
def get_quiz_attempts(id):
    quiz = Quiz.query.get(id)
    if not quiz:
        return error_response('Quiz not found', 404)
        
    enrollment = Enrollment.query.filter_by(user_id=g.current_user.id, course_id=quiz.course_id).first()
    is_valid_enrollment = enrollment and enrollment.status in ['active', 'completed']
    if not is_valid_enrollment and g.current_user.role == 'trainee':
        return error_response('Must be enrolled to view quiz attempts', 403)

    attempts = QuizAttempt.query.filter_by(user_id=g.current_user.id, quiz_id=id).order_by(QuizAttempt.completed_at.desc(), QuizAttempt.id.desc()).all()
    return success_response([a.to_dict() for a in attempts])

@quizzes_bp.route('/<int:id>/attempts/<int:attempt_id>', methods=['GET'])
@token_required
def get_attempt_detail(id, attempt_id):
    attempt = QuizAttempt.query.get(attempt_id)
    if not attempt or attempt.quiz_id != id:
        return error_response('Attempt not found', 404)
        
    if g.current_user.role == 'trainee' and attempt.user_id != g.current_user.id:
        return error_response('Unauthorized to access another trainee\'s attempt', 403)
        
    data = attempt.to_dict()
    data['answers'] = [{
        'id': a.id,
        'question_id': a.question_id,
        'selected_option': a.selected_option,
        'is_correct': a.is_correct
    } for a in attempt.answers]
    return success_response(data)
