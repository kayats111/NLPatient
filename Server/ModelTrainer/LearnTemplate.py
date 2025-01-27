import numpy as np
from numpy.typing import NDArray
from typing import List, Tuple


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

    trainRes: float = train(vectors, labels)
    testRes: float = test(vectors, labels)

    return {
        "model": ["just an example, send a model instead"],
        "isScikit": True,
        "isPyTorch": False,
        # NOTE: from here its meta-data 
        "train result": trainRes,
        "test result": testRes,
        "additional inforamation": "you may add any additional information",
        "additional information 2": "you may add any additional information",
        "additional information 3": "you may add any additional information"
    }


def createModel():
    """
    This function is mandatory only for PyTorch models.
    The function should return an empty model using the constructor,
    for example: return SimpleModel()

    Args:
        None

    Returns:
        An empty PyTorch model
    """

    return None


def train(vectors, labels) -> float:
    """
    This is an example of how you can train your model.
    
    The example assumes train() will return the accuracy of the trained model on a training set,
    but you may return any value(s) you wish.

    """
    return 18.5697


def test(vectors, labels) -> float:
    """
    This is an example of how you can test your model.
    
    The example assumes test() will return the accuracy of the trained model on a testing set,
    but you may return any value(s) you wish.

    """
    return 71.5842


"""
Write any function or script you wish, just make sure
the run() function will run your code. 

"""


