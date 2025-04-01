from numpy.typing import NDArray
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.ensemble import RandomForestRegressor


class LearnModel:

    def __init__(self, hyper_parameters: dict):
        self.model = RandomForestRegressor(n_estimators=hyper_parameters["n_estimators"],
                                           random_state=hyper_parameters["random_state"],
                                           oob_score=hyper_parameters["oob_score"])
        self.hyper_parameters: dict = hyper_parameters
        self.meta_data: dict = {}

        # n_estimators=10, random_state=0, oob_score=True

    def train(self, vectors: NDArray, labels: NDArray) -> None:
        self.model.fit(vectors, labels)

    def test(self, vectors: NDArray, labels: NDArray) -> None:
        predicted = self.model.predict(vectors)

        oob_score = self.model.oob_score_
        mse = mean_squared_error(labels, predicted)
        r2 = r2_score(labels, predicted)

        self.meta_data["oob_score"] = oob_score
        self.meta_data["mse"] = mse
        self.meta_data["r2"] = r2















