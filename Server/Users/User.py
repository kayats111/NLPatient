from Server.DataManager.Extensions import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(255),nullable=False)

    def toDict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role" : self.role
        }
