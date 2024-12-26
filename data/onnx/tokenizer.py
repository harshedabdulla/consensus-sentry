from transformers import AutoTokenizer

# Load the tokenizer
tokenizer = AutoTokenizer.from_pretrained('distilbert-base-uncased')

# Save it
tokenizer.save_pretrained('tokenizer')