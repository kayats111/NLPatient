from typing import Dict, List, Set
from flask import Blueprint, Flask, request, jsonify, send_file
from flask_cors import CORS
from Response import Response
from Service import Service
import os


env_vars: dict = os.environ

port = int(env_vars["api_port"])



app: Flask = Flask(__name__)
CORS(app,expose_headers=["Content-Disposition"])
bp = Blueprint('ModelTrainer', __name__, url_prefix="/api/model_trainer")

service: Service = Service()



@bp.route("/")
def welcome() -> str:
    return "Welcome"


@bp.route("/add/model", methods=["POST"])
def addModel():
    if "model file" not in request.files:
        return jsonify(Response(error=True, message="no model file").toDict()), 400
    
    file = request.files["model file"]
    
    response: Response[bool]

    try:
        service.addModel(file=file)
        response = Response(value=True)
    except Exception as e:
        response = Response(error=True, message=str(e))
        app.log_exception(e)

    return jsonify(response.toDict())


@bp.route("/add/parameters", methods=["POST"])
def add_model_hyper_parameters():
    data: dict = request.get_json()
    schema: Set[str] = {"modelName", "hyperParameters", "modelType"}

    if not validateRequestSchema(request=data, schema=schema):
        return jsonify(Response(error=True, message="bad request body").toDict()), 400
    
    response: Response[bool]
    try:
        service.add_model_parameters(model_name=data["modelName"], hyper_parameters=data["hyperParameters"],
                                     model_type=data["modelType"])
        response = Response(value=True)
    except Exception as e:
        response = Response(error=True, message=str(e))
        app.log_exception(e)

    return jsonify(response.toDict())


@bp.route("/get_model", methods=["POST"])
def getModel():
    data: dict = request.get_json()
    
    schema: Set[str] = {"model name"}

    if not validateRequestSchema(data, schema):
        return jsonify(Response(error=True, message="bad request body").toDict()), 400
    
    response: Response

    try:
        path = service.getModelPath(data["model name"])
        return send_file(path, as_attachment=True)
    except Exception as e:
        response = Response(error=True, message=str(e))
        app.log_exception(e)
        return jsonify(response.toDict())
    

@bp.route("/get_names_parameters", methods=["GET"])
def getModelNamesAndParameters():
    names_parameters: List[dict] = service.get_names_and_parameters()
    return jsonify(Response(value=names_parameters).toDict())


@bp.route("/delete_model", methods=["DELETE"])
def deleteModelFile():
    data: dict = request.get_json()

    schema: Set[str] = {"model name"}

    if not validateRequestSchema(data, schema):
        return jsonify(Response(error=True, message="bad request body").toDict()), 400
    
    response: Response[bool]

    try:
        service.removeModelFile(data["model name"])
        response = Response(value=True)
    except Exception as e:
        response = Response(error=True, message=str(e))
        app.log_exception(e)
    
    return jsonify(response.toDict())


@bp.route("/run_model", methods=["POST"])  # Change to POST since we're sending data
def runModel():
    data: dict = request.get_json()
    schema: Set[str] = {"model name", "trainRelativeSize", "testRelativeSize", "epochs", "batchSize", "sampleLimit", "hyperParameters"}
    if "fields" in data:
        schema.add("fields")
    if "labels" in data:
        schema.add("labels")
    
    if not validateRequestSchema(request=data, schema=schema):
        return jsonify(Response(error=True, message="bad request body").toDict()), 400
    
    response: Response[dict]

    try:
        metaData: dict

        # Handle the presence of "fields" and "labels" in the data
        if "fields" in data and "labels" in data:
            metaData = service.runModel(model_name=data["model name"], fields=data["fields"], labels=data["labels"],
                                        train_relative_size=data["trainRelativeSize"], test_relative_size=data["testRelativeSize"],
                                        epochs=data["epochs"], batch_size=data["batchSize"], sample_limit=data["sampleLimit"],
                                        hyper_parameters=data["hyperParameters"])
        elif "fields" in data:
            metaData = service.runModel(model_name=data["model name"], fields=data["fields"],
                                        train_relative_size=data["trainRelativeSize"], test_relative_size=data["testRelativeSize"],
                                        epochs=data["epochs"], batch_size=data["batchSize"], sample_limit=data["sampleLimit"],
                                        hyper_parameters=data["hyperParameters"])
        elif "labels" in data:
            metaData = service.runModel(model_name=data["model name"], labels=data["labels"],
                                        train_relative_size=data["trainRelativeSize"], test_relative_size=data["testRelativeSize"],
                                        epochs=data["epochs"], batch_size=data["batchSize"], sample_limit=data["sampleLimit"],
                                        hyper_parameters=data["hyperParameters"])
        else:
            metaData = service.runModel(model_name=data["model name"],
                                        train_relative_size=data["trainRelativeSize"], test_relative_size=data["testRelativeSize"],
                                        epochs=data["epochs"], batch_size=data["batchSize"], sample_limit=data["sampleLimit"],
                                        hyper_parameters=data["hyperParameters"])
        
        # Return metadata as the response
        response = Response(value=metaData)
    except Exception as e:
        response = Response(error=True, message=str(e))
        app.log_exception(e)

    return jsonify(response.toDict())


@bp.route("/template", methods=["GET"])
def getTemplate():
    response: Response

    try:
        path = service.getTemplatePath()
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

    app.run(host='0.0.0.0', debug=True, port=port)






