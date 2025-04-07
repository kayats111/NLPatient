from werkzeug.security import generate_password_hash, check_password_hash
from DataManager.Extensions import db
from User import User
from Approvals import Approval

class UserService:
    def register(self, username: str, email: str, password: str, role : str) -> User:
        if User.query.filter((User.username == username) | (User.email == email)).first():
            raise Exception("Username or email already in use")

        hashed_password = generate_password_hash(password)
        user = User(username=username, email=email, password=hashed_password,role=role)
        db.session.add(user)
        db.session.commit()
        return user
    
    def isPendingApproval(self, email):
        print(email)
        approval = db.session.query(Approval).filter_by(email=email).first()
        return approval is not None

    def login(self, email: str, password: str) -> User:
        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.password, password):
            raise Exception("Invalid email or password")
        return user

    def getUserById(self, id: int) -> User:
        user = User.query.get(id)
        if not user:
            raise Exception("User not found")
        return user

    def deleteUser(self, id: int) -> None:
        user = User.query.get(id)
        if not user:
            raise Exception("User not found")
        db.session.delete(user)
        db.session.commit()

    # def getUserByEmail(self, email: str):
    #     try:
    #         # Assuming you are using SQLAlchemy to interact with your MySQL database
    #         user = User.query.filter_by(email=email).first()  # Query the database to find the user
    #         return user
    #     except Exception as e:
    #         # Log the error and raise an exception
    #         print(f"Error fetching user by email {email}: {e}")
    #         raise
