from typing import List


class NLPTemplate:

    def __init__(self, hyper_parameters: dict):
        self.hyper_parameters: dict = hyper_parameters
        self.model = None

        self.metadata: dict = {}

        # add any additional fields you would like to

    def run_model(self, data: dict) -> None:
        """
        Here you can write anything regarding to training and testing the model.

        Remember to assign the model to self.model, and to save any metadata
        you would like to self.metadata.
        NOTE: when creating TrainingArguments:
                output_dir='./results'
                save_strategy="no",
                logging_dir='./logs',
                logging_steps=1,
                report_to='none'

            That will make sure the model works as expected

        Args:
            data (dict): the data to train and test the model on.
                         data is in the form:
                         {
                            "text": ["str1", "str2", ...]
                            "label": [[1.0, 2.0, 2.0, 2.0], [2.0, 1.0, 2.0, 2.0], ...]
                         }

        """

    def save_model(self, save_dir: str) -> None:
        """
        Here you will need to save the model according to the specification of
        model type you are using.

        The model must be saved to save_dir.
        save_dir contains the name of the model - you do not need to add it.

        Args:
            save_dir (str): The directory where the model will be saved.
        """

    def load_model(self, save_dir: str) -> None:
        """
        This method will be used by the system to load the model (and tokenizer)
        after training to use it for inference.

        Load the model from save_dir. save_dir includes the name of the model at
        the end of the string, so you do not need to add anything to the string.

        NOTE: at the end of the method, remember to assign the model to self.model.

        Args:
            save_dir (str): The directory where the model is saved.
        """

    def infer(self, text: str) -> List[float]:
        """
        Use this method to infer the label of the text with your model.
        Remenber to return the result as a list.

        Args:
            text (str): the text for infering.

        Returns:
            List[float]: a list containing the inference.
        """

