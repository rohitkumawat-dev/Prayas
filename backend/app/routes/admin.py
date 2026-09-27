from flask import Blueprint, request, g, current_app
import json
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash
from app import db
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.lesson_progress import LessonProgress
from app.models.lesson import Lesson
from app.models.quiz_attempt import QuizAttempt
from app.models.quiz import Quiz
from app.models.certificate import Certificate
from app.models.activity import Activity
from app.utils.helpers import success_response, error_response
from app.utils.decorators import token_required, role_required, super_admin_required
from sqlalchemy import or_, func

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@token_required
@role_required(['admin'])
def dashboard():
    total_users = User.query.count()
    total_trainees = User.query.filter_by(role='trainee').count()
    total_trainers = User.query.filter_by(role='trainer').count()
    total_courses = Course.query.count()
    published_courses = Course.query.filter_by(is_published=True).count()
    total_enrollments = Enrollment.query.count()
    total_completions = Enrollment.query.filter_by(status='completed').count()
    total_certificates = Certificate.query.count()
    active_users = User.query.filter_by(is_active=True).count()
    pending_admin_requests = User.query.filter_by(role='admin', status='pending').count()

    recent_activities = Activity.query.order_by(Activity.created_at.desc()).limit(10).all()

    return success_response({
        'total_users': total_users,
        'total_trainees': total_trainees,
        'total_trainers': total_trainers,
        'total_courses': total_courses,
        'published_courses': published_courses,
        'total_enrollments': total_enrollments,
        'total_completions': total_completions,
        'total_certificates': total_certificates,
        'active_users': active_users,
        'pending_admin_requests': pending_admin_requests,
        'recent_activities': [a.to_dict() for a in recent_activities],
    })

@admin_bp.route('/users', methods=['GET'])
@token_required
@role_required(['admin'])
def get_users():
    query = User.query
    search = request.args.get('search')
    role = request.args.get('role')
    status = request.args.get('status')

    if search:
        query = query.filter(or_(User.name.ilike(f'%{search}%'), User.email.ilike(f'%{search}%')))
    if role:
        query = query.filter_by(role=role)
    if status:
        query = query.filter_by(status=status)

    users = query.order_by(User.created_at.desc()).all()
    return success_response([u.to_dict() for u in users])

@admin_bp.route('/users', methods=['POST'])
@token_required
@role_required(['admin'])
def create_user():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    role = data.get('role') or 'trainee'

    if not name or not email or not password:
        return error_response('Name, email, and password are required', 400)

    if '@' not in email or '.' not in email.split('@')[-1]:
        return error_response('Invalid email format', 400)

    if len(password) < 6:
        return error_response('Password must be at least 6 characters', 400)

    if role not in ['trainee', 'trainer', 'admin']:
        return error_response('Invalid role specified', 400)

    if User.query.filter_by(email=email).first():
        return error_response('Email already registered', 409)

    # Admin creation rules: Admin defaults to pending approval
    if role == 'admin':
        status = 'pending'
        is_super_admin = False
    else:
        status = 'active'
        is_super_admin = False

    hashed_password = generate_password_hash(password)
    new_user = User(
        name=name,
        email=email,
        password_hash=hashed_password,
        role=role,
        status=status,
        is_super_admin=is_super_admin,
        is_active=True
    )
    db.session.add(new_user)
    db.session.commit()

    # Log audit activity
    activity = Activity(
        user_id=g.current_user.id,
        type='user_created',
        description=f"User {new_user.name} ({new_user.email}) with role '{role}' and status '{status}' was created by {g.current_user.name}.",
        metadata_json=json.dumps({"created_user_id": new_user.id, "role": role, "status": status})
    )
    db.session.add(activity)
    db.session.commit()

    current_app.logger.info(
        f"[ADMIN USER CREATED] Operator: {g.current_user.email} (SuperAdmin: {getattr(g.current_user, 'is_super_admin', False)}), "
        f"New User ID: {new_user.id}, Email: {new_user.email}, Role: {role}, Status: {status}, SuperAdmin: {is_super_admin}"
    )

    return success_response(new_user.to_dict(), 'User created successfully', 201)

@admin_bp.route('/approval-requests', methods=['GET'])
@token_required
@role_required(['admin'])
@super_admin_required
def get_approval_requests():
    requests = User.query.filter_by(role='admin', status='pending').order_by(User.created_at.desc()).all()
    current_app.logger.info(
        f"[ADMIN APPROVAL QUERY] Requester: {g.current_user.email} (SuperAdmin: {getattr(g.current_user, 'is_super_admin', False)}), "
        f"Pending requests returned: {len(requests)}"
    )
    return success_response([u.to_dict() for u in requests])

@admin_bp.route('/users/<int:id>/approve', methods=['POST'])
@token_required
@role_required(['admin'])
@super_admin_required
def approve_admin(id):
    user = User.query.get(id)
    if not user:
        return error_response('User not found', 404)

    if user.role != 'admin':
        return error_response('Target user is not an administrator', 400)

    # Verify user is still pending immediately before committing
    if user.status != 'pending':
        return error_response(f"Cannot approve account with status '{user.status}'", 409)

    user.status = 'active'
    user.approved_by = g.current_user.id
    user.approved_at = datetime.now(timezone.utc)

    activity = Activity(
        user_id=g.current_user.id,
        type='admin_approval',
        description=f"Administrator account for {user.name} ({user.email}) was approved by {g.current_user.name}.",
        metadata_json=json.dumps({
            "target_user_id": user.id,
            "approved_by": g.current_user.id,
            "approved_by_name": g.current_user.name
        })
    )
    db.session.add(activity)
    db.session.commit()

    current_app.logger.info(
        f"[ADMIN APPROVAL COMPLETED] Target ID: {user.id} ({user.email}) APPROVED by SuperAdmin: {g.current_user.email} (ID: {g.current_user.id})"
    )

    return success_response(user.to_dict(), 'Administrator account approved successfully')

@admin_bp.route('/users/<int:id>/reject', methods=['POST'])
@token_required
@role_required(['admin'])
@super_admin_required
def reject_admin(id):
    user = User.query.get(id)
    if not user:
        return error_response('User not found', 404)

    if user.role != 'admin':
        return error_response('Target user is not an administrator', 400)

    # Verify user is still pending immediately before committing
    if user.status != 'pending':
        return error_response(f"Cannot reject account with status '{user.status}'", 409)

    user.status = 'rejected'
    user.rejected_by = g.current_user.id
    user.rejected_at = datetime.now(timezone.utc)

    activity = Activity(
        user_id=g.current_user.id,
        type='admin_rejection',
        description=f"Administrator account for {user.name} ({user.email}) was rejected by {g.current_user.name}.",
        metadata_json=json.dumps({
            "target_user_id": user.id,
            "rejected_by": g.current_user.id,
            "rejected_by_name": g.current_user.name
        })
    )
    db.session.add(activity)
    db.session.commit()

    current_app.logger.info(
        f"[ADMIN REJECTION COMPLETED] Target ID: {user.id} ({user.email}) REJECTED by SuperAdmin: {g.current_user.email} (ID: {g.current_user.id})"
    )

    return success_response(user.to_dict(), 'Administrator account rejected successfully')

@admin_bp.route('/users/<int:id>', methods=['GET'])
@token_required
@role_required(['admin'])
def get_user(id):
    user = User.query.get(id)
    if not user:
        return error_response('User not found', 404)

    data = user.to_dict()
    if user.role == 'trainee':
        data['enrollments_count'] = Enrollment.query.filter_by(user_id=user.id).count()
        data['certificates_count'] = Certificate.query.filter_by(user_id=user.id).count()
        data['completed_courses'] = Enrollment.query.filter_by(user_id=user.id, status='completed').count()
    elif user.role == 'trainer':
        data['courses_count'] = Course.query.filter_by(trainer_id=user.id).count()
        courses = Course.query.filter_by(trainer_id=user.id).all()
        course_ids = [c.id for c in courses]
        data['total_students'] = Enrollment.query.filter(Enrollment.course_id.in_(course_ids)).count() if course_ids else 0
    return success_response(data)

@admin_bp.route('/users/<int:id>', methods=['PUT'])
@token_required
@role_required(['admin'])
def update_user(id):
    user = User.query.get(id)
    if not user:
        return error_response('User not found', 404)

    data = request.get_json()
    if 'role' in data and data['role'] in ['trainee', 'trainer', 'admin']:
        user.role = data['role']
    if 'is_active' in data:
        user.is_active = bool(data['is_active'])
    if 'name' in data:
        user.name = data['name']

    db.session.commit()
    return success_response(user.to_dict(), 'User updated')

@admin_bp.route('/users/<int:id>', methods=['DELETE'])
@token_required
@role_required(['admin'])
def delete_user(id):
    user = User.query.get(id)
    if not user:
        return error_response('User not found', 404)
    if user.role == 'admin':
        admin_count = User.query.filter_by(role='admin').count()
        if admin_count <= 1:
            return error_response('Cannot delete the last admin', 400)
    db.session.delete(user)
    db.session.commit()
    return success_response(None, 'User deleted')

@admin_bp.route('/trainees', methods=['GET'])
@token_required
@role_required(['admin'])
def get_trainees():
    trainees = User.query.filter_by(role='trainee').all()
    result = []
    for u in trainees:
        data = u.to_dict()
        data['enrollments_count'] = Enrollment.query.filter_by(user_id=u.id).count()
        data['completed_courses'] = Enrollment.query.filter_by(user_id=u.id, status='completed').count()
        data['certificates_count'] = Certificate.query.filter_by(user_id=u.id).count()

        enrollments = Enrollment.query.filter_by(user_id=u.id).all()
        if enrollments:
            total_progress = 0
            for e in enrollments:
                course = Course.query.get(e.course_id)
                if course:
                    total_lessons = sum(len(m.lessons) for m in course.modules)
                    completed = LessonProgress.query.join(Lesson).filter(
                        LessonProgress.user_id == u.id,
                        LessonProgress.completed == True,
                        Lesson.module_id.in_([m.id for m in course.modules])
                    ).count()
                    total_progress += (completed / total_lessons * 100) if total_lessons > 0 else 0
            data['avg_progress'] = round(total_progress / len(enrollments), 1)
        else:
            data['avg_progress'] = 0
        result.append(data)
    return success_response(result)

@admin_bp.route('/trainers', methods=['GET'])
@token_required
@role_required(['admin'])
def get_trainers():
    trainers = User.query.filter_by(role='trainer').all()
    result = []
    for u in trainers:
        data = u.to_dict()
        courses = Course.query.filter_by(trainer_id=u.id).all()
        data['courses_count'] = len(courses)
        course_ids = [c.id for c in courses]
        data['total_students'] = Enrollment.query.filter(Enrollment.course_id.in_(course_ids)).count() if course_ids else 0
        data['published_courses'] = sum(1 for c in courses if c.is_published)
        result.append(data)
    return success_response(result)

@admin_bp.route('/courses', methods=['GET'])
@token_required
@role_required(['admin'])
def get_all_courses():
    search = request.args.get('search')
    query = Course.query
    if search:
        query = query.filter(Course.title.ilike(f'%{search}%'))
    courses = query.order_by(Course.created_at.desc()).all()
    result = []
    for c in courses:
        data = c.to_dict()
        data['enrollment_count'] = Enrollment.query.filter_by(course_id=c.id).count()
        data['completion_count'] = Enrollment.query.filter_by(course_id=c.id, status='completed').count()
        result.append(data)
    return success_response(result)

@admin_bp.route('/courses/<int:id>', methods=['PUT'])
@token_required
@role_required(['admin'])
def moderate_course(id):
    course = Course.query.get(id)
    if not course:
        return error_response('Course not found', 404)
    data = request.get_json()
    if 'is_published' in data:
        course.is_published = data['is_published']
    db.session.commit()
    return success_response(course.to_dict(), 'Course updated')

@admin_bp.route('/analytics', methods=['GET'])
@token_required
@role_required(['admin'])
def get_analytics():
    # Category distribution
    categories = db.session.query(
        Course.category, func.count(Course.id)
    ).group_by(Course.category).all()
    category_data = [{'category': c[0] or 'Uncategorized', 'count': c[1]} for c in categories]

    # Difficulty distribution
    difficulties = db.session.query(
        Course.difficulty, func.count(Course.id)
    ).group_by(Course.difficulty).all()
    difficulty_data = [{'difficulty': d[0] or 'Unknown', 'count': d[1]} for d in difficulties]

    # Top courses by enrollment
    top_courses = db.session.query(
        Course.title, func.count(Enrollment.id).label('enrollments')
    ).join(Enrollment, Course.id == Enrollment.course_id).group_by(
        Course.id
    ).order_by(func.count(Enrollment.id).desc()).limit(10).all()
    top_courses_data = [{'title': t[0], 'enrollments': t[1]} for t in top_courses]

    # Completion rate
    total_enrollments = Enrollment.query.count()
    completed_enrollments = Enrollment.query.filter_by(status='completed').count()
    overall_completion_rate = (completed_enrollments / total_enrollments * 100) if total_enrollments > 0 else 0

    # User role distribution
    role_counts = db.session.query(User.role, func.count(User.id)).group_by(User.role).all()
    role_data = [{'role': r[0], 'count': r[1]} for r in role_counts]

    # Recent enrollments (last 30 days worth of data for charts)
    recent_enrollments = Enrollment.query.order_by(Enrollment.enrolled_at.desc()).limit(100).all()
    enrollment_timeline = {}
    for e in recent_enrollments:
        if e.enrolled_at:
            day = e.enrolled_at.strftime('%Y-%m-%d')
            enrollment_timeline[day] = enrollment_timeline.get(day, 0) + 1
    timeline_data = [{'date': k, 'enrollments': v} for k, v in sorted(enrollment_timeline.items())]

    return success_response({
        'category_distribution': category_data,
        'difficulty_distribution': difficulty_data,
        'top_courses': top_courses_data,
        'overall_completion_rate': round(overall_completion_rate, 1),
        'role_distribution': role_data,
        'enrollment_timeline': timeline_data,
    })

from app.models.setting import PlatformSetting

@admin_bp.route('/settings', methods=['GET'])
@token_required
@role_required(['admin'])
def get_settings():
    settings = PlatformSetting.query.all()
    data = {}
    for s in settings:
        if s.value in ['true', 'false']:
            data[s.key] = (s.value == 'true')
        elif s.value.isdigit():
            data[s.key] = int(s.value)
        else:
            data[s.key] = s.value
    return success_response(data)

@admin_bp.route('/settings', methods=['PUT'])
@token_required
@role_required(['admin'])
def update_settings():
    data = request.get_json() or {}
    for k, v in data.items():
        s = PlatformSetting.query.filter_by(key=k).first()
        val_str = 'true' if v is True else ('false' if v is False else str(v))
        if s:
            s.value = val_str
        else:
            db.session.add(PlatformSetting(key=k, value=val_str))
    db.session.commit()
    return success_response(data, 'Settings updated and persisted')

