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

    def addMetaData(self, data: dict) -> None:

        _filter: dict = {"model name": data["model name"]}
        
        if self.metaCollection.find_one(_filter) is None:
            self.metaCollection.insert_one(data)
        else:
            self.metaCollection.find_one_and_replace(filter=_filter, replacement=data)

            
        

