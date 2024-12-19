from typing import Set
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
bp = Blueprint('ModelTrainer', __name__, url_prefix="/api/model_trainer")

service: Service = Service()



@bp.route("/")
def welcome() -> str:
    return "Welcome"


@bp.route("/add_model", methods=["POST"])
def addModel():

    print(request.files.keys())

    if "model file" not in request.files:
        return jsonify(Response(error=True, message="no model file").toDict()), 400

    file = request.files["model file"]
    
    response: Response[bool]

    try:
        service.addModel(file)
        response = Response(value=True)
    except Exception as e:
        response = Response(error=True, message=str(e))
        app.log_exception(e)

    return jsonify(response.toDict())


@bp.route("/get_model", methods=["GET"])
def getModel():
    data: dict = request.get_json()

    schema: Set[str] = {"model name"}

    if not validateRequestSchema(data, schema):
        return Response(error=True, message="bad request body"), 400
    
    response: Response

    try:
        # f = service.getModelFile(data["model name"])
        # return f
        path = service.getModelPath(data["model name"])
        return send_file(path, as_attachment=True)
    except Exception as e:
        response = Response(error=True, message=str(e))
        app.log_exception(e)
        return jsonify(response.toDict())






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






