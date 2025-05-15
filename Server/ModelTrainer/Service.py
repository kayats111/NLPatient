from collections import defaultdict
import os
import sys
import pickle
from torch import save
from typing import Dict, List, Set
from importlib import import_module
import inspect
import requests

from MetaDataRepository import MetaDataRepository
from HyperParameterRepository import HyperParametersRepository
from Response import Response
from DataLoader import DataLoader
from numpy.typing import NDArray
import numpy as np

NFS_DIRECTORY: str = os.environ["nfs_dir"]

sys.path.append(NFS_DIRECTORY)

SAVED_FOLDER: str = "SavedModels"
TRAINED_FOLDER: str = "TrainedModels"
TEMPLATE_PATH: str = "LearnModel.py"
NLP_TEMPLATE_PATH:str = "NLPTemplate.py"

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

        self.addTrainedModel(model=learn_model.model, modelName=model_name, model_type=model_type)
        
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
    def addTrainedModel(self, model, modelName: str, model_type: str) -> None:
        if model_type == "SCIKIT":
            with open(os.path.join(NFS_DIRECTORY, TRAINED_FOLDER, modelName + ".pkl"),'wb') as f:
                pickle.dump(model, f)
            return
        
        if model_type == "PYTORCH":
            save(model.state_dict(), os.path.join(NFS_DIRECTORY, TRAINED_FOLDER, modelName + ".pth"))
            return
        
        if model_type == "BERT":
            save_path = os.path.join(NFS_DIRECTORY, TRAINED_FOLDER)
            model.save_model(save_dir=save_path)

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
        file_path = os.path.join(NFS_DIRECTORY, SAVED_FOLDER, file_name)        
        module = import_module(SAVED_FOLDER + "." + file_name[:-3])

        e_ml_dl = self.validate_ml_dl(module=module, file_path=file_path, file_name=file_name)
        e_nlp = self.validate_nlp(module=module, file_path=file_path, file_name=file_name)

        if e_ml_dl is not None and e_nlp is not None:
            os.remove(file_path)
            raise Exception(f"{e_ml_dl} or {e_nlp}")
            
    def validate_ml_dl(self, module, file_path, file_name) -> str:
        if not hasattr(module, "LearnModel") or not inspect.isclass(getattr(module, "LearnModel")):
            return f"no LearnModel class in {file_name}"
        
        learn_model_class = getattr(module, "LearnModel", None)

        callables: List[str] = ["train", "test", "__init__"]
        fields: List[str] = ["model", "hyper_parameters", "meta_data"]

        for c in callables:
            if not hasattr(learn_model_class, c) or not callable(getattr(learn_model_class, c)):
                return f"no {c} method in LearnModel class"
            
        learn_model = learn_model_class(hyper_parameters=defaultdict(lambda: 0))

        for f in fields:
            if not hasattr(learn_model, f):
                return f"no {f} field in LearnModel class"
            
        return None
        
    def validate_nlp(self, module, file_path, file_name) -> str:
        if not hasattr(module, "NLPTemplate") or not inspect.isclass(getattr(module, "NLPTemplate")):
            return f"no NLPTemplate class in {file_name}"
        
        learn_model_class = getattr(module, "NLPTemplate", None)

        callables: List[str] = ["run_model", "save_model", "__init__", "load_model", "infer"]
        fields: List[str] = ["model", "hyper_parameters", "metadata"]

        for c in callables:
            if not hasattr(learn_model_class, c) or not callable(getattr(learn_model_class, c)):
                return f"no {c} method in NLPTemplate class"
            
        learn_model = learn_model_class(hyper_parameters=defaultdict(lambda: 0))

        for f in fields:
            if not hasattr(learn_model, f):
                return f"no {f} field in NLPTemplate class"
            
        return None




    # NLP Special Functionality
    def run_nlp_model(self, model_name: str, labels: List[str], train_relative_size: int = 80,
                    test_relative_size: int = 20, epochs: int = 1, batch_size: int = 1,
                    hyper_parameters: dict = {}):
        self.validate_hyper_parameters(model_name=model_name, hyper_parameters=hyper_parameters)

        hyper_parameters["train_size"] = train_relative_size / 100
        hyper_parameters["test_size"] = test_relative_size / 100
        hyper_parameters["epochs"] = epochs
        hyper_parameters["batch_size"] = batch_size

        learn_model = self.load_nlp_model(model_name=model_name, hyper_parameters=hyper_parameters)

        data = self.load_text_records(labels=labels)

        model_type: str = self.parameter_repository.read_type(model_name=model_name)

        if model_type == "BERT":
            self.run_bert(learn_model=learn_model, data=data)
        else:
            raise Exception("cannot run ML\DL models as NLP models")
        
        self.addTrainedModel(model=learn_model, modelName=model_name, model_type=model_type)

        hyper_parameters.pop("train_size")
        hyper_parameters.pop("test_size")
        hyper_parameters.pop("epochs")
        hyper_parameters.pop("batch_size")

        train_size: int = int(len(data["text"]) * (train_relative_size / 100))
        test_size: int = int(len(data["text"]) * (test_relative_size / 100))

        metadata: dict = self.addMetaData(modelName=model_name, meta_data=learn_model.metadata, fields=["text"],
                                          labels=labels, hyper_parameters=hyper_parameters,
                                          model_type=model_type, train_relative_size=train_relative_size,
                                          test_relative_size=test_relative_size, train_size=train_size,
                                          test_size=test_size)
        
        return metadata
        
    def load_nlp_model(self, model_name: str, hyper_parameters: dict):
        file_path = os.path.join(NFS_DIRECTORY, SAVED_FOLDER, model_name + ".py")

        if not os.path.isfile(file_path):
            raise Exception(f"the model {model_name} does not exist")

        module_name: str = SAVED_FOLDER + "." + model_name

        module = import_module(module_name)

        learn_model_class = getattr(module, "NLPTemplate", None)
        
        learn_model = learn_model_class(hyper_parameters=hyper_parameters)

        return learn_model

    def load_text_records(self, labels: List[str]) -> Dict[str, list]:
        data_manager: str = os.environ["data_manager"]
        url: str = f"http://{data_manager}:3000/api/data/text/read/train"
        headers: dict = {"Content_type": "application/json"}
        body: dict = {"labels": labels}
        
        response: Response[dict]

        api_response = requests.post(url=url, headers=headers, json=body)

        if api_response.status_code != 200:
            raise Exception("cannot fetch data")
        
        jj = api_response.json()
        response = Response(value=jj["value"], error=jj["error"], message=jj["message"])

        if response.error:
            raise Exception(response.message)
        
        return response.value

    def run_bert(self, learn_model, data: Dict[str, list]) -> Dict[str, List[str]]:
        learn_model.run_model(data=data)

    def get_nlp_template(self) -> str:
        return NLP_TEMPLATE_PATH














