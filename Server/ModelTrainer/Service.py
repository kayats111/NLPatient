import os
import pickle
from torch import save
from typing import List
from Response import Response
import numpy as np
import requests
from importlib import import_module

from MetaDataRepository import MetaDataRepository



SAVED_FOLDER: str = "SavedModels"
TRAINED_FOLDER: str = "TrainedModels"
TEMPLATE_PATH: str = "LearnTemplate.py"

class Service:

    def __init__(self):
        os.makedirs(SAVED_FOLDER, exist_ok=True)
        os.makedirs(TRAINED_FOLDER, exist_ok=True)

        self.metaRepository: MetaDataRepository = MetaDataRepository()

    def addModel(self, modelFile) -> None:
        modelNames: List[str] = self.getModelNames()
        tempName: str = modelFile.filename.split(".")[0]

        if tempName in modelNames:
            raise Exception("a model with the same name already exists")

        filePath = os.path.join(SAVED_FOLDER, modelFile.filename)

        with open(filePath, "w") as f:
            f.write(modelFile.read().decode("utf-8"))

        # TODO: change to save in something destributed
        
    def getModelFile(self, modelName: str):
        filePath = os.path.join(SAVED_FOLDER, modelName + ".py")

        if not os.path.isfile(filePath):
            raise Exception(f"the model {modelName} does not exist")
        
        return open(filePath, "r")
    
    def getModelPath(self, modelName: str) -> str:
        filePath = os.path.join(SAVED_FOLDER, modelName + ".py")

        return filePath
        
    def getModelNames(self) -> List[str]:
        models: List[str] = [file.split(".")[0] for file in os.listdir(SAVED_FOLDER) if os.path.isfile(os.path.join(SAVED_FOLDER, file))]

        return models
    
    def removeModelFile(self, modelName: str) -> None:
        filePath = os.path.join(SAVED_FOLDER, modelName + ".py")

        if not os.path.isfile(filePath):
            raise Exception(f"the model {modelName} does not exist")
        
        os.remove(filePath)

    def runModel(self, modelName: str, fields: List[str] = None) -> dict:
        filePath = os.path.join(SAVED_FOLDER, modelName + ".py")

        if not os.path.isfile(filePath):
            raise Exception(f"the model {modelName} does not exist")

        moduleName: str = SAVED_FOLDER + "." + modelName

        module = import_module(moduleName)

        if not hasattr(module, "run"):
            raise Exception(f"{modelName} has no run function")
        
        run = getattr(module, "run")
        
        response: Response[dict]  # fetch
        headers = {"Content-Type": "application/json"}
        url = "http://localhost:3000/api/data/read/vectors"
        body: dict = {}

        if fields is not None:
            body = {"fields": fields}
    
        apiResponse = requests.get(url=url, json=body, headers=headers)
        
        if apiResponse.status_code != 200:
            raise Exception("cannot fetch data")
        
        jj = apiResponse.json()
        response = Response(value=jj["value"], error=jj["error"], message=jj["message"])

        if response.error:
            raise Exception(response.message)
        
        vectors = np.array(response.value["vectors"])
        
        if fields is None:
            # all fields
            fields = response.value["fields"]


        result: dict = run(vectors, fields)

        if "model" not in result or "isScikit" not in result or "isPyTorch" not in result:
            raise Exception("the module did not returned the model or whether its Scikit or PyTorch")

        self.addTrainedModel(model=result["model"], modelName=modelName,
                             isScikit=result["isScikit"], isPyTorch=result["isPyTorch"])
        
        metaData: dict = self.addMetaData(modelName=modelName, result=result, fields=fields)

        return metaData

    # NOTE: not for API use, but after training the model (lambda?)
    # TODO: check after model training
    def addTrainedModel(self, model, modelName: str, isScikit: bool=False, isPyTorch: bool=False) -> None:
        if isScikit:
            with open(os.path.join(TRAINED_FOLDER, modelName + ".pkl"),'wb') as f:
                pickle.dump(model, f)
            return
        
        if isPyTorch:
            save(model, os.path.join(TRAINED_FOLDER, modelName + ".pth"))
            return

    # NOTE: not for API use, but after training the model (lambda?)
    # TODO: check after model training    
    def addMetaData(self, modelName: str, result: dict, fields: List[str]) -> dict:
        metaData: dict = result.copy()

        metaData.pop("model")
        metaData["model name"] = modelName
        metaData["fields"] = fields

        self.metaRepository.addMetaData(metaData)
    
    def getTemplatePath(self):
        return TEMPLATE_PATH
    
















