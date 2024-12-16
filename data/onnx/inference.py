# Install required libraries
# pip install onnxruntime transformers numpy

import onnxruntime as ort
import numpy as np
from transformers import DistilBertTokenizer

# Step 1: Load the ONNX Model
onnx_model_path = "distilbert_model.onnx"  # Path to your ONNX file
session = ort.InferenceSession(onnx_model_path)

# Step 2: Load the Tokenizer
tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")

# Step 3: Prepare Input Text
input_text = "You are so dumb and useless!"

# Tokenize the input text for ONNX
inputs = tokenizer(
    input_text,
    truncation=True,
    padding="max_length",
    max_length=128,
    return_tensors="np"  # Convert to numpy arrays for ONNX
)

# Step 4: Prepare Input Dictionary for ONNX
ort_inputs = {
    "input_ids": inputs["input_ids"],
    "attention_mask": inputs["attention_mask"],
}

# Step 5: Run Inference
outputs = session.run(None, ort_inputs)  # Pass the inputs to the ONNX model
logits = outputs[0]  # Get raw outputs (logits)

# Step 6: Convert Logits to Probabilities
# Apply softmax to calculate probabilities
probs = np.exp(logits) / np.sum(np.exp(logits), axis=1, keepdims=True)
toxicity_score = probs[0][1]  # Assuming class 1 is Toxic

# Step 7: Classify as Toxic or Not Toxic
classification = "Toxic" if toxicity_score >= 0.5 else "Not Toxic"

# Step 8: Display Results
print(f"Input Text: {input_text}")
print(f"Toxicity Score: {toxicity_score:.2f}")
print(f"Classification: {classification}")