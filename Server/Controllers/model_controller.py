from flask import Blueprint, request, jsonify

model_bp = Blueprint('model', __name__)

@model_bp.route('/model/train', methods=['POST'])
def train_model():
    # Logic for triggering model training
    return jsonify({"message": "Model training started"}), 202

@model_bp.route('/model/status', methods=['GET'])
def model_status():
    # Logic for fetching model training status
    return jsonify({"message": "Model status retrieved"}), 200
