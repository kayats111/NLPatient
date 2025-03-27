import os
import pickle
from torch import save
from typing import Dict, List
from importlib import import_module

from MetaDataRepository import MetaDataRepository
from DataLoader import DataLoader
from numpy.typing import NDArray



SAVED_FOLDER: str = "SavedModels"
TRAINED_FOLDER: str = "TrainedModels"
TEMPLATE_PATH: str = "LearnModel.py"

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

    def runModel(self, model_name: str, fields: List[str] = None, labels: List[str] = None,
                 train_relative_size: int = 0, test_relative_size: int = 0, epochs: int = 0,
                 batch_size: int = 0, sample_limit: int = 0) -> dict:
        learn_model = self.load_learn_model(model_name=model_name)
        
        data_loader = DataLoader(fields=fields, labels=labels, train_relative_size=train_relative_size,
                                 test_relative_size=test_relative_size, epochs=epochs, batches_size=batch_size,
                                 sample_limit=sample_limit)
        
        data_loader.load()
        
        while data_loader.has_next_train():
            batch: Dict[str, NDArray] = data_loader.get_next_train()
            learn_model.train(vectors=batch["vectors"], labels=batch["vectorLabels"])

        while data_loader.has_next_test():
            batch: Dict[str, NDArray] = data_loader.get_next_test()
            learn_model.test(vectors=batch["vectors"], labels=batch["vectorLabels"])

        self.addTrainedModel(model=learn_model.model, modelName=model_name,
                             isScikit=learn_model.is_scikit, isPyTorch=learn_model.is_pytorch)
        
        metaData: dict = self.addMetaData(modelName=model_name, meta_data=learn_model.meta_data, fields=fields, labels=labels)

        return metaData

    # NOTE: not for API use, but after training the model (lambda?)
    # TODO: check after model training
    def addTrainedModel(self, model, modelName: str, isScikit: bool=False, isPyTorch: bool=False) -> None:
        if isScikit:
            with open(os.path.join(TRAINED_FOLDER, modelName + ".pkl"),'wb') as f:
                pickle.dump(model, f)
            return
        
        if isPyTorch:
            save(model.state_dict(), os.path.join(TRAINED_FOLDER, modelName + ".pth"))
            return

    # NOTE: not for API use, but after training the model (lambda?)
    # TODO: check after model training    
    def addMetaData(self, modelName: str, meta_data: dict, fields: List[str], labels: List[str]) -> dict:
        meta_data["model name"] = modelName
        meta_data["fields"] = fields
        meta_data["labels"] = labels

        self.metaRepository.addMetaData(meta_data)

        if "_id" in meta_data:
            meta_data.pop("_id")

        return meta_data

    def load_learn_model(self, model_name: str):
        filePath = os.path.join(SAVED_FOLDER, model_name + ".py")

        if not os.path.isfile(filePath):
            raise Exception(f"the model {model_name} does not exist")

        moduleName: str = SAVED_FOLDER + "." + model_name

        module = import_module(moduleName)

        learn_model_class = getattr(module, "LearnModel", None)

        if learn_model_class is None:
            raise Exception("the model file does not contain the LearnModel class")
        
        if not hasattr(learn_model_class, "train") or not callable(getattr(learn_model_class, "train")):
            raise Exception("no train method in LearnModel class")
        
        if not hasattr(learn_model_class, "test") or not callable(getattr(learn_model_class, "test")):
            raise Exception("no test method in LearnModel class")
        
        learn_model = learn_model_class()

        return learn_model



    
    def getTemplatePath(self):
        return TEMPLATE_PATH
    
















