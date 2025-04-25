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

# 1. Simulated multi-label dataset
data = {
    'text': [
        "The team won the match",
        "The economy is shrinking",
        "Election results are in",
        "A new player was signed",
        "Stock prices are down",
        "The government passed a new bill",
        "Bitcoin hits new all-time high",
        "The tennis champion retired today",
        "Tech companies are launching AI products",
        "The central bank raised interest rates",
        "Football season is starting soon",
        "Major layoffs in the tech industry",
        "New tax laws affect small businesses",
        "Olympic games delayed due to weather",
        "Senate debates climate change policy"
    ],
    'label': [
        [1.0, 0.0, 0.0, 0.0, 0.0],  # Sports
        [0.0, 1.0, 0.0, 0.0, 1.0],  # Economics + Finance
        [0.0, 0.0, 1.0, 0.0, 0.0],  # Politics
        [1.0, 0.0, 0.0, 0.0, 0.0],  # Sports
        [0.0, 1.0, 0.0, 0.0, 1.0],  # Economics + Finance
        [0.0, 0.0, 1.0, 0.0, 0.0],  # Politics
        [0.0, 1.0, 0.0, 0.0, 1.0],  # Economics + Finance
        [1.0, 0.0, 0.0, 0.0, 0.0],  # Sports
        [0.0, 0.0, 0.0, 1.0, 0.0],  # Tech
        [0.0, 1.0, 0.0, 0.0, 1.0],  # Economics + Finance
        [1.0, 0.0, 0.0, 0.0, 0.0],  # Sports
        [0.0, 1.0, 0.0, 1.0, 0.0],  # Economics + Tech
        [0.0, 1.0, 0.0, 0.0, 1.0],  # Economics + Finance
        [1.0, 0.0, 0.0, 0.0, 0.0],  # Sports
        [0.0, 0.0, 1.0, 0.0, 0.0]   # Politics
    ]
}


# 2. Dataset creation with correct label types
dataset = Dataset.from_dict(data)

# 3. Tokenization
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

def tokenize(example):
    return tokenizer(example['text'], padding='max_length', truncation=True, max_length=128)

dataset = dataset.map(tokenize)
dataset.set_format(type='torch', columns=['input_ids', 'attention_mask', 'label'])

# 4. Split dataset
split = dataset.train_test_split(test_size=0.2, seed=42)
train_dataset = split['train']
test_dataset = split['test']

# 5. Model setup
model = BertForSequenceClassification.from_pretrained(
    'bert-base-uncased',
    num_labels=5,
    problem_type='multi_label_classification'
)

# 6. Evaluation metrics
def compute_metrics(pred):
    logits, labels = pred
    probs = torch.sigmoid(torch.tensor(logits))
    preds = (probs > 0.5).int().numpy()
    labels = labels.astype(int)

    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, preds, average='micro', zero_division=0
    )
    acc = accuracy_score(labels, preds)

    return {
        'accuracy': acc,
        'precision': precision,
        'recall': recall,
        'f1': f1
    }

# 7. Training arguments
training_args = TrainingArguments(
    output_dir='./results',
    save_strategy="no",
    per_device_train_batch_size=2,
    num_train_epochs=3,
    logging_dir='./logs',
    logging_steps=1,
    report_to='none'
)

# 8. Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
    data_collator=DataCollatorWithPadding(tokenizer),
    compute_metrics=compute_metrics
)

# 9. Train & evaluate
trainer.train()
eval_result = trainer.evaluate()
print("\nEvaluation metrics:")
print(eval_result)

# 10. Inference (optional)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model.to(device)

test_text = "The market is crashing and the election is near"
inputs = tokenizer(test_text, return_tensors='pt', padding=True, truncation=True, max_length=128)
inputs = {k: v.to(device) for k, v in inputs.items()}

with torch.no_grad():
    logits = model(**inputs).logits
    probs = torch.sigmoid(logits)
    predicted_labels = (probs > 0.5).int().squeeze()

print(f"\nText: {test_text}")
print(f"Predicted labels: {predicted_labels.tolist()}")

model.save_pretrained('./final_model')
tokenizer.save_pretrained('./final_model')

print("model is saved")
