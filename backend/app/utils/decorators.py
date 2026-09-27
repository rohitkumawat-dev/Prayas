from functools import wraps
from flask import request, current_app, g
import jwt
from app.models.user import User
from app.models.course import Course
from app.utils.helpers import error_response

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
        if not token:
            return error_response('Token is missing', 401)
            
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['sub'])
            if not current_user or not current_user.is_active or current_user.status != 'active':
                return error_response('Invalid, inactive, or unapproved user', 401)
            g.current_user = current_user
        except jwt.ExpiredSignatureError:
            return error_response('Token has expired', 401)
        except Exception as e:
            return error_response('Invalid token', 401)
            
        return f(*args, **kwargs)
    return decorated

def role_required(roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not getattr(g, 'current_user', None) or g.current_user.role not in roles:
                return error_response('Unauthorized access', 403)
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def super_admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not getattr(g, 'current_user', None) or not getattr(g.current_user, 'is_super_admin', False):
            return error_response('Super admin privileges required', 403)
        return f(*args, **kwargs)
    return decorated_function

def trainer_owns_course(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        course_id = kwargs.get('id') or kwargs.get('course_id')
        if not course_id:
            return error_response('Course ID missing', 400)
            
        course = Course.query.get(course_id)
        if not course:
            return error_response('Course not found', 404)
            
        if course.trainer_id != g.current_user.id:
            return error_response('You do not own this course', 403)
            
        # Store course in g to avoid querying again
        g.course = course
        return f(*args, **kwargs)
    return decorated_function
