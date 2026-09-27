from flask import Blueprint, g
from app.models.enrollment import Enrollment
from app.models.course import Course
from app.models.lesson_progress import LessonProgress
from app.models.lesson import Lesson
from app.models.quiz_attempt import QuizAttempt
from app.models.quiz import Quiz
from app.models.certificate import Certificate
from app.models.activity import Activity
from app.utils.helpers import success_response, error_response
from app.utils.decorators import token_required

progress_bp = Blueprint('progress', __name__)

@progress_bp.route('', methods=['GET'])
@token_required
def get_all_progress():
    enrollments = Enrollment.query.filter_by(user_id=g.current_user.id).all()
    results = []
    for e in enrollments:
        course = Course.query.get(e.course_id)
        if not course:
            continue
        total_lessons = sum(len(m.lessons) for m in course.modules)
        completed_lessons = LessonProgress.query.join(Lesson).filter(
            LessonProgress.user_id == g.current_user.id,
            LessonProgress.completed == True,
            Lesson.module_id.in_([m.id for m in course.modules])
        ).count()
        progress_pct = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0

        # Quiz info
        quizzes = Quiz.query.filter_by(course_id=course.id).all()
        quiz_attempts = []
        for q in quizzes:
            best = QuizAttempt.query.filter_by(
                user_id=g.current_user.id, quiz_id=q.id
            ).order_by(QuizAttempt.percentage.desc()).first()
            if best:
                quiz_attempts.append({
                    'quiz_title': q.title,
                    'best_score': best.percentage,
                    'passed': best.passed
                })

        results.append({
            'course_id': course.id,
            'title': course.title,
            'category': course.category,
            'difficulty': course.difficulty,
            'trainer_name': course.trainer.name if course.trainer else None,
            'progress': round(progress_pct, 1),
            'completed_lessons': completed_lessons,
            'total_lessons': total_lessons,
            'status': e.status,
            'enrolled_at': e.enrolled_at.isoformat() if e.enrolled_at else None,
            'completed_at': e.completed_at.isoformat() if e.completed_at else None,
            'quiz_results': quiz_attempts
        })
    return success_response(results)

@progress_bp.route('/courses/<int:id>', methods=['GET'])
@token_required
def get_course_progress(id):
    course = Course.query.get(id)
    if not course:
        return error_response('Course not found', 404)

    enrollment = Enrollment.query.filter_by(user_id=g.current_user.id, course_id=id).first()
    if not enrollment:
        return error_response('Not enrolled in this course', 403)

    # Per-module progress
    modules_progress = []
    total_completed = 0
    total_lessons_count = 0

    for m in sorted(course.modules, key=lambda x: x.order):
        lessons = sorted(m.lessons, key=lambda x: x.order)
        total = len(lessons)
        completed = 0
        lesson_details = []
        for l in lessons:
            lp = LessonProgress.query.filter_by(user_id=g.current_user.id, lesson_id=l.id).first()
            is_done = lp.completed if lp else False
            if is_done:
                completed += 1
            lesson_details.append({
                'id': l.id,
                'title': l.title,
                'is_completed': is_done
            })
        total_completed += completed
        total_lessons_count += total
        modules_progress.append({
            'module_id': m.id,
            'title': m.title,
            'order': m.order,
            'total_lessons': total,
            'completed_lessons': completed,
            'progress': round((completed / total * 100) if total > 0 else 0, 1),
            'lessons': lesson_details
        })

    # Quiz results for this course
    quizzes = Quiz.query.filter_by(course_id=id).all()
    quiz_results = []
    for q in quizzes:
        attempts = QuizAttempt.query.filter_by(
            user_id=g.current_user.id, quiz_id=q.id
        ).order_by(QuizAttempt.completed_at.desc()).all()
        quiz_results.append({
            'quiz_id': q.id,
            'title': q.title,
            'passing_score': q.passing_score,
            'attempts': [a.to_dict() for a in attempts]
        })

    overall_progress = round((total_completed / total_lessons_count * 100) if total_lessons_count > 0 else 0, 1)

    # Check certificate
    cert = Certificate.query.filter_by(user_id=g.current_user.id, course_id=id).first()

    return success_response({
        'course_id': course.id,
        'title': course.title,
        'status': enrollment.status,
        'overall_progress': overall_progress,
        'total_lessons': total_lessons_count,
        'completed_lessons': total_completed,
        'modules': modules_progress,
        'quiz_results': quiz_results,
        'certificate': cert.to_dict() if cert else None,
        'enrolled_at': enrollment.enrolled_at.isoformat() if enrollment.enrolled_at else None,
    })

@progress_bp.route('/dashboard', methods=['GET'])
@token_required
def get_dashboard():
    """Trainee dashboard data."""
    user_id = g.current_user.id

    enrollments = Enrollment.query.filter_by(user_id=user_id).all()
    enrolled_count = len(enrollments)
    completed_count = sum(1 for e in enrollments if e.status == 'completed')
    certificates_count = Certificate.query.filter_by(user_id=user_id).count()

    # Active courses with progress
    active_courses = []
    total_progress = 0
    for e in enrollments:
        course = Course.query.get(e.course_id)
        if not course:
            continue
        total_lessons = sum(len(m.lessons) for m in course.modules)
        completed_lessons = LessonProgress.query.join(Lesson).filter(
            LessonProgress.user_id == user_id,
            LessonProgress.completed == True,
            Lesson.module_id.in_([m.id for m in course.modules])
        ).count()
        progress_pct = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
        total_progress += progress_pct

        if e.status == 'active':
            active_courses.append({
                'course_id': course.id,
                'title': course.title,
                'category': course.category,
                'progress': round(progress_pct, 1),
                'completed_lessons': completed_lessons,
                'total_lessons': total_lessons,
                'trainer_name': course.trainer.name if course.trainer else None,
            })

    avg_progress = round(total_progress / enrolled_count, 1) if enrolled_count > 0 else 0

    # Recent activity
    recent_activities = Activity.query.filter_by(user_id=user_id).order_by(
        Activity.created_at.desc()
    ).limit(10).all()

    # Recent quiz results
    recent_quizzes = QuizAttempt.query.filter_by(user_id=user_id).order_by(
        QuizAttempt.completed_at.desc()
    ).limit(5).all()
    quiz_results = []
    for a in recent_quizzes:
        quiz = Quiz.query.get(a.quiz_id)
        quiz_results.append({
            **a.to_dict(),
            'quiz_title': quiz.title if quiz else 'Unknown',
            'course_title': quiz.course_ref.title if quiz and quiz.course_ref else 'Unknown'
        })

    return success_response({
        'enrolled_courses': enrolled_count,
        'completed_courses': completed_count,
        'certificates': certificates_count,
        'avg_progress': avg_progress,
        'active_courses': active_courses,
        'recent_activities': [a.to_dict() for a in recent_activities],
        'recent_quiz_results': quiz_results,
    })
