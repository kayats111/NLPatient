import numpy as np
from numpy.typing import NDArray
from typing import List
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score


def run(vectors: NDArray, labels: NDArray, fields: List[str], labelNames: List[str]) -> dict:

    X_train, X_test, y_train, y_test = train_test_split(vectors, labels, test_size=0.2, random_state=42)

    tree = DecisionTreeRegressor(random_state = 0)

    train(tree=tree, X_train=X_train, y_train=y_train)
    mse, r2 = test(tree=tree, X_test=X_test, y_test=y_test)
    

    return {
        "model": tree,
        "isScikit": True,
        "isPyTorch": False,
        # NOTE: from here its meta-data 
        "mse": mse,
        "r2": r2
    }




def train(tree, X_train, y_train) -> float:
    tree.fit(X_train, y_train)

def test(tree, X_test, y_test) -> float:
    y_pred = tree.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    return mse, r2 



