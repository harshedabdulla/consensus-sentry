import json
import requests
import numpy as np
from sentence_transformers import SentenceTransformer

# API endpoint
API_URL = "https://toxic-classifier-api-936459055446.us-central1.run.app/predict"

# Load rules from storage
with open('rules.json', 'r') as f:
    rules_data = json.load(f)
    rules = rules_data['rules']

# Load a sentence transformer model
print("Loading sentence transformer model...")
model = SentenceTransformer('all-MiniLM-L6-v2')  # Small, fast model

# Pre-compute embeddings for rule examples
print("Computing rule embeddings...")
rule_embeddings = {}
for rule in rules:
    rule_embeddings[rule['id']] = {
        'examples': [model.encode(ex) for ex in rule['examples']],
        'threshold': rule.get('threshold', 0.75)  # Similarity threshold
    }

def check_rules(input_text):
    # Quick keyword check first (faster)
    for rule in rules:
        for keyword in rule.get('keywords', []):
            if keyword.lower() in input_text.lower():
                print(f"Keyword match: {keyword}")
                return True, rule['response']
    
    # Semantic check for more nuanced matching
    input_embedding = model.encode(input_text)
    
    for rule_id, data in rule_embeddings.items():
        for i, example_embedding in enumerate(data['examples']):
            similarity = np.dot(input_embedding, example_embedding) / (
                np.linalg.norm(input_embedding) * np.linalg.norm(example_embedding)
            )
            if similarity > data['threshold']:
                rule_info = next(r for r in rules if r['id'] == rule_id)
                example = rule_info['examples'][i]
                print(f"Semantic match with example: '{example}' (similarity: {similarity:.4f})")
                return True, rule_info['response']
    
    return False, None

def call_toxic_classifier(text):
    try:
        response = requests.post(API_URL, json={"text": text})
        if response.status_code == 200:
            return response.json()
        else:
            print(f"API error: {response.status_code} - {response.text}")
            return {"error": f"API error: {response.status_code}"}
    except Exception as e:
        print(f"Request error: {str(e)}")
        return {"error": str(e)}

def process_request(user_input):
    print(f"\nProcessing: '{user_input}'")
    
    # Check rules first
    violates_rule, response = check_rules(user_input)
    if violates_rule:
        print(f"Rule violation detected. Response: {response}")
        return response
    
    # If passes rules, use toxic classifier API
    print("No rule violations, calling toxic classifier API...")
    classifier_response = call_toxic_classifier(user_input)
    print(f"Classifier response: {classifier_response}")
    
    # You might want to add additional logic based on the classifier response
    return classifier_response

# Test examples
test_inputs = [
    "Hello, how are you today?",
    "u are an idiot!",
    "Who should I vote for in the next election?",
    "Tell me about artificial intelligence",
    "Which stocks should I buy to get rich quick?",
    "What do you think about the new healthcare policies?",
    "The president is doing a terrible job",
    "Talk about machine learning algorithms"
]

print("Starting tests...")
for test_input in test_inputs:
    result = process_request(test_input)
    print(f"Final result: {result}\n" + "-"*50)