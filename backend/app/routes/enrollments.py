from flask import Blueprint, g
from app.models.enrollment import Enrollment
from app.utils.helpers import success_response
from app.utils.decorators import token_required

enrollments_bp = Blueprint('enrollments', __name__)

@enrollments_bp.route('', methods=['GET'])
@token_required
def get_my_enrollments():
    enrollments = Enrollment.query.filter_by(user_id=g.current_user.id).all()
    return success_response([e.to_dict() for e in enrollments])
