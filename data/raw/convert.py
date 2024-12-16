import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification

# Path to the saved model
model_path = "./final_model"

# Load the tokenizer and model
tokenizer = DistilBertTokenizer.from_pretrained(model_path)
model = DistilBertForSequenceClassification.from_pretrained(model_path)

# Set the model to evaluation mode
model.eval()

# Create a dummy input for tracing
# This assumes the model expects input_ids and attention_mask as inputs
dummy_input = tokenizer(
    "This is a sample input for ONNX export.",
    truncation=True,
    padding="max_length",
    max_length=128,
    return_tensors="pt"
)

# Define input and output names for ONNX
input_names = ["input_ids", "attention_mask"]
output_names = ["output"]

# Export to ONNX
onnx_file_name = "distilbert_model.onnx"  # Save in the current directory
torch.onnx.export(
    model,                                  # Model to export
    (dummy_input["input_ids"], dummy_input["attention_mask"]),  # Example input tuple
    onnx_file_name,                        # Output ONNX file name
    input_names=input_names,               # Input tensor names
    output_names=output_names,             # Output tensor names
    dynamic_axes={                         # Dynamic axes for variable-length inputs
        "input_ids": {0: "batch_size", 1: "sequence_length"},
        "attention_mask": {0: "batch_size", 1: "sequence_length"},
        "output": {0: "batch_size"}
    },
    opset_version=14                        # ONNX opset version
)

print(f"ONNX model saved to {onnx_file_name}")