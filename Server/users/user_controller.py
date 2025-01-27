
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from werkzeug.security import generate_password_hash, check_password_hash

class UserController:
    def __init__(self):
        self.users_db = {}
        self.admins = ["admin@example.com"]
        self.pending_approvals = {}
        self.smtp_config = {
            "server": "smtp.example.com",
            "port": 587,
            "username": "your_email@example.com",
            "password": "your_password"
        }
    
    def send_email(self, subject, recipient, body):
        msg = MIMEMultipart()
        msg["From"] = self.smtp_config["username"]
        msg["To"] = recipient
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        try:
            with smtplib.SMTP(self.smtp_config["server"], self.smtp_config["port"]) as server:
                server.starttls()
                server.login(self.smtp_config["username"], self.smtp_config["password"])
                server.sendmail(self.smtp_config["username"], recipient, msg.as_string())
        except Exception as e:
            print(f"Error sending email to {recipient}: {e}")

    def sign_up(self, email, password, role):
        if email in self.users_db:
            return {"message": "User already exists."}, 400

        hashed_password = generate_password_hash(password)
        self.pending_approvals[email] = {"password": hashed_password, "role": role}

        for admin in self.admins:
            self.send_email(
                "New User Approval Needed",
                admin,
                f"A new user has signed up:\nEmail: {email}\nRole: {role}\nPlease approve or reject the request.",
            )
        return {"message": "Sign-up request submitted. Awaiting admin approval."}, 200

    def approve_user(self, email, approve):
        if email not in self.pending_approvals:
            return {"message": "No such user pending approval."}, 404

        user_data = self.pending_approvals.pop(email)
        if approve:
            self.users_db[email] = user_data
            self.send_email(
                "Approval Notification",
                email,
                "Your account has been approved. You can now log in.",
            )
            return {"message": f"User {email} approved."}, 200
        else:
            self.send_email(
                "Approval Notification",
                email,
                "Your account has been rejected. Contact admin for details.",
            )
            return {"message": f"User {email} rejected."}, 200

    def login(self, email, password):
        user = self.users_db.get(email)
        if not user or not check_password_hash(user["password"], password):
            return {"message": "Invalid credentials."}, 401
        return {"message": f"Welcome, {email}."}, 200

    def logout(self):
        return {"message": "User logged out successfully."}, 200

class API(UserController):
    def __init__(self):
        super().__init__()

    def handle_request(self, action, data):
        if action == "sign_up":
            return self.sign_up(data.get("email"), data.get("password"), data.get("role"))
        elif action == "approve_user":
            return self.approve_user(data.get("email"), data.get("approve"))
        elif action == "login":
            return self.login(data.get("email"), data.get("password"))
        elif action == "logout":
            return self.logout()
        else:
            return {"message": "Invalid action."}, 400
