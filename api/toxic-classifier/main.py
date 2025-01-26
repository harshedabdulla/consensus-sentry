import os
from fastapi import FastAPI
from pydantic import BaseModel
import onnxruntime
from transformers import DistilBertTokenizer
import numpy as np

# Load the tokenizer
tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')

# Load the ONNX model
model_path = "toxic_classifier.onnx"
session = onnxruntime.InferenceSession(model_path)

# Define the input schema
class TextInput(BaseModel):
    text: str

# Initialize FastAPI app
app = FastAPI()

# Define the prediction endpoint
@app.post("/predict")
def predict(input: TextInput):
    # Tokenize the input text
    inputs = tokenizer(
        input.text,
        truncation=True,
        padding='max_length',
        max_length=128,
        return_tensors='np'
    )
    
    # Run inference
    output = session.run(['output'], {
        'input_ids': inputs['input_ids'],
        'attention_mask': inputs['attention_mask']
    })[0]
    
    # Map output to categories
    categories = ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate']
    sorted_results = sorted(zip(categories, output[0]), key=lambda x: x[1], reverse=True)[:2]
    return {k: f"{v:.3f}" for k, v in sorted_results}

# Get the port from the environment variable (default to 8080 for Cloud Run)
port = int(os.getenv("PORT", 8080))

# Run the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=port)