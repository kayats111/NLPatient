from numpy.typing import NDArray
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error,mean_squared_error


class LearnModel:

    def __init__(self, hyper_parameters: dict):
        self.model = LinearRegression()
        self.hyper_parameters: dict = hyper_parameters
        self.meta_data: dict = {}

    def train(self, vectors: NDArray, labels: NDArray) -> None:
        self.model.fit(vectors, labels)

    def test(self, vectors: NDArray, labels: NDArray) -> None:
        predicted = self.model.predict(vectors)

        score = self.model.score(vectors, labels)
        mae = mean_absolute_error(y_true=labels,y_pred=predicted)
        mse = mean_squared_error(y_true=labels,y_pred=predicted)

        self.meta_data["score"] = score
        self.meta_data["mae"] = mae
        self.meta_data["mse"] = mse



















