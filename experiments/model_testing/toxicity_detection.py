# Import necessary libraries
from datasets import load_dataset
from transformers import DistilBertForSequenceClassification, DistilBertTokenizer
from transformers import Trainer, TrainingArguments
import torch

# Load dataset
dataset = load_dataset("jigsaw_toxicity_pred")

# Load pre-trained model and tokenizer
model = DistilBertForSequenceClassification.from_pretrained('distilbert-base-uncased', num_labels=2)
tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')

# Preprocess the dataset (tokenization)
def preprocess(data):
    return tokenizer(data["text"], truncation=True, padding=True)

tokenized_data = dataset.map(preprocess, batched=True)

# Set up training arguments
training_args = TrainingArguments(
    output_dir='./results', 
    evaluation_strategy="epoch",
    per_device_train_batch_size=16,
    num_train_epochs=3
)

# Initialize Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_data['train'],
    eval_dataset=tokenized_data['test']
)

# Train the model
trainer.train()

# Evaluate the model
results = trainer.evaluate(tokenized_data['test'])
print(results)

# Save the model in ONNX format
dummy_input = torch.zeros((1, 512), dtype=torch.long)
torch.onnx.export(model, dummy_input, "distilbert_toxicity.onnx", input_names=["input_ids"], output_names=["output"])