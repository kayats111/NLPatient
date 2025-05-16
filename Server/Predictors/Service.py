from collections import defaultdict
import os
import sys
from typing import List
import pickle
from MetaDataRepository import MetaDataRepository
from importlib import import_module
import torch
import numpy as np

NFS_DIRECTORY: str = os.environ["nfs_dir"]

sys.path.append(NFS_DIRECTORY)

SAVED_FOLDER: str = "SavedModels"
TRAINED_FOLDER: str = "TrainedModels"



class Service:

    def __init__(self):
        os.makedirs(SAVED_FOLDER, exist_ok=True)
        os.makedirs(TRAINED_FOLDER, exist_ok=True)
        
        self.repository: MetaDataRepository = MetaDataRepository()

    def getPredictorNames(self) -> List[str]:
        return self.repository.getPredictorNames()
    
    def isPredictorExists(self, name: str) -> bool:
        return self.getMetaData(name) is not None
   
    def getPredictorPath(self, name: str) -> str:
        if not self.isPredictorExists(name):
            raise Exception(f"the predictor {name} does not exist")
        
        metaData: dict = self.getMetaData(name)
        
        filename: str = name
        filename += ".pkl" if metaData["model type"] == "SCIKIT" else ".pth"

        filePath = os.path.join(NFS_DIRECTORY, TRAINED_FOLDER, filename)

        return filePath
    
    def deletePredictor(self, name: str) -> None:
        if not self.isPredictorExists(name):
            raise Exception(f"the predictor {name} does not exist")
        
        metaData: dict = self.getMetaData(name)

        filename: str = name
        filename += ".pkl" if metaData["model type"] == "SCIKIT" else ".pth"
        
        filePath = os.path.join(NFS_DIRECTORY, TRAINED_FOLDER, filename)
        
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
        elif metaData["model type"] == "PYTORCH":
            prediction = self.predictPyTorch(predictorName=predictorName, sample=sample)
        else:
            raise Exception("NLP nodels cannot be run as ML/DL models")

        return prediction
        
    def predictScikit(self, predictorName: str, sample: List[float]) -> List[float]:
        predictor = self.loadScikit(predictorName=predictorName)

        res = predictor.predict(np.array([sample])).tolist()[0]

        return res

    def predictPyTorch(self, predictorName: str, sample: List[float]) -> List[float]:
        predictor = self.loadPyTorch(predictorName=predictorName)

        _input = torch.from_numpy(np.array(sample)).float()
        output = predictor(_input)
        predictedLabel = output.detach().int().numpy().tolist()

        return predictedLabel

    def loadScikit(self, predictorName: str):
        filePath = os.path.join(NFS_DIRECTORY, TRAINED_FOLDER, predictorName + ".pkl")
        predictor = None

        with open(filePath, "rb") as f:
            predictor = pickle.load(f)

        return predictor
    
    def loadPyTorch(self, predictorName: str):
        filePath = os.path.join(NFS_DIRECTORY, SAVED_FOLDER, predictorName + ".py")

        if not os.path.isfile(filePath):
            raise Exception(f"the model {predictorName} does not exist")

        moduleName: str = SAVED_FOLDER + "." + predictorName

        module = import_module(moduleName)

        hyper_parameters: dict = self.repository.getMetaData(predictorName=predictorName)["hyper parameters"]
        
        learn_model_class = getattr(module, "LearnModel")
        learn_model = learn_model_class(hyper_parameters=hyper_parameters)

        path = os.path.join(NFS_DIRECTORY, TRAINED_FOLDER, predictorName + ".pth")

        predictor = learn_model.model
        predictor.load_state_dict(torch.load(path))
        predictor.eval()

        return predictor

    def nlp_infer(self, predictor_name: str, sample: str) -> List[float]:
        metadata: dict = self.getMetaData(predictor_name)

        if metadata is None:
            raise Exception(f"no predictor named {predictor_name}")
        
        prediction: List[float] = []

        if metadata["model type"] == "BERT":
            prediction = self.infer_bert(predictor_name=predictor_name, sample=sample)
        else:
            raise Exception("ML/DL models cannot be run as NLP models")
        
        return prediction
    
    def infer_bert(self, predictor_name: str, sample: str) -> List[float]:
        predictor = self.load_bert(predictor_name=predictor_name)

        prediction: List[float] = predictor.infer(text=sample)

        return prediction

    def load_bert(self, predictor_name: str):
        dir_path = os.path.join(NFS_DIRECTORY, TRAINED_FOLDER, predictor_name)
        module_path = os.path.join(NFS_DIRECTORY, SAVED_FOLDER, predictor_name + ".py")

        if not os.path.isdir(dir_path):
            raise Exception(f"the predictor {predictor_name} does not exist")
        if not os.path.isfile(module_path):
            raise Exception(f"the model {predictor_name} does not exist")
        
        module_name: str = SAVED_FOLDER + "." + predictor_name

        module = import_module(module_name)

        learn_model_class = getattr(module, "NLPTemplate", None)

        predictor = learn_model_class(hyper_parameters=defaultdict(lambda: 0))

        predictor.load_model(save_dir=dir_path)

        return predictor
        

    







