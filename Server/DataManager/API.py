from flask import Blueprint, Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy



bp = Blueprint('DataManager', __name__, url_prefix="/api/data")

app: Flask = Flask(__name__)
app.debug = True
app.config["SQLALCHEMY_DATABASE_URI"] = "url"  # TODO: get from yaml
db = SQLAlchemy(app)

CORS(app)