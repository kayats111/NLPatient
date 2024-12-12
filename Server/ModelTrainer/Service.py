import os
import pickle
from torch import save
from typing import List

SAVED_FOLDER: str = "SavedModels"
TRAINED_FOLDER: str = "TrainedModels"

class Service:

    def __init__(self):
        os.makedirs(SAVED_FOLDER, exist_ok=True)
        os.makedirs(TRAINED_FOLDER, exist_ok=True)

    def addModel(self, modelFile) -> None:
        filePath = os.path.join(SAVED_FOLDER, modelFile.name)

        with open(filePath, "w") as f:
            f.write(modelFile.read())

        # TODO: change to save in something destributed
        
    def getModelFile(self, modelName: str):
        filePath = os.path.join(SAVED_FOLDER, modelName + ".py")

        if not os.path.isfile(filePath):
            raise Exception(f"the model {modelName} does not exist")
        
        return open(filePath, "r")
        
    def getModelsNames(self) -> List[str]:
        models: List[str] = [file.split(".")[0] for file in os.listdir(SAVED_FOLDER) if os.path.isfile(os.path.join(SAVED_FOLDER, file))]

        return models
    
    def removeModelFile(self, modelName: str) -> None:
        filePath = os.path.join(SAVED_FOLDER, modelName + ".py")

        if not os.path.isfile(filePath):
            raise Exception(f"the model {modelName} does not exist")
        
        os.remove(filePath)

    # NOTE: not for API use, but after training the model (lambda?)
    # TODO: check after model training
    def addTrainedModel(self, model, modelName, isScikit=False, isPyTorch=False) -> None:
        if isScikit:
            with open(os.path.join(TRAINED_FOLDER, modelName + ".pkl"),'wb') as f:
                pickle.dump(model, f)
            return
        
        if isPyTorch:
            save(model, os.path.join(TRAINED_FOLDER, modelName + ".pth"))
            return
    





# service: Service = Service()
# file = open("Service.py", "r")

# # service.addModel(file)
# service.removeModelFile("Service")












service: Service = Service()











