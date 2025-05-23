from typing import Dict, List, Set
from flask import Blueprint, Flask, request, jsonify
from flask_cors import CORS
from Extensions import db
import os
from Response import Response
from MedicalRecordService import MedicalRecordService
from TextService import TextService



env_vars: dict = os.environ

user = env_vars["mysql_user"]
password = env_vars["mysql_password"]
host = env_vars["mysql_host"]
db_name = env_vars["mysql_dbname"]
port = int(env_vars["api_port"])

app: Flask = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{user}:{password}@{host}/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
CORS(app,expose_headers=["Content-Disposition"])

from MedicalRecord import LABELS, TRAIN_ATTRIBUTES, MedicalRecord, ATTRIBUTES, BASE_ATTRIBUTES
from MedicalRecordText import MedicalRecordText, TRAIN_ATTRIBUTES as TEXT_TRAIN, LABELS as TEXT_LABELS, ATTRIBUTES as TEXT_ATTRIBUTES, BASE_ATTRIBUTES as TEXT_BASE

bp = Blueprint('DataManager', __name__, url_prefix="/api/data")

service: MedicalRecordService = MedicalRecordService()
text_service: TextService = TextService()





@bp.route("/")
def welcome() -> str:
    return "Welcome"


@bp.route("/add", methods=["POST"])
def addRecord():
    data: dict = request.get_json()

    schema: Set[str] = set(BASE_ATTRIBUTES)

    if not validateRequestSchema(data, schema):
        return jsonify(Response(error=True, message="bad request body").toDict()), 400

    response: Response[bool]

    try:
        service.addRecord(data)
        response = Response()
    except Exception as e:
        response = Response(error=True, message=str(e))
        app.log_exception(e)
        return jsonify(response.toDict()), 400

    return jsonify(response.toDict()), 200


@bp.route("/read/<int:id>", methods=["GET"])
def readRecord(id: int):
    response: Response[MedicalRecord]

    try:
        record: MedicalRecord = service.getRecordById(id)
        response = Response(value=record.toDict())
    except Exception as e:
        response = Response(error=True, message=str(e))
        return jsonify(response.toDict()), 400

    return jsonify(response.toDict()), 200


@bp.route("/delete/<int:id>", methods=["DELETE"])
def deleteRecord(id: int):
    response: Response[MedicalRecord]

    try:
        service.deleteRecord(id)
        response = Response()
    except Exception as e:
        response = Response(error=True, message=str(e))
        return jsonify(response.toDict()), 400

    return jsonify(response.toDict()), 200


@bp.route("/update", methods=["PATCH"])
def updateRecord():
    data: dict = request.get_json()

    schema: Set[str] = set(ATTRIBUTES)

    if not validateRequestSchema(data, schema):
        return jsonify(Response(error=True, message="bad request body").toDict()), 400

    response: Response[bool]

    try:
        service.updateRecord(data)
        response = Response()
    except Exception as e:
        response = Response(error=True, message=str(e))
        app.log_exception(e)
        return jsonify(response.toDict()), 400

    return jsonify(response.toDict()), 200
    
    
@bp.route("/read/records/all", methods=["GET"])
def getAllRecords():
    dicts: List[dict] = [record.toDict() for record in service.getAllRecords()]

    return jsonify(dicts), 200


# can divide to train
@bp.route("/read/records/fields", methods=["GET"])
def getWithFields():
    data: dict = request.get_json()

    schema: Set[str] = {"fields"}

    if not validateRequestSchema(data, schema):
        return jsonify(Response(error=True, message="bad request body").toDict()), 400
    
    response: Response[List[dict]]

    try:
        records: List[dict] = service.getWithFields(data["fields"])
        response = Response(value=records)
    except Exception as e:
        response = Response(error=True, message=str(e))
        app.log_exception(e)
        return jsonify(response.toDict()), 400

    return jsonify(response.toDict())


@bp.route("/read/vectors", methods=["GET"])
def getVectors():
    data: dict = request.get_json()

    response: Response[dict]

    try:
        if "ids" not in data:
            raise Exception("request should contain 'ids' attribute")

        vectors: List[List[float]]

        if ("fields" in data) and ("labels" in data):
            vectors, labels = service.getVectors(ids=data["ids"], fields=data["fields"], labels=data["labels"])
        elif "fields" in data:
            vectors, labels = service.getVectors(ids=data["ids"], fields=data["fields"])
        elif "labels" in data:
            vectors, labels = service.getVectors(ids=data["ids"], labels=data["labels"])
        else:
            vectors, labels = service.getVectors(ids=data["ids"])
        
        
        toReturn: dict = {
            "vectors": vectors,
            "vectorLabels": labels,
            "fields": data["fields"] if "fields" in data else TRAIN_ATTRIBUTES,
            "labels": data["labels"] if "labels" in data else LABELS
        }


        response = Response(value=toReturn)
    except Exception as e:
        response = Response(error=True, message=str(e))
        app.log_exception(e)
        return jsonify(response.toDict()), 400

    return jsonify(response.toDict())


@bp.route("/fields_labels", methods=["GET"])
def getFieldsAndLabels():
    response: Response[Dict[str, List[str]]] = Response(value=service.getTrainFieldsAndLabels())

    return jsonify(response.toDict())


@bp.route("/ids", methods=["GET"])
def getAllIds():
    response: Response[List[int]] = Response(value=service.getAllIds())

    return jsonify(response.toDict())


@bp.route("/text/add", methods=["POST"])
def add_text():
    data: dict = request.get_json()

    schema: Set[str] = set(TEXT_BASE)

    if not validateRequestSchema(data, schema):
        return jsonify(Response(error=True, message="bad request body").toDict()), 400
    
    response: Response[bool]

    try:
        text_service.add_record(data)
        response = Response()
    except Exception as e:
        response = Response(error=True, message=str(e))
        app.log_exception(e)
        return jsonify(response.toDict()), 400

    return jsonify(response.toDict()), 200


@bp.route("/text/read/<int:id>", methods=["GET"])
def read_text_record(id: int):
    response: Response[MedicalRecordText]

    try:
        record: MedicalRecordText = text_service.get_record_by_id(id)
        response = Response(value=record.toDict())
    except Exception as e:
        response = Response(error=True, message=str(e))
        return jsonify(response.toDict()), 400

    return jsonify(response.toDict()), 200


@bp.route("/text/delete/<int:id>", methods=["DELETE"])
def delete_text_record(id: int):
    response: Response[MedicalRecordText]

    try:
        text_service.delete_record(id)
        response = Response()
    except Exception as e:
        response = Response(error=True, message=str(e))
        return jsonify(response.toDict()), 400

    return jsonify(response.toDict()), 200


@bp.route("/text/update", methods=["PATCH"])
def update_text_record():
    data: dict = request.get_json()

    schema: Set[str] = set(TEXT_ATTRIBUTES)

    if not validateRequestSchema(data, schema):
        return jsonify(Response(error=True, message="bad request body").toDict()), 400

    response: Response[bool]

    try:
        text_service.update_record(data)
        response = Response()
    except Exception as e:
        response = Response(error=True, message=str(e))
        app.log_exception(e)
        return jsonify(response.toDict()), 400

    return jsonify(response.toDict()), 200
 

@bp.route("/text/read/records/all", methods=["GET"])
def get_all_text_records():
    dicts: List[dict] = [record.toDict() for record in text_service.get_all_records_read()]

    return jsonify(dicts), 200


@bp.route("/text/read/train", methods=["POST"])
def get_train_text_records():
    data: dict = request.get_json()

    schema: Set[str] = {"labels"}

    if not validateRequestSchema(data, schema):
        return jsonify(Response(error=True, message="bad request body").toDict()), 400
    
    response: Response[Dict[str, list]]

    try:
        text_data: Dict[str, list] = text_service.get_all_records_train(labels=data["labels"])
        response = Response(value=text_data)
    except Exception as e:
        response = Response(error=True, message=str(e))
        app.log_exception(e)
        return jsonify(response.toDict()), 400

    return jsonify(response.toDict()), 200


@bp.route("/text/fields_labels", methods=["GET"])
def get_text_fields_and_labels():
    response: Response[Dict[str, List[str]]] = Response(value=text_service.get_train_fields_and_labels())

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

    with app.app_context():
        db.create_all()

    app.run(host='0.0.0.0', debug=True, port=port)

    
