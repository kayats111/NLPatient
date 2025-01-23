import numpy as np
from numpy.typing import NDArray
from typing import List
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error,mean_squared_error


def run(vectors: NDArray, labels: NDArray, fields: List[str], labelNames: List[str]) -> dict:
    """
    From here you call functions to run your code.
    This is the "main" function, DO NOT delete it.
    Examples below.

    Args:
        vectors (NDArray[NDArray[float64]]): The Medical Records in vector form.
        labels (NDArray[NDArray[float64]]): The labels of the Medical Records.
        fields (List[str]): The requested fields of the Medical Records vectors.
        labelNames (List[str]): The requested labels of the Medical Records.
    
    Returns:
        dict: A dict that includes any data to save.
        Must include the trained model in "model" entry.
        Must include 'isScikit' and 'isPyTorch' flags.

    """

    X_train, X_test, y_train, y_test = train_test_split(vectors, labels, test_size = 0.2) 
    
    linReg = LinearRegression()
    
    train(linReg=linReg, X_train=X_train, y_train=y_train)
    score, mae, mse = test(linReg=linReg, X_test=X_test, y_test=y_test)


    return {
        "model": linReg,
        "isScikit": True,
        "isPyTorch": False,
        # NOTE: from here its meta-data 
        "score": score,
        "mae": mae,
        "mse": mse
    }


def train(linReg, X_train, y_train):
    linReg.fit(X_train, y_train)

def test(linReg, X_test, y_test):
    y_pred = linReg.predict(X_test)

    score = linReg.score(X_test, y_test)
    mae = mean_absolute_error(y_true=y_test,y_pred=y_pred)
    mse = mean_squared_error(y_true=y_test,y_pred=y_pred)

    return score, mae, mse






