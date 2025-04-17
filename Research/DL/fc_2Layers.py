from numpy.typing import NDArray
import torch
import torch.nn as nn



class LearnModel:

    def __init__(self, hyper_parameters: dict):
        self.model = None
        self.hyper_parameters: dict = hyper_parameters
        self.meta_data: dict = {}

    def train(self, vectors: NDArray, labels: NDArray) -> None:
        pass

    def test(self, vectors: NDArray, labels: NDArray) -> None:
        pass



class fc():

    def __init__(self, hyper_parameters: dict):
        super(fc, self).__init__()

        self.fc1 = nn.Linear(hyper_parameters["input_size"], hyper_parameters["hidden_size"])
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hyper_parameters["hidden_size"], hyper_parameters["classes"])

        if "seed" in hyper_parameters:
            torch.manual_seed(hyper_parameters["seed"])
            torch.use_deterministic_algorithms(True)

    def forward(self, x):
        out = self.fc1(x)
        out = self.relu(out)
        out = self.fc2(out)

        return out
    















