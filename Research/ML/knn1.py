import numpy as np
from numpy.typing import NDArray
from typing import List
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_squared_error, r2_score


def run(vectors: NDArray, labels: NDArray, fields: List[str], labelNames: List[str]) -> dict:
    """
    From here you call functions to run your code.
    This is the "main" function, DO NOT delete it.
    Examples below.

    Args:
        data (NDArray[NDArray[float64]]): The Medical Records in vector form.
        fields (List[str]): The requested fields of the Medical Records vectors.
    
    Returns:
        dict: A dict that includes any data to save.
        Must include the trained model in "model" entry.
        Must include 'isScikit' and 'isPyTorch' flags.

    """

    X = vectors
    y = labels
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    knn = KNeighborsRegressor(n_neighbors=5)
    
    train(knn, X_train, y_train)
    y_pred = test(knn, X_test)

    mse, r2 = evaluate(y_test=y_test, y_pred=y_pred)

    return {
        "model": knn,
        "isScikit": True,
        "isPyTorch": False,
        # NOTE: from here its meta-data
        "train size": int(vectors.shape[0] * 0.8),
        "test size": int(vectors.shape[0] * 0.2),
        "MSE": mse,
        "R2": r2
    }


def train(knn, X_train, y_train):
    knn.fit(X_train, y_train)


def test(knn, X_test):
    y_pred = knn.predict(X_test)
    return y_pred


def evaluate(y_test, y_pred):
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    return mse, r2

"""
Write any function or script you wish, just make sure
the run() function will run your code. 

"""


