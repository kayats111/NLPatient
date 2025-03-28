import os
import pickle
from torch import save
from typing import Dict, List, Set
from importlib import import_module
import inspect

from MetaDataRepository import MetaDataRepository
from HyperParameterRepository import HyperParametersRepository
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
        self.parameter_repository: HyperParametersRepository = HyperParametersRepository()

    def addModel(self, file) -> None:
        modelNames: List[str] = self.getModelNames()
        tempName: str = file.filename.split(".")[0]

        if tempName in modelNames:
            raise Exception("a model with the same name already exists")

        filePath = os.path.join(SAVED_FOLDER, file.filename)

        with open(filePath, "w") as f:
            f.write(file.read().decode("utf-8"))

        self.validate_new_model_file(file_name=file.filename)

        # TODO: change to save in something destributed

    def add_model_parameters(self, model_name: str, hyper_parameters: List[str]) -> None:
        if hyper_parameters is None:
            raise Exception("the hyper parameters list cannot be null")
        
        self.parameter_repository.add_hyper_parameters(model_name=model_name, parameters=hyper_parameters)

    def getModelFile(self, modelName: str):
        filePath = os.path.join(SAVED_FOLDER, modelName + ".py")

        if not os.path.isfile(filePath):
            raise Exception(f"the model {modelName} does not exist")
        
        return open(filePath, "r")
    
    def getModelPath(self, modelName: str) -> str:
        filePath = os.path.join(SAVED_FOLDER, modelName + ".py")

        return filePath

    def get_model_hyper_parameters(self, model_name: str) -> List[str]:
        return self.parameter_repository.read_parameters(model_name=model_name)

    def getModelNames(self) -> List[str]:
        models: List[str] = [file.split(".")[0] for file in os.listdir(SAVED_FOLDER) if os.path.isfile(os.path.join(SAVED_FOLDER, file))]

        return models
    
    def removeModelFile(self, modelName: str) -> None:
        filePath = os.path.join(SAVED_FOLDER, modelName + ".py")

        if not os.path.isfile(filePath):
            raise Exception(f"the model {modelName} does not exist")
        
        os.remove(filePath)

        self.parameter_repository.delete_parameters(model_name=modelName)

    def runModel(self, model_name: str, fields: List[str] = None, labels: List[str] = None,
                 train_relative_size: int = 0, test_relative_size: int = 0, epochs: int = 0,
                 batch_size: int = 0, sample_limit: int = 0, hyper_parameters: dict = None) -> dict:
        self.validate_hyper_parameters(model_name=model_name, hyper_parameters=hyper_parameters)

        learn_model = self.load_learn_model(model_name=model_name, hyper_parameters=hyper_parameters)
        
        data_loader = DataLoader(fields=fields, labels=labels, train_relative_size=train_relative_size,
                                 test_relative_size=test_relative_size, epochs=epochs, batches_size=batch_size,
                                 sample_limit=sample_limit)
        
        data_loader.load()
        
        while data_loader.has_next_train():
            batch: Dict[str, NDArray] = data_loader.get_next_train()
            learn_model.train(vectors=batch["vectors"], labels=batch["vectorLabels"])

            fields = batch["fields"]
            labels = batch["labels"]

        while data_loader.has_next_test():
            batch: Dict[str, NDArray] = data_loader.get_next_test()
            learn_model.test(vectors=batch["vectors"], labels=batch["vectorLabels"])

        self.addTrainedModel(model=learn_model.model, modelName=model_name,
                             isScikit=learn_model.is_scikit, isPyTorch=learn_model.is_pytorch)
        
        metaData: dict = self.addMetaData(modelName=model_name, meta_data=learn_model.meta_data,
                                          fields=fields, labels=labels, hyper_parameters=hyper_parameters)

        return metaData

    def validate_hyper_parameters(self, model_name: str, hyper_parameters: dict) -> None:
        hyper_parameters_names: Set[str] = set(self.parameter_repository.read_parameters(model_name=model_name))

        for param in hyper_parameters_names:
            if param not in hyper_parameters:
                raise Exception(f"the hyper parameter {param} was not included in the train request")
            
        for param in hyper_parameters.keys():
            if param not in hyper_parameters_names:
                raise Exception(f"the provided parameter {param} is not a {model_name} hyper parameter")

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
    def addMetaData(self, modelName: str, meta_data: dict, fields: List[str], labels: List[str], hyper_parameters: dict) -> dict:
        meta_data["model name"] = modelName
        meta_data["fields"] = fields
        meta_data["labels"] = labels
        meta_data["hyper parameters"] = hyper_parameters

        self.metaRepository.addMetaData(meta_data)

        if "_id" in meta_data:
            meta_data.pop("_id")

        return meta_data

    def load_learn_model(self, model_name: str, hyper_parameters: dict):
        filePath = os.path.join(SAVED_FOLDER, model_name + ".py")

        if not os.path.isfile(filePath):
            raise Exception(f"the model {model_name} does not exist")

        moduleName: str = SAVED_FOLDER + "." + model_name

        module = import_module(moduleName)

        learn_model_class = getattr(module, "LearnModel", None)
        
        learn_model = learn_model_class(hyper_parameters=hyper_parameters)

        return learn_model

    def get_names_and_parameters(self) -> List[Dict[str, List[str]]]:
        return self.parameter_repository.model_names_and_parameters()
    
    def getTemplatePath(self):
        return TEMPLATE_PATH
    
    def validate_new_model_file(self, file_name: str) -> None:
        filePath = os.path.join(SAVED_FOLDER, file_name + ".py")

        module = import_module(SAVED_FOLDER + "." + file_name[:-3])

        if not hasattr(module, "LearnModel") or not inspect.isclass(getattr(module, "LearnModel")):
            os.remove(filePath)
            raise Exception(f"no LearnModel class in {file_name}")
        
        learn_model_class = getattr(module, "LearnModel", None)

        callables: List[str] = ["train", "test", "__init__"]
        fields: List[str] = ["model", "hyper_parameters", "is_scikit", "is_pytorch", "meta_data"]

        for c in callables:
            if not hasattr(learn_model_class, c) or not callable(getattr(learn_model_class, c)):
                os.remove(filePath)
                raise Exception(f"no {c} method in LearnModel class")
            
        learn_model = learn_model_class(hyper_parameters={})

        for f in fields:
            if not hasattr(learn_model, f):
                os.remove(filePath)
                raise Exception(f"no {f} field in LearnModel class")
        

        















