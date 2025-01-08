from flask import Flask
from flask_jwt_extended import JWTManager
from Controllers.user_controller import user_bp

app = Flask(__name__)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = 'your-secret-key'
jwt = JWTManager(app)

# Register Blueprints
app.register_blueprint(user_bp, url_prefix='/api')

if __name__ == "__main__":
    app.run(debug=True)
