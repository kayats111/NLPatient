from transformers import (
    BertTokenizer,
    BertForSequenceClassification,
    Trainer,
    TrainingArguments,
    DataCollatorWithPadding
)
from datasets import Dataset
import torch

# ✅ 1. Sample data (single-label: integers 0–2)
data = {
    'text': [
        "Football match result",
        "Stock market crashes",
        "New coach appointed",
        "Inflation is rising",
        "Local team wins game"
    ],
    'label': [0, 1, 0, 1, 0]  # 0: Sports, 1: Economics
}

# ✅ 2. Create HuggingFace Dataset
dataset = Dataset.from_dict(data)

# ✅ 3. Load tokenizer
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

# ✅ 4. Tokenize function
def tokenize(example):
    return tokenizer(example['text'], padding='max_length', truncation=True, max_length=128)

# ✅ 5. Tokenize and format dataset
tokenized_dataset = dataset.map(tokenize)
tokenized_dataset.set_format(type='torch', columns=['input_ids', 'attention_mask', 'label'])

# ✅ 6. Load model for 2 classes (Sports, Economics)
model = BertForSequenceClassification.from_pretrained('bert-base-uncased', num_labels=2)

# ✅ 7. Data collator (auto-padding)
data_collator = DataCollatorWithPadding(tokenizer=tokenizer, return_tensors="pt")

# ✅ 8. Training arguments
training_args = TrainingArguments(
    output_dir='./results',
    per_device_train_batch_size=2,
    num_train_epochs=3,
    logging_dir='./logs',
    logging_steps=1,
    report_to='none'
)

# ✅ 9. Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
    data_collator=data_collator
)

# ✅ 10. Train
trainer.train()

# ✅ 11. Test on a new example
test_text = "The stock exchange dropped again"
inputs = tokenizer(test_text, return_tensors='pt', truncation=True, padding=True)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model.to(device)
inputs = {k: v.to(device) for k, v in inputs.items()}

with torch.no_grad():
    logits = model(**inputs).logits
    predicted_class = torch.argmax(logits, dim=1).item()

print(f"\nText: {test_text}")
print(f"Predicted class: {predicted_class} ({'Economics' if predicted_class == 1 else 'Sports'})")



# TODO:
# save and read the model | batches |
