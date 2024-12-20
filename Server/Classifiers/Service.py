import os



TRAINED_FOLDER: str = "TrainedModels"


class Service:

    def __init__(self):
        os.makedirs(TRAINED_FOLDER, exist_ok=True)









