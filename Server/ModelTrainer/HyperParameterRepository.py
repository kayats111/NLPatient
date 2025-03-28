from typing import Dict, List
from pymongo import MongoClient
import yaml

from ModelType import ModelType


with open('conf.yaml') as f:
    conf = yaml.safe_load(f)

url: str = conf["DB"]["url"]



class HyperParametersRepository:

    def __init__(self):
        client = MongoClient(url)
        db = client.NLPatient

        self.hyper_collection = db.HyperParameters

    def add_hyper_parameters(self, model_name: str, parameters: List[str], model_type: ModelType) -> None:
        _filter: dict = {"model_name": model_name}

        if self.hyper_collection.find_one(filter=_filter) is not None:
            raise Exception(f"a model named {model_name} already exists")

        self.hyper_collection.insert_one({
                "model_name": model_name,
                "parameters": parameters,
                "model_type": model_type
            })
        
    def read_parameters(self, model_name: str) -> List[str]:
        _filter: dict = {"model_name": model_name}

        hyper_record: dict = self.hyper_collection.find_one(filter=_filter)

        if hyper_record is None:
            raise Exception(f"a model named {model_name} does not exist")

        return hyper_record["parameters"]
    
    def delete_parameters(self, model_name: str) -> None:
        _filter: dict = {"model_name": model_name}

        if self.hyper_collection.find_one(filter=_filter) is None:
            raise Exception(f"a model named {model_name} does not exist")

        self.hyper_collection.delete_one(filter=_filter)

    def model_names_and_parameters(self) -> List[Dict[str, List[str]]]:
        cursor = self.hyper_collection.find()

        models: List[Dict[str, List[str]]] = [model for model in cursor]

        for model in models:
            model.pop("_id")

        return models

    def read_type(self, model_name: str) -> ModelType:
        _filter: dict = {"model_name": model_name}

        hyper_record: dict = self.hyper_collection.find_one(filter=_filter)

        if hyper_record is None:
            raise Exception(f"a model named {model_name} does not exist")
        
        return hyper_record["model_tpye"]
    