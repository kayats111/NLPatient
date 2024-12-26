from typing import List, Optional
from pymongo import MongoClient
import yaml

with open('conf.yaml') as f:
    conf = yaml.safe_load(f)

url: str = conf["DB"]["url"]


class MetaDataRepository:

    def __init__(self):
        client = MongoClient(url)
        db = client.NLPatient

        self.metaCollection = db.MetaData

    def getMetaData(self, predictorName: str) -> dict:
        return self.metaCollection.find_one({"model name" : predictorName})
    
    def getPredictorNames(self) -> List[str]:
        predDicts = self.metaCollection.find({}, {"_id": 0, "model name": 1})

        return [pred["model name"] for pred in predDicts]
    
    def removeMetaData(self, predictorName: str) -> None:
        self.metaCollection.delete_one({"model name": predictorName})






