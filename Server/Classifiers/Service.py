import os
from typing import List



TRAINED_FOLDER: str = "TrainedModels"


class Service:

    def __init__(self):
        os.makedirs(TRAINED_FOLDER, exist_ok=True)

    def getClassifierNames(self):
        classifiers: List[str] = [file.split(".")[0] for file in os.listdir(TRAINED_FOLDER)
                                  if os.path.isfile(os.path.join(TRAINED_FOLDER, file))]

        return classifiers









