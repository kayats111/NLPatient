import os

FOLDER: str = "SavedModels"

class Service:

    def __init__(self):
        os.makedirs(FOLDER, exist_ok=True)

    def addModel(self, modelFile) -> None:
        filePath = os.path.join(FOLDER, modelFile.name)

        with open(filePath, "w") as f:
            f.write(modelFile.read())

        # TODO: change to save in something destributed
        
    def getModel(self, modelName: str):
        filePath = os.path.join(FOLDER, modelName)

        if not os.path.isfile(filePath):
            raise Exception(f"the model {modelName} does not exist")
        
        return open(filePath, "r")
        

service: Service = Service()

sFile = open("Service.py", "r")

service.addModel(sFile)









