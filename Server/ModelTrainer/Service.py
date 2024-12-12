import os
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
        
    def getModel(self, modelName: str):
        filePath = os.path.join(SAVED_FOLDER, modelName + ".py")

        if not os.path.isfile(filePath):
            raise Exception(f"the model {modelName} does not exist")
        
        return open(filePath, "r")
        
    def getModelsNames(self) -> List[str]:
        models: List[str] = [file.split(".")[0] for file in os.listdir(SAVED_FOLDER) if os.path.isfile(os.path.join(SAVED_FOLDER, file))]

        return models
    














service: Service = Service()











