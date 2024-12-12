import os

FOLDER: str = "SavedModels"

class Service:

    def addModel(self, modelFile) -> None:
        os.makedirs(FOLDER, exist_ok=True)

        filePath = os.path.join(FOLDER, modelFile.name)

        with open(filePath, "w") as f:
            f.write(modelFile.read())
        








