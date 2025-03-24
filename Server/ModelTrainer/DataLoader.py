from typing import List, Tuple
from Response import Response
import requests
import random


class DataLoader:

    def __init__(self, fields: List[str] = None, labels: List[str] = None,
                 train_relative_size: int = 0, test_relative_size: int = 0, epochs_number: int = 0,
                 batches_number: int = 0):
        self.train_relative_size: int = train_relative_size
        self.test_relative_size: int = test_relative_size
        self.epochs_number: int = epochs_number
        self.batches_number: int = batches_number
        self.fields: List[str] = fields
        self.labels: List[str] = labels
        
        self.train_batches: List[List[int]] = None
        self.test_batches: List[List[int]] = None
        self.curr_train_batch: int = -1
        self.curr_test_batch: int = -1
        self.curr_epoch: int = -1

    def load(self) -> None:
        ids: List[int] = self.__fetch_ids()


        # divide to train-test
        # divide to batches
        # init indexes

        pass

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
        if self.train_relative_size + self.test_relative_size != 100:
            raise Exception("the train + test relative sizes should be 100 percent")

        random.shuffle(ids)

        n: int = len(ids)
           
        train_set: List[int] = ids[ : int(n * (self.train_relative_size / 100))]
        test_set: List[int] = ids[int(n * (self.train_relative_size / 100)) : ]

        return train_set, test_set
        
        

        





