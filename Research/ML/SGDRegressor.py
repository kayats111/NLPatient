from numpy.typing import NDArray
from sklearn.linear_model import SGDRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_squared_error


class LearnModel:

    def __init__(self, hyper_parameters: dict):
        self.model = MultiOutputRegressor(SGDRegressor(max_iter=hyper_parameters["max_iter"], alpha=hyper_parameters["alpha"],
                                                       learning_rate=hyper_parameters["learning_rate"],
                                                       random_state=hyper_parameters["random_state"],
                                                       loss=hyper_parameters["loss"]))
        self.hyper_parameters: dict = hyper_parameters
        self.meta_data: dict = {}

        # max_iter=1000, alpha=0.0001, learning_rate='invscaling', random_state=42, loss='squared_error'

    def train(self, vectors: NDArray, labels: NDArray) -> None:
        self.model.fit(vectors, labels)

    def test(self, vectors: NDArray, labels: NDArray) -> None:
        predicted = self.model.predict(vectors)
        mse = mean_squared_error(labels, predicted)

        self.meta_data["mse"] = mse















