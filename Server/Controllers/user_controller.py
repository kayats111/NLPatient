from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token

user_bp = Blueprint('user', __name__)

# In-memory user data (replace this with a database in production)
users = []

# Role-based decorator
def role_required(required_role):
    def decorator(func):
        def wrapper(*args, **kwargs):
            user = get_jwt_identity()
            if user["role"] != required_role:
                return jsonify({"error": "Access denied"}), 403
            return func(*args, **kwargs)
        return wrapper
    return decorator

# User Management Endpoints
@user_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    return jsonify(users), 200

@user_bp.route('/users', methods=['POST'])
@jwt_required()
@role_required('Admin')
def create_user():
    data = request.get_json()
    if not data.get('email') or not data.get('password') or not data.get('role'):
        return jsonify({"error": "Missing required fields"}), 400

    if any(u["email"] == data['email'] for u in users):
        return jsonify({"error": "User with this email already exists"}), 400

    hashed_password = generate_password_hash(data['password'])
    new_user = {
        "id": len(users) + 1,
        "name": data.get('name', ''),
        "email": data['email'],
        "password": hashed_password,
        "role": data['role'],
        "created_at": "2024-12-30",
    }
    users.append(new_user)
    return jsonify(new_user), 201

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@role_required('Admin')
def update_user(user_id):
    data = request.get_json()
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.update({
        "name": data.get('name', user["name"]),
        "role": data.get('role', user["role"]),
        "updated_at": "2024-12-30",
    })
    return jsonify(user), 200

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@role_required('Admin')
def delete_user(user_id):
    global users
    users = [u for u in users if u["id"] != user_id]
    return jsonify({"message": "User deleted"}), 200

# Authentication Endpoints
@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = next((u for u in users if u["email"] == data.get('email')), None)
    if not user or not check_password_hash(user["password"], data.get('password')):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity={"id": user["id"], "role": user["role"]})
    return jsonify({"access_token": access_token}), 200
