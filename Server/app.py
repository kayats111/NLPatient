from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import psycopg2
from psycopg2.extras import RealDictCursor
import smtplib
from email.mime.text import MIMEText
from datetime import datetime

app = Flask(__name__)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = 'secret_number_danidin'
jwt = JWTManager(app)

# PostgreSQL Connection
def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="user_management",
        user="postgres",
        password="dan_dan_hakatan"
    )
    return conn

# Email Configuration
SMTP_USER = "dan@notReal.com"
SMTP_PASSWORD = "dan_dan_hakatan"
SMTP_SERVER = "smtp.fake.com"
SMTP_PORT = 587

def send_email(to_email, subject, body):
    """Send email notifications."""
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

# Routes
@app.route('/signup', methods=['POST'])
def signup():
    """User registration with admin approval."""
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = generate_password_hash(data.get('password'))
    role = data.get('role')

    if not all([name, email, password, role]):
        return jsonify({"error": "Missing fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO users (name, email, password, role, status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id;
            """,
            (name, email, password, role, "pending", datetime.now())
        )
        new_id = cursor.fetchone()[0]
        conn.commit()

        # Notify admin for approval
        send_email(
            to_email="admin@example.com",
            subject="New User Approval Needed",
            body=f"A new user {name} ({email}) has registered and needs your approval."
        )
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

    return jsonify({"message": "User registered. Awaiting admin approval.", "id": new_id}), 201

@app.route('/approve_user/<int:user_id>', methods=['POST'])
@jwt_required()
def approve_user(user_id):
    """Admin approval for user sign-ups."""
    user = get_jwt_identity()
    if user['role'] != 'Admin':
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()
    status = data.get('status')
    if status not in ['approved', 'disapproved']:
        return jsonify({"error": "Invalid status"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT email FROM users WHERE id = %s;", (user_id,))
        user_email = cursor.fetchone()
        if not user_email:
            return jsonify({"error": "User not found"}), 404

        cursor.execute(
            "UPDATE users SET status = %s, updated_at = %s WHERE id = %s;",
            (status, datetime.now(), user_id)
        )
        conn.commit()

        # Notify user about approval status
        send_email(
            to_email=user_email[0],
            subject="Account Approval Status",
            body=f"Your account has been {status} by the admin."
        )
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

    return jsonify({"message": f"User {status} successfully."}), 200

@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout endpoint."""
    return jsonify({"message": "Logout successful."}), 200

# Keep other endpoints (e.g., /login, /users) as they are

if __name__ == "__main__":
    app.run(debug=True)

