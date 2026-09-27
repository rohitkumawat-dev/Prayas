from flask import Blueprint, request, g
from app import db
from app.models.course import Course
from app.models.module import Module
from app.models.lesson import Lesson
from app.models.quiz import Quiz, Question
from app.models.enrollment import Enrollment
from app.models.lesson_progress import LessonProgress
from app.models.quiz_attempt import QuizAttempt
from app.models.activity import Activity
from app.models.user import User
from app.utils.helpers import success_response, error_response
from app.utils.decorators import token_required, role_required, trainer_owns_course
from app.services.trainer_analytics_service import TrainerAnalyticsService

trainer_bp = Blueprint('trainer', __name__)

@trainer_bp.route('/courses', methods=['GET'])
@token_required
@role_required(['trainer'])
def get_my_courses():
    courses = Course.query.filter_by(trainer_id=g.current_user.id).all()
    result = []
    for c in courses:
        data = c.to_dict()
        data['enrollment_count'] = Enrollment.query.filter_by(course_id=c.id).count()
        data['module_count'] = len(c.modules)
        total_lessons = sum(len(m.lessons) for m in c.modules)
        data['lesson_count'] = total_lessons
        result.append(data)
    return success_response(result)

@trainer_bp.route('/courses', methods=['POST'])
@token_required
@role_required(['trainer'])
def create_course():
    data = request.get_json()
    if not data.get('title'):
        return error_response('Course title is required')
    course = Course(
        title=data.get('title'),
        description=data.get('description', ''),
        category=data.get('category', 'General'),
        difficulty=data.get('difficulty', 'beginner'),
        duration_hours=data.get('duration_hours', 0),
        is_published=data.get('is_published', False),
        trainer_id=g.current_user.id
    )
    db.session.add(course)
    db.session.commit()

    activity = Activity(user_id=g.current_user.id, type='course_created',
                        description=f'Created course: {course.title}')
    db.session.add(activity)
    db.session.commit()

    return success_response(course.to_dict(), 'Course created', 201)

@trainer_bp.route('/courses/<int:id>', methods=['PUT'])
@token_required
@role_required(['trainer'])
@trainer_owns_course
def update_course(id):
    data = request.get_json()
    course = g.course
    allowed = ['title', 'description', 'category', 'difficulty', 'duration_hours', 'is_published', 'thumbnail']
    for key in allowed:
        if key in data:
            setattr(course, key, data[key])
    db.session.commit()
    return success_response(course.to_dict(), 'Course updated')

@trainer_bp.route('/courses/<int:id>', methods=['DELETE'])
@token_required
@role_required(['trainer'])
@trainer_owns_course
def delete_course(id):
    db.session.delete(g.course)
    db.session.commit()
    return success_response(None, 'Course deleted')

@trainer_bp.route('/courses/<int:id>/modules', methods=['POST'])
@token_required
@role_required(['trainer'])
@trainer_owns_course
def create_module(id):
    data = request.get_json()
    if not data.get('title'):
        return error_response('Module title is required')
    max_order = db.session.query(db.func.max(Module.order)).filter_by(course_id=id).scalar() or 0
    module = Module(
        title=data.get('title'),
        description=data.get('description', ''),
        order=data.get('order', max_order + 1),
        course_id=id
    )
    db.session.add(module)
    db.session.commit()
    return success_response(module.to_dict(), 'Module created', 201)

@trainer_bp.route('/modules/<int:id>', methods=['PUT'])
@token_required
@role_required(['trainer'])
def update_module(id):
    module = Module.query.get(id)
    if not module or module.course.trainer_id != g.current_user.id:
        return error_response('Module not found or unauthorized', 404)
    data = request.get_json()
    for key in ['title', 'description', 'order']:
        if key in data:
            setattr(module, key, data[key])
    db.session.commit()
    return success_response(module.to_dict(), 'Module updated')

@trainer_bp.route('/modules/<int:id>', methods=['DELETE'])
@token_required
@role_required(['trainer'])
def delete_module(id):
    module = Module.query.get(id)
    if not module or module.course.trainer_id != g.current_user.id:
        return error_response('Module not found or unauthorized', 404)
    db.session.delete(module)
    db.session.commit()
    return success_response(None, 'Module deleted')

@trainer_bp.route('/modules/<int:id>/lessons', methods=['POST'])
@token_required
@role_required(['trainer'])
def create_lesson(id):
    module = Module.query.get(id)
    if not module or module.course.trainer_id != g.current_user.id:
        return error_response('Module not found or unauthorized', 404)
    data = request.get_json()
    if not data.get('title'):
        return error_response('Lesson title is required')
    max_order = db.session.query(db.func.max(Lesson.order)).filter_by(module_id=id).scalar() or 0
    lesson = Lesson(
        title=data.get('title'),
        content=data.get('content', ''),
        type=data.get('type', 'text'),
        duration_minutes=data.get('duration_minutes', 10),
        order=data.get('order', max_order + 1),
        module_id=id
    )
    db.session.add(lesson)
    db.session.commit()
    return success_response(lesson.to_dict(), 'Lesson created', 201)

@trainer_bp.route('/lessons/<int:id>', methods=['PUT'])
@token_required
@role_required(['trainer'])
def update_lesson(id):
    lesson = Lesson.query.get(id)
    if not lesson or lesson.module.course.trainer_id != g.current_user.id:
        return error_response('Lesson not found or unauthorized', 404)
    data = request.get_json()
    for key in ['title', 'content', 'type', 'duration_minutes', 'order']:
        if key in data:
            setattr(lesson, key, data[key])
    db.session.commit()
    return success_response(lesson.to_dict(), 'Lesson updated')

@trainer_bp.route('/lessons/<int:id>', methods=['DELETE'])
@token_required
@role_required(['trainer'])
def delete_lesson(id):
    lesson = Lesson.query.get(id)
    if not lesson or lesson.module.course.trainer_id != g.current_user.id:
        return error_response('Lesson not found or unauthorized', 404)
    db.session.delete(lesson)
    db.session.commit()
    return success_response(None, 'Lesson deleted')

@trainer_bp.route('/courses/<int:id>/quizzes', methods=['POST'])
@token_required
@role_required(['trainer'])
@trainer_owns_course
def create_quiz(id):
    data = request.get_json()
    if not data.get('title'):
        return error_response('Quiz title is required')
    quiz = Quiz(
        title=data.get('title'),
        description=data.get('description', ''),
        passing_score=data.get('passing_score', 70.0),
        course_id=id,
        module_id=data.get('module_id'),
        time_limit_minutes=data.get('time_limit_minutes')
    )
    db.session.add(quiz)
    db.session.commit()
    return success_response(quiz.to_dict(), 'Quiz created', 201)

@trainer_bp.route('/quizzes/<int:id>', methods=['PUT'])
@token_required
@role_required(['trainer'])
def update_quiz(id):
    quiz = Quiz.query.get(id)
    if not quiz or quiz.course_ref.trainer_id != g.current_user.id:
        return error_response('Quiz not found or unauthorized', 404)
    data = request.get_json()
    for key in ['title', 'description', 'passing_score', 'module_id', 'time_limit_minutes']:
        if key in data:
            setattr(quiz, key, data[key])
    db.session.commit()
    return success_response(quiz.to_dict(), 'Quiz updated')

@trainer_bp.route('/quizzes/<int:id>', methods=['DELETE'])
@token_required
@role_required(['trainer'])
def delete_quiz(id):
    quiz = Quiz.query.get(id)
    if not quiz or quiz.course_ref.trainer_id != g.current_user.id:
        return error_response('Quiz not found or unauthorized', 404)
    db.session.delete(quiz)
    db.session.commit()
    return success_response(None, 'Quiz deleted')

@trainer_bp.route('/quizzes/<int:id>/questions', methods=['POST'])
@token_required
@role_required(['trainer'])
def create_question(id):
    quiz = Quiz.query.get(id)
    if not quiz or quiz.course_ref.trainer_id != g.current_user.id:
        return error_response('Quiz not found or unauthorized', 404)
    data = request.get_json()
    if not data.get('text'):
        return error_response('Question text is required')
    question = Question(
        quiz_id=id,
        text=data.get('text'),
        option_a=data.get('option_a', ''),
        option_b=data.get('option_b', ''),
        option_c=data.get('option_c', ''),
        option_d=data.get('option_d', ''),
        correct_option=data.get('correct_option', 'a'),
        points=data.get('points', 1)
    )
    db.session.add(question)
    db.session.commit()
    return success_response(question.to_dict(True), 'Question added', 201)

@trainer_bp.route('/questions/<int:id>', methods=['PUT'])
@token_required
@role_required(['trainer'])
def update_question(id):
    question = Question.query.get(id)
    if not question or question.quiz.course_ref.trainer_id != g.current_user.id:
        return error_response('Question not found or unauthorized', 404)
    data = request.get_json()
    for key in ['text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'points']:
        if key in data:
            setattr(question, key, data[key])
    db.session.commit()
    return success_response(question.to_dict(True), 'Question updated')

@trainer_bp.route('/questions/<int:id>', methods=['DELETE'])
@token_required
@role_required(['trainer'])
def delete_question(id):
    question = Question.query.get(id)
    if not question or question.quiz.course_ref.trainer_id != g.current_user.id:
        return error_response('Question not found or unauthorized', 404)
    db.session.delete(question)
    db.session.commit()
    return success_response(None, 'Question deleted')

@trainer_bp.route('/students', methods=['GET'])
@token_required
@role_required(['trainer'])
def get_students():
    courses = Course.query.filter_by(trainer_id=g.current_user.id).all()
    course_ids = [c.id for c in courses]
    if not course_ids:
        return success_response([])

    enrollments = Enrollment.query.filter(Enrollment.course_id.in_(course_ids)).all()
    students = []
    for e in enrollments:
        course = next((c for c in courses if c.id == e.course_id), None)
        if not course:
            continue
        total_lessons = sum(len(m.lessons) for m in course.modules)
        completed_lessons = LessonProgress.query.join(Lesson).filter(
            LessonProgress.user_id == e.user_id,
            LessonProgress.completed == True,
            Lesson.module_id.in_([m.id for m in course.modules])
        ).count()
        progress = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0

        quiz_attempts = QuizAttempt.query.join(Quiz).filter(
            QuizAttempt.user_id == e.user_id,
            Quiz.course_id == course.id
        ).all()
        quiz_avg = sum(a.percentage for a in quiz_attempts) / len(quiz_attempts) if quiz_attempts else 0

        students.append({
            'user': e.user.to_dict(),
            'course_id': course.id,
            'course_title': course.title,
            'progress': round(progress, 1),
            'quiz_average': round(quiz_avg, 1),
            'status': e.status,
            'enrolled_at': e.enrolled_at.isoformat() if e.enrolled_at else None,
            'completed_at': e.completed_at.isoformat() if e.completed_at else None,
        })
    return success_response(students)

@trainer_bp.route('/analytics', methods=['GET'])
@token_required
@role_required(['trainer'])
def get_analytics():
    courses = Course.query.filter_by(trainer_id=g.current_user.id).all()
    course_ids = [c.id for c in courses]
    total_courses = len(courses)

    enrollments = Enrollment.query.filter(Enrollment.course_id.in_(course_ids)).all() if course_ids else []
    total_enrollments = len(enrollments)
    active_learners = sum(1 for e in enrollments if e.status == 'active')
    completed_count = sum(1 for e in enrollments if e.status == 'completed')
    completion_rate = (completed_count / total_enrollments * 100) if total_enrollments > 0 else 0

    quiz_attempts = QuizAttempt.query.join(Quiz).filter(Quiz.course_id.in_(course_ids)).all() if course_ids else []
    avg_quiz_score = sum(a.percentage for a in quiz_attempts) / len(quiz_attempts) if quiz_attempts else 0

    # Per-course breakdown
    course_stats = []
    for c in courses:
        c_enrollments = [e for e in enrollments if e.course_id == c.id]
        c_completed = sum(1 for e in c_enrollments if e.status == 'completed')
        course_stats.append({
            'course_id': c.id,
            'title': c.title,
            'enrollments': len(c_enrollments),
            'completions': c_completed,
            'completion_rate': round((c_completed / len(c_enrollments) * 100) if c_enrollments else 0, 1),
        })

    return success_response({
        'total_courses': total_courses,
        'total_enrollments': total_enrollments,
        'active_learners': active_learners,
        'completed_count': completed_count,
        'completion_rate': round(completion_rate, 1),
        'avg_quiz_score': round(avg_quiz_score, 1),
        'course_stats': course_stats,
    })

@trainer_bp.route('/needs-attention', methods=['GET'])
@token_required
@role_required(['trainer'])
def needs_attention():
    courses = Course.query.filter_by(trainer_id=g.current_user.id).all()
    course_ids = [c.id for c in courses]
    if not course_ids:
        return success_response([])

    enrollments = Enrollment.query.filter(
        Enrollment.course_id.in_(course_ids),
        Enrollment.status == 'active'
    ).all()

    attention_list = []
    for e in enrollments:
        course = next((c for c in courses if c.id == e.course_id), None)
        if not course:
            continue
        total_lessons = sum(len(m.lessons) for m in course.modules)
        completed_lessons = LessonProgress.query.join(Lesson).filter(
            LessonProgress.user_id == e.user_id,
            LessonProgress.completed == True,
            Lesson.module_id.in_([m.id for m in course.modules])
        ).count()
        progress = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0

        quiz_attempts = QuizAttempt.query.join(Quiz).filter(
            QuizAttempt.user_id == e.user_id,
            Quiz.course_id == course.id
        ).all()
        quiz_avg = sum(a.percentage for a in quiz_attempts) / len(quiz_attempts) if quiz_attempts else None

        reasons = []
        if progress < 40:
            reasons.append(f'Low progress ({round(progress, 1)}%)')
        if quiz_avg is not None and quiz_avg < 50:
            reasons.append(f'Low quiz performance ({round(quiz_avg, 1)}%)')

        if reasons:
            attention_list.append({
                'user': e.user.to_dict(),
                'course_title': course.title,
                'course_id': course.id,
                'progress': round(progress, 1),
                'quiz_average': round(quiz_avg, 1) if quiz_avg is not None else None,
                'reasons': reasons,
                'enrolled_at': e.enrolled_at.isoformat() if e.enrolled_at else None,
            })

    return success_response(attention_list)

@trainer_bp.route('/courses/<int:id>/performance', methods=['GET'])
@token_required
@role_required(['trainer'])
@trainer_owns_course
def get_course_performance(id):
    data = TrainerAnalyticsService.get_course_performance(id)
    if not data:
        return error_response('Course not found', 404)
    return success_response(data)

@trainer_bp.route('/courses/<int:id>/learners', methods=['GET'])
@token_required
@role_required(['trainer'])
@trainer_owns_course
def get_course_learners(id):
    data = TrainerAnalyticsService.get_course_learners(id)
    if data is None:
        return error_response('Course not found', 404)
    return success_response(data)

@trainer_bp.route('/courses/<int:id>/learners/<int:trainee_id>', methods=['GET'])
@token_required
@role_required(['trainer'])
@trainer_owns_course
def get_learner_detail(id, trainee_id):
    data = TrainerAnalyticsService.get_learner_detail(id, trainee_id)
    if not data:
        return error_response('Learner or course not found', 404)
    return success_response(data)

@trainer_bp.route('/courses/<int:id>/quizzes/performance', methods=['GET'])
@token_required
@role_required(['trainer'])
@trainer_owns_course
def get_course_quizzes_performance(id):
    data = TrainerAnalyticsService.get_course_quizzes_performance(id)
    if not data:
        return error_response('Course not found', 404)
    return success_response(data)

