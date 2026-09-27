from flask import Blueprint, request, current_app, g
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta, timezone
from app import db
from app.models.user import User
from app.utils.helpers import success_response, error_response
from app.utils.decorators import token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'trainee')

    if not all([name, email, password]):
        return error_response('Missing required fields')
        
    if role not in ['trainee', 'trainer']:
        return error_response('Invalid role')

    if User.query.filter_by(email=email).first():
        return error_response('Email already registered', 409)

    hashed_password = generate_password_hash(password)
    new_user = User(name=name, email=email, password_hash=hashed_password, role=role)
    db.session.add(new_user)
    db.session.commit()

    return success_response(new_user.to_dict(), 'User registered successfully', 201)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return error_response('Missing credentials')

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return error_response('Invalid email or password', 401)
        
    if not user.is_active:
        return error_response('Account is disabled', 403)

    if user.status == 'pending':
        if user.role == 'admin':
            return error_response('Your administrator account is awaiting approval.', 403)
        return error_response('Your account is awaiting approval.', 403)

    if user.status == 'rejected':
        if user.role == 'admin':
            return error_response('Your administrator account has been rejected.', 403)
        return error_response('Your account has been rejected.', 403)

    if user.status != 'active':
        return error_response('Account is not active', 403)

    token = jwt.encode({
        'sub': user.id,
        'exp': datetime.now(timezone.utc) + timedelta(hours=24)
    }, current_app.config['SECRET_KEY'], algorithm='HS256')

    return success_response({
        'token': token,
        'user': user.to_dict()
    }, 'Login successful')

@auth_bp.route('/logout', methods=['POST'])
def logout():
    # Client-side handles token removal
    return success_response(None, 'Logged out successfully')

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_me():
    return success_response(g.current_user.to_dict())

@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    data = request.get_json() or {}
    user = g.current_user
    if 'name' in data and data['name'].strip():
        user.name = data['name'].strip()
    if 'bio' in data:
        user.bio = data['bio']
    db.session.commit()
    return success_response(user.to_dict(), 'Profile updated successfully')

