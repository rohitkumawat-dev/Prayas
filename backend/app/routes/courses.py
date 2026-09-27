from flask import Blueprint, request, g
from app import db
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.activity import Activity
from app.utils.helpers import success_response, error_response
from app.utils.decorators import token_required, role_required
from sqlalchemy import or_

courses_bp = Blueprint('courses', __name__)

@courses_bp.route('', methods=['GET'])
def get_courses():
    query = Course.query.filter_by(is_published=True)

    search = request.args.get('search')
    category = request.args.get('category')
    difficulty = request.args.get('difficulty')
    trainer_id = request.args.get('trainer_id')

    if search:
        query = query.filter(or_(Course.title.ilike(f'%{search}%'), Course.description.ilike(f'%{search}%')))
    if category:
        query = query.filter_by(category=category)
    if difficulty:
        query = query.filter_by(difficulty=difficulty)
    if trainer_id:
        query = query.filter_by(trainer_id=trainer_id)

    courses = query.order_by(Course.created_at.desc()).all()
    result = []
    for c in courses:
        data = c.to_dict()
        data['enrollment_count'] = Enrollment.query.filter_by(course_id=c.id).count()
        data['module_count'] = len(c.modules)
        data['lesson_count'] = sum(len(m.lessons) for m in c.modules)
        data['quiz_count'] = len(c.quizzes)
        result.append(data)
    return success_response(result)

@courses_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = db.session.query(Course.category).filter(
        Course.is_published == True,
        Course.category != None
    ).distinct().all()
    return success_response([c[0] for c in categories if c[0]])

@courses_bp.route('/<int:id>', methods=['GET'])
def get_course(id):
    course = Course.query.get(id)
    if not course or not course.is_published:
        return error_response('Course not found', 404)

    data = course.to_dict()
    data['modules'] = [m.to_dict() for m in sorted(course.modules, key=lambda m: m.order)]
    data['enrollment_count'] = Enrollment.query.filter_by(course_id=course.id).count()
    data['quiz_count'] = len(course.quizzes)
    data['quizzes'] = [q.to_dict() for q in course.quizzes]

    # Check if current user is enrolled (if authenticated)
    token = request.headers.get('Authorization')
    if token:
        try:
            import jwt
            from flask import current_app
            token_str = token.split(' ')[1] if token.startswith('Bearer ') else token
            payload = jwt.decode(token_str, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = payload.get('sub')
            enrollment = Enrollment.query.filter_by(user_id=user_id, course_id=id).first()
            data['is_enrolled'] = enrollment is not None
            data['enrollment_status'] = enrollment.status if enrollment else None
        except Exception:
            data['is_enrolled'] = False
            data['enrollment_status'] = None
    else:
        data['is_enrolled'] = False
        data['enrollment_status'] = None

    return success_response(data)

@courses_bp.route('/<int:id>/enroll', methods=['POST'])
@token_required
@role_required(['trainee'])
def enroll_course(id):
    course = Course.query.get(id)
    if not course or not course.is_published:
        return error_response('Course not found', 404)

    existing = Enrollment.query.filter_by(user_id=g.current_user.id, course_id=id).first()
    if existing:
        return error_response('Already enrolled in this course', 409)

    enrollment = Enrollment(user_id=g.current_user.id, course_id=id)
    db.session.add(enrollment)

    activity = Activity(
        user_id=g.current_user.id,
        type='enrollment',
        description=f'Enrolled in {course.title}'
    )
    db.session.add(activity)
    db.session.commit()

    return success_response(enrollment.to_dict(), 'Successfully enrolled', 201)
