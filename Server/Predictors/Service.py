import os
from typing import List
import pickle
from MetaDataRepository import MetaDataRepository
from importlib import import_module
import torch
import numpy as np



TRAINED_FOLDER: str = "../ModelTrainer/TrainedModels"
SAVED_FOLDER: str = "../ModelTrainer/SavedModels"


class Service:

    def __init__(self):
        self.repository: MetaDataRepository = MetaDataRepository()

    def getPredictorNames(self) -> List[str]:
        return self.repository.getPredictorNames()
    
    def isPredictorExists(self, name: str) -> bool:
        return self.getMetaData(name) is not None
   
    def getPredictorPath(self, name: str) -> str:
        if not self.isPredictorExists(name):
            raise Exception(f"the predictor {name} does not exists")
        
        metaData: dict = self.getMetaData(name)
        
        filename: str = name
        filename += ".pkl" if metaData["model type"] == "SCIKIT" else ".pth"

        filePath = os.path.join(TRAINED_FOLDER, filename)

        return filePath
    
    def deletePredictor(self, name: str) -> None:
        if not self.isPredictorExists(name):
            raise Exception(f"the predictor {name} does not exists")
        
        metaData: dict = self.getMetaData(name)

        filename: str = name
        filename += ".pkl" if metaData["model type"] == "SCIKIT" else ".pth"
        
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

        if metaData["model type"] == "SCIKIT":
            prediction = self.predictScikit(predictorName=predictorName, sample=sample)
        elif metaData["model tpye"] == "PYTORCH":
            prediction = self.predictPyTorch(predictorName=predictorName, sample=sample)

        return prediction
        
    def predictScikit(self, predictorName: str, sample: List[float]) -> List[float]:
        predictor = self.loadScikit(predictorName=predictorName)

        res = predictor.predict(np.array([sample])).tolist()[0]

        return res

    def predictPyTorch(self, predictorName: str, sample: List[float]) -> List[float]:
        predictor = self.loadPyTorch(predictorName=predictorName)

        output = predictor(np.array(sample))
        predictedLabel = torch.argmax(output, dim=1).item()

        return predictedLabel

    def loadScikit(self, predictorName: str):
        filePath = os.path.join(TRAINED_FOLDER, predictorName + ".pkl")
        predictor = None

        with open(filePath, "rb") as f:
            predictor = pickle.load(f)

        return predictor
    
    def loadPyTorch(self, predictorName: str):
        filePath = os.path.join(SAVED_FOLDER, predictorName + ".py")

        if not os.path.isfile(filePath):
            raise Exception(f"the model {predictorName} does not exist")

        moduleName: str = SAVED_FOLDER + "." + predictorName

        module = import_module(moduleName)

        hyper_parameters: dict = self.repository.getMetaData(predictorName=predictorName)["hyper parameters"]
        
        learn_model_class = getattr(module, "LearnModel")
        learn_model = learn_model_class(hyper_parameters=hyper_parameters)

        path = os.path.join(TRAINED_FOLDER, predictorName + ".pth")

        predictor = learn_model.model
        predictor.load_state_dict(torch.load(path))
        predictor.eval()

        return predictor









