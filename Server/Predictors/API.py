from typing import List, Set
from flask import Blueprint, Flask, request, jsonify, send_file
from flask_cors import CORS
from Response import Response
from Service import Service
import os


env_vars: dict = os.environ

port = int(env_vars["api_port"])



app: Flask = Flask(__name__)
CORS(app,expose_headers=["Content-Disposition"])
bp = Blueprint('Predictors', __name__, url_prefix="/api/predictors")

service: Service = Service()




@bp.route("/")
def welcome() -> str:
    return "Welcome"


@bp.route("/names", methods=["GET"])
def getPredictorNames() -> List[str]:
    return jsonify(Response(value=service.getPredictorNames()).toDict())


@bp.route("/get_predictor", methods=["POST"])
def getPredictor():

    data: dict = request.get_json()

    # data: dict = {"model name" : request.args.get("model name")}
    schema: Set[str] = {"model name"}

    if not validateRequestSchema(data, schema):
        return jsonify(Response(error=True, message="bad request body").toDict()), 400
    
    response: Response
    try:
        path = service.getPredictorPath(data["model name"])
        return send_file(path,download_name=path.split("\\")[-1], as_attachment=True)
    except Exception as e:
        response = Response(error=True, message=str(e))
        app.log_exception(e)
        return jsonify(response.toDict())
    

@bp.route("/delete", methods=["DELETE"])
def deletePredictor():
    data: dict = request.get_json()

    # data: dict = {"model name" : request.args.get("model name")}
    schema: Set[str] = {"model name"}

    if not validateRequestSchema(data, schema):
        return jsonify((Response(error=True, message="bad request body")).toDict()), 400
    
    response: Response[bool]

    try:
        service.deletePredictor(name=data["model name"])
        response = Response(value=True)
    except Exception as e:
        response = Response(error=True, message=str(e))
        app.log_exception(e)

    return jsonify(response.toDict())



@bp.route("/meta_data", methods=["POST"])
def getMetaData():

    data: dict = request.get_json()
    
    # data: dict = {"model name" : request.args.get("model name")}
    schema: Set[str] = {"model name"}

    if not validateRequestSchema(data, schema):
        return jsonify((Response(error=True, message="bad request body")).toDict()), 400
    
    
    response: Response[dict]

    metaData: dict = service.getMetaData(name=data["model name"])

    if metaData is None:
        response = Response(error=True, message=f"the predictor {data['model name']} does not exists")
    else:
        response = Response(value=metaData)

    return jsonify(response.toDict())


@bp.route("/predict", methods=["POST"])
def predict():
    data: dict = request.get_json()
    schema: Set[str] = {"model name", "sample"}

    if not validateRequestSchema(data, schema):
        return jsonify(Response(error=True, message="bad request body").toDict()), 400
    
    response: Response[List[float]]

    try:
        prediction: List[float] = service.predict(predictorName=data["model name"], sample=data["sample"])
        response = Response(value=prediction)
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

    app.run(host='0.0.0.0', debug=True, port=port)






















