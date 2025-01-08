from flask import Blueprint, request, jsonify

data_bp = Blueprint('data', __name__)

@data_bp.route('/data', methods=['GET'])
def get_data():
    return jsonify({"message": "Fetch data"}), 200

@data_bp.route('/data', methods=['POST'])
def create_data():
    data = request.get_json()
    return jsonify({"message": "Data added", "data": data}), 201
