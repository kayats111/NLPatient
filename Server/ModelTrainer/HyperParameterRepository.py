from typing import List
from pymongo import MongoClient
import os



env_vars: dict = os.environ

url: str = env_vars["mongo_url"]



class HyperParametersRepository:

    def __init__(self):
        client = MongoClient(url)
        db = client.NLPatient

        self.hyper_collection = db.HyperParameters

    def add_hyper_parameters(self, model_name: str, parameters: List[str], model_type: str) -> None:
        _filter: dict = {"model_name": model_name}

        if self.hyper_collection.find_one(filter=_filter) is not None:
            raise Exception(f"a model named {model_name} already exists")

        self.hyper_collection.insert_one({
                "model_name": model_name,
                "parameters": parameters,
                "model_type": model_type
            })
        
    def read_parameters(self, model_name: str) -> dict:
        _filter: dict = {"model_name": model_name}

        hyper_record: dict = self.hyper_collection.find_one(filter=_filter)

        if hyper_record is None:
            raise Exception(f"a model named {model_name} does not exist")

        return hyper_record
    
    def delete_parameters(self, model_name: str) -> None:
        _filter: dict = {"model_name": model_name}

        if self.hyper_collection.find_one(filter=_filter) is None:
            raise Exception(f"a model named {model_name} does not exist")

        self.hyper_collection.delete_one(filter=_filter)

    def model_names_and_parameters(self) -> List[dict]:
        cursor = self.hyper_collection.find()

        models: List[dict] = [model for model in cursor]

        for model in models:
            model.pop("_id")

        return models
    
    def read_type(self, model_name: str) -> str:
        _filter: dict = {"model_name": model_name}

        hyper_record: dict = self.hyper_collection.find_one(filter=_filter)

        if hyper_record is None:
            raise Exception(f"a model named {model_name} does not exist")

        return hyper_record["model_type"]











