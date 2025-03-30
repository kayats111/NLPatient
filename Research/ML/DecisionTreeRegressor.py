from numpy.typing import NDArray
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_squared_error, r2_score

class LearnModel:

    def __init__(self, hyper_parameters: dict):
        self.model = DecisionTreeRegressor(random_state = 0)
        self.hyper_parameters: dict = hyper_parameters

        self.meta_data: dict = {}

    def train(self, vectors: NDArray, labels: NDArray) -> None:
        self.model.fit(vectors, labels)

    def test(self, vectors: NDArray, labels: NDArray) -> None:
        predicted = self.model.predict(vectors)
        mse = mean_squared_error(labels, predicted)
        r2 = r2_score(labels, predicted)

        self.meta_data["mse"] = mse
        self.meta_data["r2"] = r2





















