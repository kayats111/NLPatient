from typing import Dict, List, Tuple
from Response import Response
import requests
import random
from numpy.typing import NDArray
import numpy as np
import os


class DataLoader:

    def __init__(self, fields: List[str] = None, labels: List[str] = None,
                 train_relative_size: int = 0, test_relative_size: int = 0, epochs: int = 0,
                 batches_size: int = 0, sample_limit: int = 0):
        self.train_relative_size: int = int(train_relative_size)
        self.test_relative_size: int = int(test_relative_size)
        self.epochs: int = epochs
        self.batch_size: int = batches_size
        self.fields: List[str] = fields
        self.labels: List[str] = labels
        self.sample_limit: int = sample_limit
        self.train_batches: List[List[int]] = None
        self.test_batches: List[List[int]] = None
        self.curr_train_batch: int = -1
        self.curr_test_batch: int = -1
        self.curr_epoch: int = -1
        self.train_size: int = -1
        self.test_size: int = -1

        self.__validate_requirements()

    def load(self) -> None:
        ids: List[int] = self.__fetch_ids()

        train_set, test_set = self.__divide_train_test(ids)

        self.train_batches = self.__divide_to_batches(train_set)
        self.test_batches = self.__divide_to_batches(test_set)

        self.curr_epoch = 0
        self.curr_train_batch = 0
        self.curr_test_batch = 0

    def __fetch_ids(self) -> List[int]:
        data_manager: str = os.environ["data_manager"]
        url: str = f"http://{data_manager}:3000/api/data/ids"

        response: Response[dict] = self.__fetch(url=url)

        ids: List[int] = response.value

        if self.sample_limit <= 0:
            self.sample_limit = len(ids)

        return ids
    
    def __fetch(self, url: str, body: dict = None) -> Response[dict]:
        response: Response[dict]
        headers: dict = {"Content_type": "application/json"}
        
        api_response = None

        if body is not None:
            api_response = requests.get(url=url, headers=headers, json=body)
        else:
            api_response = requests.get(url=url, headers=headers)
        
        if api_response.status_code != 200:
            raise Exception("cannot fetch data")
        
        jj = api_response.json()
        response = Response(value=jj["value"], error=jj["error"], message=jj["message"])

        if response.error:
            raise Exception(response.message)
        
        return response
        
    def __divide_train_test(self, ids: List[int]) -> Tuple[List[int], List[int]]:        
        if self.sample_limit > len(ids):
            raise Exception("not enough samples in the database")

        random.shuffle(ids)
        ids = ids[:self.sample_limit]

        n: int = len(ids)

        self.train_size = int(n * (self.train_relative_size / 100))
        self.test_size = len(ids) - self.train_size
           
        train_set: List[int] = ids[ : self.train_size]
        test_set: List[int] = ids[self.train_size : ]

        return train_set, test_set
        
    def __divide_to_batches(self, id_set: List[int]) -> List[List[int]]:
        batches: List[List[int]] = []
        curr: int = 0

        while curr * self.batch_size < len(id_set):
            batch: List[int] = id_set[curr * self.batch_size : min((curr + 1) * self.batch_size, len(id_set))]
            batches.append(batch)
            curr += 1

        return batches

    def __validate_requirements(self) -> None:
        if int(self.train_relative_size) + int(self.test_relative_size) != 100:
            raise Exception("the train + test relative sizes should be 100 percent")
        
        if self.epochs < 1:
            raise Exception("the number of epochs should be al least 1")
        
        if self.batch_size < 1:
            raise Exception("the size of a batch should be at least 1")

    def has_next_train(self) -> bool:
        return self.curr_epoch < self.epochs
    
    def get_next_train(self) -> Dict[str, NDArray]:
        if not self.has_next_train():
            raise Exception("no batches or epochs left")
        
        ids_batch: List[int] = self.train_batches[self.curr_train_batch]
        self.curr_train_batch += 1

        if self.curr_train_batch == len(self.train_batches):
            self.curr_epoch += 1
            self.curr_train_batch = 0

        batch: Dict[str, NDArray] = self.__get_batch_by_ids(ids_batch=ids_batch)

        return batch 
    
    def __get_batch_by_ids(self, ids_batch: List[int]) -> Dict[str, NDArray]:
        data_manager: str = os.environ["data_manager"]
        body: dict = {"ids": ids_batch}
        url = f"http://{data_manager}:3000/api/data/read/vectors"

        if self.fields is not None:
            body["fields"] = self.fields
        if self.labels is not None:
            body["labels"] = self.labels

        response: Response[dict] = self.__fetch(url=url, body=body)

        vectors = np.array(response.value["vectors"])
        vectorLabels = np.array(response.value["vectorLabels"])
        fields = response.value["fields"]
        labels = response.value["labels"]

        return {
            "vectors": vectors,
            "vectorLabels": vectorLabels,
            "fields": fields,
            "labels": labels
        }

    def has_next_test(self) -> bool:
        return self.curr_test_batch < len(self.test_batches)

    def get_next_test(self) -> Dict[str, NDArray]:
        if not self.has_next_test():
            raise Exception("no batches left")
        
        ids_batch: List[int] = self.test_batches[self.curr_test_batch]
        self.curr_test_batch += 1

        batch: Dict[str, NDArray] = self.__get_batch_by_ids(ids_batch=ids_batch)

        return batch
        
        





