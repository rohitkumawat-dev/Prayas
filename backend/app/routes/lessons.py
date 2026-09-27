from flask import Blueprint, g, current_app
from app import db
from app.models.lesson import Lesson
from app.models.enrollment import Enrollment
from app.models.lesson_progress import LessonProgress
from app.models.activity import Activity
from app.utils.helpers import success_response, error_response
from app.utils.decorators import token_required
from datetime import datetime, timezone

lessons_bp = Blueprint('lessons', __name__)

@lessons_bp.route('/<int:id>', methods=['GET'])
@token_required
def get_lesson(id):
    lesson = Lesson.query.get(id)
    if not lesson:
        return error_response('Lesson not found', 404)

    course_id = lesson.module.course_id
    enrollment = Enrollment.query.filter_by(user_id=g.current_user.id, course_id=course_id).first()
    is_valid_enrollment = enrollment and enrollment.status in ['active', 'completed']
    if not is_valid_enrollment and g.current_user.role == 'trainee':
        current_app.logger.warning(
            f"[LESSON AUTH REJECTED] User ID: {g.current_user.id} ({g.current_user.email}, role: {g.current_user.role}), "
            f"Lesson ID: {lesson.id} ('{lesson.title}'), "
            f"Resolved Module ID: {lesson.module_id} ('{lesson.module.title}'), "
            f"Resolved Course ID: {course_id} ('{lesson.module.course.title}'), "
            f"Enrollment Found: {enrollment is not None}, "
            f"Enrollment User ID: {enrollment.user_id if enrollment else None}, "
            f"Enrollment Course ID: {enrollment.course_id if enrollment else None}, "
            f"Enrollment Status: {enrollment.status if enrollment else None}"
        )
        return error_response('You must be enrolled to view this lesson', 403)

    data = lesson.to_dict()

    # Include completion status
    progress = LessonProgress.query.filter_by(user_id=g.current_user.id, lesson_id=id).first()
    data['is_completed'] = progress.completed if progress else False

    # Include course and module info for navigation
    module = lesson.module
    course = module.course
    data['course_id'] = course.id
    data['course_title'] = course.title
    data['module_title'] = module.title

    # Build navigation (prev/next lessons)
    all_lessons = []
    for m in sorted(course.modules, key=lambda x: x.order):
        for l in sorted(m.lessons, key=lambda x: x.order):
            all_lessons.append(l)

    current_index = next((i for i, l in enumerate(all_lessons) if l.id == lesson.id), -1)
    data['prev_lesson_id'] = all_lessons[current_index - 1].id if current_index > 0 else None
    data['next_lesson_id'] = all_lessons[current_index + 1].id if current_index < len(all_lessons) - 1 else None

    # Include course modules for sidebar navigation
    data['course_modules'] = []
    for m in sorted(course.modules, key=lambda x: x.order):
        module_data = {
            'id': m.id,
            'title': m.title,
            'order': m.order,
            'lessons': []
        }
        for l in sorted(m.lessons, key=lambda x: x.order):
            lp = LessonProgress.query.filter_by(user_id=g.current_user.id, lesson_id=l.id).first()
            module_data['lessons'].append({
                'id': l.id,
                'title': l.title,
                'order': l.order,
                'is_completed': lp.completed if lp else False,
                'is_current': l.id == lesson.id
            })
        data['course_modules'].append(module_data)

    return success_response(data)

@lessons_bp.route('/<int:id>/complete', methods=['POST'])
@token_required
def complete_lesson(id):
    lesson = Lesson.query.get(id)
    if not lesson:
        return error_response('Lesson not found', 404)

    course_id = lesson.module.course_id
    enrollment = Enrollment.query.filter_by(user_id=g.current_user.id, course_id=course_id).first()
    if (not enrollment or enrollment.status not in ['active', 'completed']) and g.current_user.role == 'trainee':
        current_app.logger.warning(
            f"[LESSON COMPLETE REJECTED] User ID: {g.current_user.id}, Lesson ID: {lesson.id}, Course ID: {course_id}"
        )
        return error_response('You must be enrolled to complete this lesson', 403)

    progress = LessonProgress.query.filter_by(user_id=g.current_user.id, lesson_id=id).first()
    if not progress:
        progress = LessonProgress(user_id=g.current_user.id, lesson_id=id)
        db.session.add(progress)

    progress.completed = True
    progress.completed_at = datetime.now(timezone.utc)

    # Record activity
    activity = Activity(
        user_id=g.current_user.id,
        type='lesson_complete',
        description=f'Completed lesson: {lesson.title}'
    )
    db.session.add(activity)

    # Check if course is now fully complete
    course = lesson.module.course
    total_lessons = sum(len(m.lessons) for m in course.modules)
    completed_count = LessonProgress.query.join(Lesson).filter(
        LessonProgress.user_id == g.current_user.id,
        LessonProgress.completed == True,
        Lesson.module_id.in_([m.id for m in course.modules])
    ).count() + 1  # +1 for this lesson if it wasn't already counted

    db.session.commit()

    return success_response({
        'lesson_progress': progress.to_dict(),
        'course_progress': round((completed_count / total_lessons * 100) if total_lessons > 0 else 0, 1)
    }, 'Lesson completed')
