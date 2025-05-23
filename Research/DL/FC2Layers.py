from numpy.typing import NDArray
import torch
import torch.nn as nn


class LearnModel:

    def __init__(self, hyper_parameters: dict):
        self.model = FC2(hyper_parameters=hyper_parameters)
        self.hyper_parameters: dict = hyper_parameters
        self.meta_data: dict = {}

        self.criterion = nn.CrossEntropyLoss()
        self.optimizer = torch.optim.Adam(self.model.parameters(), lr=self.hyper_parameters["learning_rate"])
        self.meta_data["loss"] = 0
        self.meta_data["accuracy"] = 0

        self.correct = 0
        self.total = 0

    def train(self, vectors: NDArray, labels: NDArray) -> None:
        vectors = torch.from_numpy(vectors).float()
        labels = torch.from_numpy(labels).float()

        outputs = self.model(vectors)
        
        loss = self.criterion(outputs, labels)

        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

    def test(self, vectors: NDArray, labels: NDArray) -> None:
        vectors = torch.from_numpy(vectors).float()
        labels = torch.from_numpy(labels).float()

        with torch.no_grad():
            outputs = self.model(vectors)

            self.meta_data["loss"] = self.criterion(outputs, labels).item()

            predicted = outputs.detach().int()
            labels = labels.int()

            self.total += labels.size(0)

            correct_per_sample = (predicted == labels).all(dim=1)
            self.correct += correct_per_sample.sum().item()

            self.meta_data["accuracy"] = 100 * self.correct / self.total





class FC2(nn.Module):

    def __init__(self, hyper_parameters: dict):
        super(FC2, self).__init__()

        self.fc1 = nn.Linear(hyper_parameters["input_size"], hyper_parameters["hidden_1"])
        self.fc2 = nn.Linear(hyper_parameters["hidden_1"], hyper_parameters["hidden_2"])
        self.fc3 = nn.Linear(hyper_parameters["hidden_2"], hyper_parameters["output_size"])
        self.relu = nn.ReLU()

        if "seed" in hyper_parameters:
            torch.manual_seed(hyper_parameters["seed"])
            torch.use_deterministic_algorithms(True)

    def forward(self, x):
        out = self.fc1(x)
        out = self.relu(out)
        out = self.fc2(out)
        out = self.relu(out)
        out = self.fc3(out)

        return out
    















