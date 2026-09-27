from flask import Blueprint, request
from app.models.module import Module
from app.models.course import Course
from app.utils.helpers import success_response, error_response

modules_bp = Blueprint('modules', __name__)

@modules_bp.route('/courses/<int:course_id>/modules', methods=['GET'])
def get_modules(course_id):
    course = Course.query.get(course_id)
    if not course or not course.is_published:
        return error_response('Course not found', 404)
        
    modules = Module.query.filter_by(course_id=course_id).order_by(Module.order).all()
    return success_response([m.to_dict() for m in modules])
