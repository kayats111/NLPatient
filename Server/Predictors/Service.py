import os
from typing import List
import pickle
from MetaDataRepository import MetaDataRepository



TRAINED_FOLDER: str = "TrainedModels"


class Service:

    def __init__(self):
        os.makedirs(TRAINED_FOLDER, exist_ok=True)

        self.repository: MetaDataRepository = MetaDataRepository()

    def getPredictorNames(self) -> List[str]:
        return self.repository.getPredictorNames()
    
    def isPredictorExists(self, name: str) -> bool:
        return self.getMetaData(name) is not None
   
    def getPredictorPath(self, name: str) -> str:
        if not self.isPredictorExists(name):
            raise Exception(f"the predictor {name} does not exists")

        filePath = os.path.join(TRAINED_FOLDER, name + ".py")

        return filePath
    
    def deletePredictor(self, name: str) -> None:
        if not self.isPredictorExists(name):
            raise Exception(f"the predictor {name} does not exists")
        
        metaData: dict = self.getMetaData(name)

        filename: str = name
        filename += ".pkl" if metaData["isScikit"] else ".pth"
        
        filePath = os.path.join(TRAINED_FOLDER, filename)
        
        os.remove(filePath)
        self.repository.removeMetaData(name)
        
    def getMetaData(self, name: str) -> dict:
        return self.repository.getMetaData(name)
    
    def predict(self, predictorName: str, sample: List[float]) -> List[float]:
        metaData: dict = self.getMetaData(predictorName)

        if metaData is None:
            raise Exception(f"no predictor named {predictorName}")
        
        if len(sample) != len(metaData["fields"]):
            raise Exception("the given sample does not match the predictor's requirements")
        
        prediction: List[str] = []

        if metaData["isScikit"]:
            prediction = self.predictScikit(predictorName=predictorName, sample=sample)
        elif metaData["isPyTorch"]:
            prediction = self.predictPyTorch(predictorName=predictorName, sample=sample)

        return prediction
        
    def predictScikit(self, predictorName: str, sample: List[float]) -> List[float]:
        predictor = self.loadScikit(predictorName=predictorName)

        res = list(predictor.predict(sample)[0])

        return res

    def predictPyTorch(self, predictorName: str, sample: List[float]) -> List[float]:
        # TODO
        pass

    def loadScikit(self, predictorName: str):
        filePath = os.path.join(TRAINED_FOLDER, predictorName + ".pkl")
        predictor = None

        with open(filePath, "rb") as f:
            predictor = pickle.load(f)

        return predictor
    









