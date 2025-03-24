from numpy.typing import NDArray
from typing import List

# This class will be run by the system, follow its guidelines.
# Usage example with KNN is provided in comments
class LearnModel:

    def __init__(self):
        # put here a new model
        self.model = None  # KNN example: self.model = KNeighborsRegressor(n_neighbors=5) from Scikit-Learn

        # only one of those should be true
        self.is_scikit: bool = False
        self.is_pytorch: bool = False

        # use this field to add any metadata you would like, keep in mind that is_scikit and is_pytorch are saved automatically
        self.meta_data: dict = {}

        # add fields to your desire

    def train(vectors: NDArray, labels: NDArray) -> None:
        """
        This method will be used to train (or partially train) your model according to
        your preferences (train size, test size, batches, epochs) while using the system.
        One run of this method is equivalent to one run on a batch of the training set.
        If you do not have any batches or epochs, the model will be trained on all of
        the data in one run, once.

        Do not return anything from this method!
        If you wish to save some data at the end of its run, please use the meta_data
        field, or add fields as you desire.

        Args:
            vectors (NDArray[NDArray[float64]]): The Medical Records in vector form.
            labels (NDArray[NDArray[float64]]): The labels of the Medical Records.

        NOTE: if you DO NOT wish to train your model, please keep it as it is. DO NOT delete it!

        """

        # KNN example:
        # self.model.fit(vectors, labels)
        # self.meta_data["last mse"] = mean_squared_error(labels, self.model.predict(vectors))

    def test(vectors: NDArray, labels: NDArray) -> None:
        """
        This method will be used to test (or partially test) your model according to
        your preferences (train size, test size, batches, epochs) while using the system.
        One run of this method is equivalent to one run on a batch of the test set.
        If you do not have any batches or epochs, the model will be tested on all of
        the data in one run, once.

        Do not return anything from this method!
        If you wish to save some data at the end of its run, please use the meta_data
        field, or add fields as you desire.

        NOTE: if you DO NOT wish to test your model, please keep it as it is. DO NOT delete it!

        Args:
            vectors (NDArray[NDArray[float64]]): The Medical Records in vector form.
            labels (NDArray[NDArray[float64]]): The labels of the Medical Records.

        """
















