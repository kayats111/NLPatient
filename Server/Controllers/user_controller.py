from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
import smtplib
from email.mime.text import MIMEText

user_bp = Blueprint('user', __name__)

# In-memory user data (replace this with a database in production)
users = []

# Email Configuration
SMTP_USER = "dan@notReal.com"
SMTP_PASSWORD = "dan_dan_hakatan"
SMTP_SERVER = "smtp.fake.com"
SMTP_PORT = 587

def send_email(to_email, subject, body):
    """Send an email notification."""
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = to_email
    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, to_email, msg.as_string())
    except Exception as e:
        print(f"Failed to send email: {e}")

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

# Sign-up (register) endpoint
@user_bp.route('/signup', methods=['POST'])
def signup():
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
        "status": "pending",  # User must be approved by admin
        "created_at": "2024-12-30",
    }
    users.append(new_user)

    # Notify admin about the new user
    send_email(
        to_email="admin@example.com",
        subject="New User Registration Approval Needed",
        body=f"New user {new_user['name']} ({new_user['email']}) has registered and needs approval."
    )
    return jsonify({"message": "User registered successfully. Awaiting admin approval."}), 201

# Approve/Disapprove user endpoint (Admin only)
@user_bp.route('/approve_user/<int:user_id>', methods=['POST'])
@jwt_required()
@role_required('Admin')
def approve_user(user_id):
    data = request.get_json()
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        return jsonify({"error": "User not found"}), 404

    status = data.get('status')
    if status not in ["approved", "disapproved"]:
        return jsonify({"error": "Invalid status. Use 'approved' or 'disapproved'."}), 400

    user["status"] = status

    # Notify the user about the approval decision
    send_email(
        to_email=user["email"],
        subject="Account Approval Update",
        body=f"Your account has been {status} by the admin."
    )
    return jsonify({"message": f"User has been {status}."}), 200

# Login endpoint
@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = next((u for u in users if u["email"] == data.get('email')), None)
    if not user or not check_password_hash(user["password"], data.get('password')):
        return jsonify({"error": "Invalid email or password"}), 401

    if user["status"] != "approved":
        return jsonify({"error": "Account not approved by admin yet."}), 403

    access_token = create_access_token(identity={"id": user["id"], "role": user["role"]})
    return jsonify({"access_token": access_token}), 200

# Logout endpoint (Optional, token blacklisting would be required for full implementation)
@user_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({"message": "Logout successful."}), 200
