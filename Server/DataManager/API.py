from flask import Blueprint, Flask
from flask_cors import CORS
from Extensions import db
import yaml



with open('conf.yaml') as f:
    conf = yaml.safe_load(f)

user = conf["DB"]["user"]
password = conf["DB"]["password"]
host = conf["DB"]["host"]
db_name = conf["DB"]["name"]

app: Flask = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{user}:{password}@{host}/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
CORS(app)

from MedicalRecord import MedicalRecord

bp = Blueprint('DataManager', __name__, url_prefix="/api/data")





@bp.route("/")
def welcome() -> str:
    return "Welcome"



if __name__ == "__main__":
    app.register_blueprint(bp)

    with app.app_context():
        db.create_all()

    app.run(debug=True, port=3000)

    
