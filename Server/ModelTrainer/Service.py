from collections import defaultdict
import os
import sys
import pickle
from torch import save
from typing import Dict, List, Set
from importlib import import_module
import inspect

from MetaDataRepository import MetaDataRepository
from HyperParameterRepository import HyperParametersRepository
from DataLoader import DataLoader
from numpy.typing import NDArray
import numpy as np

NFS_DIRECTORY: str = os.environ["nfs_dir"]

sys.path.append(NFS_DIRECTORY)

SAVED_FOLDER: str = "SavedModels"
TRAINED_FOLDER: str = "TrainedModels"
TEMPLATE_PATH: str = "LearnModel.py"

class Service:

    def __init__(self):
        os.makedirs(NFS_DIRECTORY + "/" + SAVED_FOLDER, exist_ok=True)
        os.makedirs(NFS_DIRECTORY + "/" + TRAINED_FOLDER, exist_ok=True)

        self.metaRepository: MetaDataRepository = MetaDataRepository()
        self.parameter_repository: HyperParametersRepository = HyperParametersRepository()

    def addModel(self, file) -> None:
        modelNames: List[str] = self.getModelNames()
        tempName: str = file.filename.split(".")[0]

        if tempName in modelNames:
            raise Exception("a model with the same name already exists")

        filePath = os.path.join(NFS_DIRECTORY, SAVED_FOLDER, file.filename)

        with open(filePath, "w") as f:
            f.write(file.read().decode("utf-8"))

        self.validate_new_model_file(file_name=file.filename)

    def add_model_parameters(self, model_name: str, hyper_parameters: List[str], model_type: str) -> None:
        if hyper_parameters is None:
            raise Exception("the hyper parameters list cannot be null")
        
        self.parameter_repository.add_hyper_parameters(model_name=model_name, parameters=hyper_parameters, model_type=model_type)

    def getModelFile(self, modelName: str):
        filePath = os.path.join(NFS_DIRECTORY, SAVED_FOLDER, modelName + ".py")

        if not os.path.isfile(filePath):
            raise Exception(f"the model {modelName} does not exist")
        
        return open(filePath, "r")
    
    def getModelPath(self, modelName: str) -> str:
        filePath = os.path.join(NFS_DIRECTORY, SAVED_FOLDER, modelName + ".py")

        return filePath

    def get_model_hyper_parameters(self, model_name: str) -> dict:
        return self.parameter_repository.read_parameters(model_name=model_name)

    def getModelNames(self) -> List[str]:
        print(NFS_DIRECTORY + "/" + SAVED_FOLDER)
        models: List[str] = [file.split(".")[0] for file in os.listdir(NFS_DIRECTORY + "/" + SAVED_FOLDER)
                             if os.path.isfile(os.path.join(NFS_DIRECTORY, SAVED_FOLDER, file))]

        return models
    
    def removeModelFile(self, modelName: str) -> None:
        filePath = os.path.join(NFS_DIRECTORY, SAVED_FOLDER, modelName + ".py")

        if not os.path.isfile(filePath):
            raise Exception(f"the model {modelName} does not exist")
        
        os.remove(filePath)

        self.parameter_repository.delete_parameters(model_name=modelName)

    def runModel(self, model_name: str, fields: List[str] = None, labels: List[str] = None,
                 train_relative_size: int = 80, test_relative_size: int = 20, epochs: int = 1,
                 batch_size: int = 100, sample_limit: int = -1, hyper_parameters: dict = {}) -> dict:
        self.validate_hyper_parameters(model_name=model_name, hyper_parameters=hyper_parameters)

        learn_model = self.load_learn_model(model_name=model_name, hyper_parameters=hyper_parameters)
        
        data_loader = DataLoader(fields=fields, labels=labels, train_relative_size=train_relative_size,
                                 test_relative_size=test_relative_size, epochs=epochs, batches_size=batch_size,
                                 sample_limit=sample_limit)
        
        data_loader.load()

        model_type: str = self.parameter_repository.read_type(model_name=model_name)

        fields_labels: dict = {}

        if model_type == "SCIKIT":
            fields_labels = self.run_scikit_model(learn_model=learn_model, data_loader=data_loader)
        elif model_type == "PYTORCH":
            fields_labels = self.run_pytorch_model(learn_model=learn_model, data_loader=data_loader)
        else:
            raise Exception("cannot run NLP models as a ML or DL model")

        fields = fields_labels["fields"]
        labels = fields_labels["labels"]       

        self.addTrainedModel(model=learn_model.model, modelName=model_name,
                             isScikit=model_type=="SCIKIT", isPyTorch=model_type=="PYTORCH")
        
        metaData: dict = self.addMetaData(modelName=model_name, meta_data=learn_model.meta_data,
                                          fields=fields, labels=labels, hyper_parameters=hyper_parameters,
                                          model_type=model_type, train_relative_size=train_relative_size,
                                          test_relative_size=test_relative_size,
                                          train_size=data_loader.train_size, test_size=data_loader.test_size)

        return metaData
    
    def run_scikit_model(self, learn_model, data_loader: DataLoader) -> Dict[str, List[str]]:
        fields: List[str]
        labels: List[str]
        vectors: NDArray
        vectorLabels: NDArray

        if data_loader.has_next_train():
            batch: Dict[str, NDArray] = data_loader.get_next_train()
            vectors = batch["vectors"]
            vectorLabels = batch["vectorLabels"]
            fields = batch["fields"]
            labels = batch["labels"]

            while data_loader.has_next_train():
                batch: Dict[str, NDArray] = data_loader.get_next_train()
                np.concatenate((vectors, batch["vectors"]))
                np.concatenate((vectorLabels, batch["vectorLabels"]))
            
            learn_model.train(vectors=vectors, labels=vectorLabels)

        if data_loader.has_next_test():
            batch: Dict[str, NDArray] = data_loader.get_next_test()
            vectors = batch["vectors"]
            vectorLabels = batch["vectorLabels"]
            fields = batch["fields"]
            labels = batch["labels"]

            while data_loader.has_next_test():
                batch: Dict[str, NDArray] = data_loader.get_next_test()
                np.concatenate((vectors, batch["vectors"]))
                np.concatenate((vectorLabels, batch["vectorLabels"]))
                
            learn_model.test(vectors=vectors, labels=vectorLabels)

        return {
            "fields": fields,
            "labels": labels
        }
        
    def run_pytorch_model(self, learn_model, data_loader: DataLoader) -> Dict[str, List[str]]:
        fields: List[str]
        labels: List[str]

        while data_loader.has_next_train():
            batch: Dict[str, NDArray] = data_loader.get_next_train()
            learn_model.train(vectors=batch["vectors"], labels=batch["vectorLabels"])

            fields = batch["fields"]
            labels = batch["labels"]

        while data_loader.has_next_test():
            batch: Dict[str, NDArray] = data_loader.get_next_test()
            learn_model.test(vectors=batch["vectors"], labels=batch["vectorLabels"])

        return {
            "fields": fields,
            "labels": labels
        }

    def validate_hyper_parameters(self, model_name: str, hyper_parameters: dict) -> None:
        hyper_parameters_names: Set[str] = set(self.parameter_repository.read_parameters(model_name=model_name)["parameters"])

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
            with open(os.path.join(NFS_DIRECTORY, TRAINED_FOLDER, modelName + ".pkl"),'wb') as f:
                pickle.dump(model, f)
            return
        
        if isPyTorch:
            save(model.state_dict(), os.path.join(NFS_DIRECTORY, TRAINED_FOLDER, modelName + ".pth"))
            return

    # NOTE: not for API use, but after training the model (lambda?)
    # TODO: check after model training    
    def addMetaData(self, modelName: str, meta_data: dict, fields: List[str], labels: List[str],
                    hyper_parameters: dict, model_type: str, train_relative_size: int,
                    test_relative_size: int, train_size: int, test_size: int) -> dict:
        meta_data["model name"] = modelName
        meta_data["fields"] = fields
        meta_data["labels"] = labels
        meta_data["hyper parameters"] = hyper_parameters
        meta_data["model type"] = model_type
        meta_data["train_relative_size"] = train_relative_size
        meta_data["test_relative_size"] = test_relative_size
        meta_data["train_size"] = train_size
        meta_data["test_size"] = test_size

        self.metaRepository.addMetaData(meta_data)

        if "_id" in meta_data:
            meta_data.pop("_id")

        return meta_data

    def load_learn_model(self, model_name: str, hyper_parameters: dict):
        filePath = os.path.join(NFS_DIRECTORY, SAVED_FOLDER, model_name + ".py")

        if not os.path.isfile(filePath):
            raise Exception(f"the model {model_name} does not exist")

        moduleName: str = SAVED_FOLDER + "." + model_name

        module = import_module(moduleName)

        learn_model_class = getattr(module, "LearnModel", None)
        
        learn_model = learn_model_class(hyper_parameters=hyper_parameters)

        return learn_model

    def get_names_and_parameters(self) -> List[dict]:
        return self.parameter_repository.model_names_and_parameters()
    
    def getTemplatePath(self):
        return TEMPLATE_PATH
    
    def validate_new_model_file(self, file_name: str) -> None:
        filePath = os.path.join(NFS_DIRECTORY, SAVED_FOLDER, file_name + ".py")
        

        module = import_module(SAVED_FOLDER + "." + file_name[:-3])

        if not hasattr(module, "LearnModel") or not inspect.isclass(getattr(module, "LearnModel")):
            os.remove(filePath)
            raise Exception(f"no LearnModel class in {file_name}")
        
        learn_model_class = getattr(module, "LearnModel", None)

        callables: List[str] = ["train", "test", "__init__"]
        fields: List[str] = ["model", "hyper_parameters", "meta_data"]

        for c in callables:
            if not hasattr(learn_model_class, c) or not callable(getattr(learn_model_class, c)):
                os.remove(filePath)
                raise Exception(f"no {c} method in LearnModel class")
            
        learn_model = learn_model_class(hyper_parameters=defaultdict(lambda: 0))

        for f in fields:
            if not hasattr(learn_model, f):
                os.remove(filePath)
                raise Exception(f"no {f} field in LearnModel class")
        




    # NLP Special Functionality
    def runNLPModel(self)  















