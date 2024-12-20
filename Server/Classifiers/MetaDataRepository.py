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

    def getMetaData(self, classifierName: str):
        return self.metaCollection.find_one({"model name" : classifierName})
    
    def getClassifiersNames(self) -> List[str]:
        clsDicts = self.metaCollection.find({}, {"_id": 0, "model name": 1})

        return [cls["model name"] for cls in clsDicts]






