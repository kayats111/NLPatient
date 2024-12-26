import os
from typing import List

from MetaDataRepository import MetaDataRepository



TRAINED_FOLDER: str = "TrainedModels"


class Service:

    def __init__(self):
        os.makedirs(TRAINED_FOLDER, exist_ok=True)

        self.repository: MetaDataRepository = MetaDataRepository()

    def getClassifierNames(self) -> List[str]:
        return self.repository.getClassifiersNames()
    
    def isClassifierExists(self, name: str) -> bool:
        return self.getMetaData(name) is not None

    
    def getClassifierPath(self, name: str) -> str:
        if not self.isClassifierExists(name):
            raise Exception(f"the classifier {name} does not exists")

        filePath = os.path.join(TRAINED_FOLDER, name + ".py")

        return filePath
    
    def deleteClassifier(self, name: str) -> None:
        if not self.isClassifierExists(name):
            raise Exception(f"the classifier {name} does not exists")
        
        metaData: dict = self.getMetaData(name)

        filename: str = name
        filename += ".pkl" if metaData["isScikit"] else ".pth"
        
        filePath = os.path.join(TRAINED_FOLDER, filename)
        
        os.remove(filePath)
        self.repository.removeMetaData(name)
        

        
    def getMetaData(self, name: str) -> dict:
        return self.repository.getMetaData(name)









