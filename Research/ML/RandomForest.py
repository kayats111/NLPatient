import numpy as np
from numpy.typing import NDArray
from typing import List
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.ensemble import RandomForestRegressor


def run(vectors: NDArray, labels: NDArray, fields: List[str], labelNames: List[str]) -> dict:

    X_train, X_test, y_train, y_test = train_test_split(vectors, labels, test_size=0.2, random_state=42)

    forest = RandomForestRegressor(n_estimators=10, random_state=0, oob_score=True)

    train(forest=forest, X_train=X_train, y_train=y_train)
    oob_score, mse, r2 = test(forest=forest, X_test=X_test, y_test=y_test)

    
    return {
        "model": forest,
        "isScikit": True,
        "isPyTorch": False,
        # NOTE: from here its meta-data 
        "oob score": oob_score,
        "mse": mse,
        "r2": r2
    }



def train(forest, X_train, y_train) -> float:
    forest.fit(X_train, y_train)


def test(forest, X_test, y_test) -> float:
    y_pred = forest.predict(X_test)

    oob_score = forest.oob_score_
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    return oob_score, mse, r2




