from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
import torch
import nltk

# Path to the saved model
model_path = "./final_model"

# Load the tokenizer and model
tokenizer = DistilBertTokenizer.from_pretrained(model_path)
model = DistilBertForSequenceClassification.from_pretrained(model_path)

# Set model to evaluation mode
model.eval()

# Define a toxicity threshold (e.g., 0.7)
TOXICITY_THRESHOLD = 0.7

# Example Rule Enforcement Engine (REE) function
def rule_enforcement_engine(sentence):
    # Simple rule-based checks (expand as needed)
    rules = [
        lambda x: "spam" not in x.lower(),  # Example rule: reject sentences containing 'spam'
        lambda x: len(x.split()) > 2        # Example rule: reject very short sentences
    ]
    for rule in rules:
        if not rule(sentence):
            return False
    return True

# Function to get toxicity scores
def get_toxicity_score(sentences):
    inputs = tokenizer(sentences, truncation=True, padding="max_length", max_length=128, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
    probabilities = torch.softmax(outputs.logits, dim=-1)  # Convert logits to probabilities
    toxicity_scores = probabilities[:, 1]  # Probability of being toxic (index 1)
    return toxicity_scores

# Loop to predict and apply REE
flag = 0
while flag == 0:
    # Input sentence
    str1 = input("Enter the sentence to check: ")
    
    # Get toxicity score
    toxicity_score = get_toxicity_score([str1])[0].item()
    print(f"Toxicity Score: {toxicity_score:.2f}")

    # Check against threshold
    if toxicity_score > TOXICITY_THRESHOLD:
        print(f"Input: {str1}\nPrediction: Toxic (Above threshold)")
        if not rule_enforcement_engine(str1):
            print("Content violates rules enforced by the REE.")
        else:
            print("Content passes REE checks.")
    else:
        print(f"Input: {str1}\nPrediction: Non-Toxic (Below threshold)")

    # Exit option
    flag = int(input("Press 1 if you want to exit, or 0 to continue: "))
