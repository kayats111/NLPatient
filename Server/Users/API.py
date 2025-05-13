from flask import Blueprint, Flask, request, jsonify, session
from flask_cors import CORS
import sys
sys.path.append('../')
from DataManager.Extensions import db
from UserService import UserService
from User import User
from Response import Response
from typing import Set
import os
from Approvals import Approval


# Load env vars for port (optional)
env_vars: dict = os.environ
user = env_vars["mysql_user"]
password = env_vars["mysql_password"]
host = env_vars["mysql_host"]
db_name = env_vars["mysql_dbname"]
port = int(env_vars["api_port"]) if "api_port" in env_vars else 5000

app: Flask = Flask(__name__)
CORS(app, expose_headers=["Content-Disposition"])

app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{user}:{password}@{host}/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Create user blueprint
bp_user = Blueprint('Users', __name__, url_prefix="/api/user")
user_service = UserService()

# Define the routes on the blueprint **before** registering it
@bp_user.route("/register", methods=["POST"])
def registerUser():
    data = request.get_json()
    schema: Set[str] = {"username", "email", "password", "role"}
    if not validateRequestSchema(data, schema):
        return jsonify(Response(error=True, message="bad request body").toDict()), 400

    try:
        # Save to the actual Users table
        # user = user_service.register(data["username"], data["email"], data["password"], data["role"])
        
        # Save to the Approvals table
        approval = Approval(
            username=data["username"],
            email=data["email"],
            password=data["password"],  # If hashed before, pass the hashed one
            role=data["role"]
        )
        db.session.add(approval)
        db.session.commit()
        return jsonify(Response(value=approval.toDict(),error=False).toDict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify(Response(error=True, message=str(e)).toDict()), 400

@bp_user.route("/check_approval", methods=["POST"])
def check_approval():
    data = request.get_json()
    email = data["email"]
    if not email:
        return jsonify(Response(error=True, message="Email required").toDict()), 400

    try:
        # assuming user_service has a method to check approval by email
        is_pending = user_service.isPendingApproval(email)
        print("PENDING",is_pending)
        return jsonify(Response(value={"pending": is_pending}).toDict()), 200
    except Exception as e:
        return jsonify(Response(error=True, message=str(e)).toDict()), 500
    
@bp_user.route("/approvals", methods=["GET"])
def getAllApprovals():
    try:
        approvals = Approval.query.all()
        approval_dicts = [a.toDict() for a in approvals]
        return jsonify(Response(value=approval_dicts).toDict()), 200
    except Exception as e:
        return jsonify(Response(error=True, message=str(e)).toDict()), 500
    
@bp_user.route("/approve/<int:id>", methods=["POST"])
def approveUser(id: int):
    data = request.get_json()
    decision = data["decision"]

    try:
        approval = Approval.query.get(id)
        if not approval:
            raise Exception("Approval not found")
        # Either way, delete the approval record
        db.session.delete(approval)
        db.session.commit()
        if decision == "approve":
            # Create user from approval info
            user_service.register(
                approval.username, approval.email,
                approval.password, approval.role
            )
        return jsonify(Response(value={"status": f"{decision}d"}).toDict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify(Response(error=True, message=str(e)).toDict()), 400

@bp_user.route("/login", methods=["POST"])
def loginUser():
    data = request.get_json()
    # print(data)
    schema: Set[str] = {"email", "password"}

    if not validateRequestSchema(data, schema):
        return jsonify(Response(error=True, message="bad request body").toDict()), 400

    try:
        user = user_service.login(data["email"], data["password"])
        return jsonify(Response(value=user.toDict()).toDict()), 200
    except Exception as e:
        return jsonify(Response(error=True, message=str(e)).toDict()), 401


@bp_user.route("/is_logged_in", methods=["GET"])
def is_logged_in():
    print(session)
    if "user_id" in session:
        return jsonify(Response(value={"logged_in": True, "user_id": session["user_id"], "username": session["username"]}).toDict()), 200
    else:
        return jsonify(Response(value={"logged_in": False}).toDict()), 200


@bp_user.route("/logout", methods=["POST"])
def logoutUser():
    return jsonify(Response(value={"logged_out": True}).toDict()), 200


@bp_user.route("/<int:id>", methods=["GET"])
def getUser(id: int):
    try:
        user = user_service.getUserById(id)
        return jsonify(Response(value=user.toDict()).toDict()), 200
    except Exception as e:
        return jsonify(Response(error=True, message=str(e)).toDict()), 404


@bp_user.route("/<int:id>", methods=["DELETE"])
def deleteUser(id: int):
    try:
        user_service.deleteUser(id)
        return jsonify(Response().toDict()), 200
    except Exception as e:
        return jsonify(Response(error=True, message=str(e)).toDict()), 404

# ------------------------ Helper ------------------------

def validateRequestSchema(request: dict, schema: Set[str]) -> bool:
    for field in schema:
        if field not in request:
            return False
    for key in request:
        if key not in schema:
            return False
    return True

# Register the blueprint after routes are defined
app.register_blueprint(bp_user)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(host='0.0.0.0', debug=True, port=port)
