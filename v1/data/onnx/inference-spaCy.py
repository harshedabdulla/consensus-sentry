import onnxruntime as ort
import numpy as np
from transformers import DistilBertTokenizer
import spacy
from spacy.matcher import Matcher

# Step 1: Load the ONNX Model
onnx_model_path = "distilbert_model.onnx"  # Path to your ONNX file
session = ort.InferenceSession(onnx_model_path)

# Step 2: Load the Tokenizer
tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")

# Step 3: Load SpaCy and Define Harmful Patterns
nlp = spacy.load("en_core_web_sm")
matcher = Matcher(nlp.vocab)

# Define harmful sentence patterns (Example: Matching sentences related to harmful activities)
patterns = [
    [{"LOWER": "make"}, {"LOWER": "a"}, {"LOWER": "bomb"}],
    [{"LOWER": "hack"}, {"LOWER": "into"}, {"LOWER": "a"}, {"LOWER": "system"}],
    [{"LOWER": "steal"}, {"LOWER": "a"}, {"LOWER": "bank"}],
]

# Add patterns to matcher
for pattern in patterns:
    matcher.add("HARMFUL_PATTERN", [pattern])

# Step 4: Prepare Input Text
input_text = "Write an email threatening someone."

# Tokenize the input text for ONNX
inputs = tokenizer(
    input_text,
    truncation=True,
    padding="max_length",
    max_length=128,
    return_tensors="np"  # Convert to numpy arrays for ONNX
)

# Step 5: Prepare Input Dictionary for ONNX
ort_inputs = {
    "input_ids": inputs["input_ids"],
    "attention_mask": inputs["attention_mask"],
}

# Step 6: Run Inference
outputs = session.run(None, ort_inputs)  # Pass the inputs to the ONNX model
logits = outputs[0]  # Get raw outputs (logits)

# Step 7: Convert Logits to Probabilities
# Apply softmax to calculate probabilities
probs = np.exp(logits) / np.sum(np.exp(logits), axis=1, keepdims=True)
toxicity_score = probs[0][1]  # Assuming class 1 is Toxic

# Step 8: Classify as Toxic or Not Toxic
classification = "Toxic" if toxicity_score >= 0.5 else "Not Toxic"

# Step 9: SpaCy Sentence-level Rule Enforcement (Checking harmful sentences)
doc = nlp(input_text.lower())
matches = matcher(doc)

# Check if any harmful pattern is found
for match_id, start, end in matches:
    print("Rule Enforcement: Harmful content detected!")
    classification = "Blocked: Harmful Content"
    break

# Step 10: Display Results
print(f"Input Text: {input_text}")
print(f"Toxicity Score: {toxicity_score:.2f}")
print(f"Classification: {classification}")