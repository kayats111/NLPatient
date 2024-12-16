from typing import List, Set
from flask import Blueprint, Flask, request, jsonify
from flask_cors import CORS
from Extensions import db
import yaml
from Response import Response
from MedicalRecordService import MedicalRecordService



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

from MedicalRecord import MedicalRecord, ATTRIBUTES, BASE_ATTRIBUTES

bp = Blueprint('DataManager', __name__, url_prefix="/api/data")

service: MedicalRecordService = MedicalRecordService()





@bp.route("/")
def welcome() -> str:
    return "Welcome"


@bp.route("/add", methods=["POST"])
def addRecord():
    data: dict = request.get_json()

    schema: Set[str] = set(BASE_ATTRIBUTES)

    if not validateRequestSchema(data, schema):
        return Response(error=True, message="bad request body"), 400

    response: Response[bool]

    try:
        service.addRecord(data)
        response = Response()
    except Exception as err:
        response = Response(error=True, message=str(err))
        app.log_exception(err)

    return jsonify(response.toDict()), 200


@bp.route("/read/<int:id>", methods=["GET"])
def readRecord(id: int):
    response: Response[MedicalRecord]

    try:
        record: MedicalRecord = service.getRecordById(id)
        response = Response(value=record.toDict())
    except Exception as err:
        response = Response(error=True, message=str(err))

    return jsonify(response.toDict()), 200


@bp.route("/delete/<int:id>", methods=["DELETE"])
def deleteRecord(id: int):
    response: Response[MedicalRecord]

    try:
        service.deleteRecord(id)
        response = Response()
    except Exception as err:
        response = Response(error=True, message=str(err))

    return jsonify(response.toDict()), 200


@bp.route("/update", methods=["PATCH"])
def updateRecord():
    data: dict = request.get_json()

    schema: Set[str] = set(ATTRIBUTES)

    if not validateRequestSchema(data, schema):
        return Response(error=True, message="bad request body"), 400

    response: Response[bool]

    try:
        service.updateRecord(data)
        response = Response()
    except Exception as err:
        response = Response(error=True, message=str(err))
        app.log_exception(err)

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
        return Response(error=True, message="bad request body"), 400
    
    response: Response[List[dict]]

    try:
        records: List[dict] = service.getWithFields(data["fields"])
        response = Response(value=records)
    except Exception as err:
        response = Response(error=True, message=str(err))
        app.log_exception(err)

    return jsonify(response.toDict())


@bp.route("/read/vectors", methods=["GET"])
def getVectors():
    data: dict = request.get_json()

    response: Response[dict]

    try:
        vectors: List[List[int]]

        if "fields" in data:
            vectors = service.getVectors(fields=data["fields"])
        else: 
            vectors = service.getVectors()
        
        
        toReturn: dict = {
            "vectors": vectors,
            "fields": data["fields"] if "fields" in data else BASE_ATTRIBUTES
        }


        response = Response(value=toReturn)
    except Exception as err:
        response = Response(error=True, message=str(err))
        app.log_exception(err)

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

    app.run(debug=True, port=3000)

    
