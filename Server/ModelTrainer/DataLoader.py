from typing import List


class DataLoader:

    def __init__(self, train_relative_size: int, test_relative_size: int, epochs_number: int, batches_number: int):
        self.train_relative_size: int = train_relative_size
        self.test_relative_size: int = test_relative_size
        self.epochs_number: int = epochs_number
        self.batches_number: int = batches_number
        
        self.batches: List[List[int]] = None
        self.curr_batch: int = -1
        self.curr_epoch: int = -1







