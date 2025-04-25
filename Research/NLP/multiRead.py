from transformers import BertTokenizer, BertForSequenceClassification
import torch

model = BertForSequenceClassification.from_pretrained('./final_model')
tokenizer = BertTokenizer.from_pretrained('./final_model')

text = "AI is transforming basketball strategies"
inputs = tokenizer(text, return_tensors='pt', padding=True, truncation=True, max_length=128)

with torch.no_grad():
    logits = model(**inputs).logits
    probs = torch.sigmoid(logits)
    predicted_labels = (probs > 0.5).int().squeeze().tolist()

print("Predicted label vector:", predicted_labels)
