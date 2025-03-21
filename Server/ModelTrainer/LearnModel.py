from numpy.typing import NDArray
from typing import List

# This class will be run by the system, follow its guidelines.
class LearnModel:

    def __init__(self):
        self.model = None  # put here a new model, for example: KNeighborsRegressor(n_neighbors=5) from Scikit-Learn

        # only one of those should be true
        self.is_scikit: bool = False
        self.is_pytorch: bool = False

        # use this field to add any metadata you would like, keep in mind that is_scikit and is_pytorch are saved automatically
        self.meta_data: dict = {}

    














