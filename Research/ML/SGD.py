import numpy as np
from numpy.typing import NDArray
from typing import List
from sklearn.linear_model import SGDRegressor
from sklearn.model_selection import train_test_split
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_squared_error


def run(vectors: NDArray, labels: NDArray, fields: List[str], labelNames: List[str]) -> dict:
    
    X_train, X_test, y_train, y_test = train_test_split(vectors, labels, test_size=0.2, random_state=42)
    
    sgd_regressor = MultiOutputRegressor(SGDRegressor(
    max_iter=1000, alpha=0.0001, learning_rate='invscaling',
    random_state=42, loss='squared_error'))

    train(sgd_regressor=sgd_regressor, X_train=X_train, y_train=y_train)
    mse = test(sgd_regressor=sgd_regressor, X_test=X_test, y_test=y_test)

    return {
        "model": sgd_regressor,
        "isScikit": True,
        "isPyTorch": False,
        # NOTE: from here its meta-data 
        "mse": mse
    }


def train(sgd_regressor, X_train, y_train):
    sgd_regressor.fit(X_train, y_train)

def test(sgd_regressor, X_test, y_test):
    y_pred = sgd_regressor.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)

    return mse

