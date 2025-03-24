from typing import List, Tuple
from Response import Response
import requests
import random
from numpy.typing import NDArray


class DataLoader:

    def __init__(self, fields: List[str] = None, labels: List[str] = None,
                 train_relative_size: int = 0, test_relative_size: int = 0, epochs: int = 0,
                 batches_size: int = 0, sample_limit: int = 0):
        self.train_relative_size: int = train_relative_size
        self.test_relative_size: int = test_relative_size
        self.epochs: int = epochs
        self.batches_size: int = batches_size
        self.fields: List[str] = fields
        self.labels: List[str] = labels
        self.sample_limit: int = sample_limit
        
        self.train_batches: List[List[int]] = None
        self.test_batches: List[List[int]] = None
        self.curr_train_batch: int = -1
        self.curr_test_batch: int = -1
        self.curr_epoch: int = -1

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
        response: Response[dict]
        headers: dict = {"Content-Type": "application/json"}
        url: str = "http://localhost:3000/api/data/ids"

        api_response = requests.get(url=url, headers=headers)

        if api_response.status_code != 200:
            raise Exception("cannot fetch ids")
        
        jj = api_response.json()
        response = Response(value=jj["value"], error=jj["error"], message=jj["message"])

        if response.error:
            raise Exception(response.message)
        
        ids: List[int] = response.value

        return ids
        
    def __divide_train_test(self, ids: List[int]) -> Tuple[List[int], List[int]]:        
        if self.sample_limit > len(ids):
            raise Exception("not enough samples in the database")

        random.shuffle(ids)
        ids = ids[:self.sample_limit]

        n: int = len(ids)
           
        train_set: List[int] = ids[ : int(n * (self.train_relative_size / 100))]
        test_set: List[int] = ids[int(n * (self.train_relative_size / 100)) : ]

        return train_set, test_set
        
    def __divide_to_batches(self, id_set: List[int]) -> List[List[int]]:
        batches: List[List[int]] = []
        curr: int = 0

        while curr * self.batch_size < len(id_set):
            batch: List[int] = id_set[curr * self.batch_size : min((curr + 1) * self.batch_size, len(id_set))]

            batches.append(batch)

        return batches

    def __validate_requirements(self) -> None:
        if self.train_relative_size + self.test_relative_size != 100:
            raise Exception("the train + test relative sizes should be 100 percent")
        
        if self.epochs < 1:
            raise Exception("the number of epochs should be al least 1")
        
        if self.batches_size < 1:
            raise Exception("the size of a batch should be at least 1")
        
        if self.sample_limit < 1:
            raise Exception("the limit on samples should be greater or equal to 0")

    def hasNext(self) -> bool:
        return self.curr_epoch < self.epochs
        





