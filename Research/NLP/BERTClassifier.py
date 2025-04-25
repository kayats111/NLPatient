from typing import List
from transformers import (
    BertTokenizer,
    BertForSequenceClassification,
    Trainer,
    TrainingArguments,
    DataCollatorWithPadding
)
from datasets import Dataset
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import torch


class NLPTemplate:

    def __init__(self, hyper_parameters: dict):
        self.hyper_parameters: dict = hyper_parameters
        self.model = None

        self.metadata: dict = {}

        self.tokenizer = None

    def run_model(self, data: dict) -> None:
        dataset = Dataset.from_dict(data)

        self.tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")

        dataset = dataset.map(lambda example: self.tokenize(example))
        dataset.set_format(type="torch", columns=["input_ids", "attention_mask", "label"])

        split = dataset.train_test_split(test_size=self.hyper_parameters["test_size"], seed=self.hyper_parameters["seed"])
        train_dataset = split["train"]
        test_dataset = split["test"]

        self.model = BertForSequenceClassification.from_pretrained(
            "bert-base-uncased",
            num_labels=len(data["label"][0]),
            problem_type="multi_label_classification"
        )

        training_args = TrainingArguments(
            output_dir="./results",
            save_strategy="no",
            per_device_train_batch_size=self.hyper_parameters["batch_size"],
            num_train_epochs=self.hyper_parameters["epochs"],
            logging_dir="./logs",
            logging_steps=1,
            report_to="none"
        )

        trainer = Trainer(
            model=self.model,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=test_dataset,
            data_collator=DataCollatorWithPadding(lambda example: self.tokenize(example)),
            compute_metrics=lambda pred: self.compute_metrics(pred)
        )

        trainer.train()

        test_results = trainer.evaluate()

        self.metadata.update(test_results)  

    def save_model(self, save_dir: str) -> None:
        self.model.save_pretrained(save_dir)
        self.tokenizer.save_pretrained(save_dir)

    def load_model(self, save_dir: str) -> None:
        self.model = BertForSequenceClassification.from_pretrained(save_dir)
        self.tokenizer = BertTokenizer.from_pretrained(save_dir)

    def infer(self, text: str) -> List[float]:
        inputs = self.tokenizer(text, return_tensor="pt", padding=True, trunction=True, max_length=128)

        with torch.no_grad():
            logits = self.model(**inputs).logits
            probs = torch.sigmoid(logits)
            predicted_labels = (probs > 0.5).int().squeeze().tolist()

        return predicted_labels

    def tokenize(self, example):
        return self.tokenizer(example["text"], padding="max_length", trunction=True, max_length=128)

    def compute_metrics(self, pred):
        logits, labels = pred
        probs = torch.sigmoid(torch.tensor(logits))
        preds = (probs > 0.5).int().numpy()
        labels = labels.astype(int)

        precision, recall, f1, _ = precision_recall_fscore_support(
            labels, preds, average="micro", zero_division=0
        )
        acc = accuracy_score(labels, preds)

        return {
            "accuracy": acc,
            "precision": precision,
            "recall": recall,
            "f1": f1
        }

