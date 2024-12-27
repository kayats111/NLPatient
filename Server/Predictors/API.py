from typing import List, Set
from flask import Blueprint, Flask, request, jsonify, send_file
from flask_cors import CORS
from Response import Response
from Service import Service
import yaml


with open('conf.yaml') as f:
    conf = yaml.safe_load(f)

port = conf["API"]["port"]



app: Flask = Flask(__name__)
CORS(app)
bp = Blueprint('Predictors', __name__, url_prefix="/api/predictors")

service: Service = Service()




@bp.route("/")
def welcome() -> str:
    return "Welcome"


@bp.route("/names", methods=["GET"])
def getPredictorNames() -> List[str]:
    return jsonify(Response(value=service.getPredictorNames()).toDict())










def validateRequestSchema(request: dict, schema: Set[str]) -> bool:
    for field in schema:
        if field not in request:
            return False
        
    for key in request:
        if key not in schema:
            return False
        
    return True



if __name__ == "__main__":
    app.register_blueprint(bp)

    app.run(debug=True, port=port)






















