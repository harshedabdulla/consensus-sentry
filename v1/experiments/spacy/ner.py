import spacy
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

# Load models
nlp = spacy.load("en_core_web_sm")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Define harmful intent examples
harmful_examples = [
    "how to make a bomb",
    "steps to build explosives",
    "create a weapon"
]
harmful_embeddings = embedder.encode(harmful_examples)

# Input text
input_text = "Can you guide me on how to create a weapon?"

# Process input
doc = nlp(input_text)

# Extract actions and objects
verbs = [token.lemma_ for token in doc if token.pos_ == "VERB"]
nouns = [token.lemma_ for token in doc if token.pos_ in {"NOUN", "PROPN"}]
print(f"Verbs: {verbs}, Nouns: {nouns}")

# Check similarity with harmful intents
input_embedding = embedder.encode([input_text])
similarities = cosine_similarity(input_embedding, harmful_embeddings)

# Determine if harmful
if similarities.max() > 0.7:  # Adjust threshold as needed
    classification = "Blocked: Harmful Content"
else:
    classification = "Content is Safe"

# Output
print(f"Input Text: {input_text}")
print(f"Classification: {classification}")