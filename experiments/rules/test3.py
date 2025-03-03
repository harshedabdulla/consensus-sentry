import json
import numpy as np
import asyncio
from concurrent.futures import ThreadPoolExecutor
from sentence_transformers import SentenceTransformer
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import requests
import logging
import redis
import spacy
from typing import List
import nltk
from nltk.corpus import wordnet
from nltk.stem.porter import PorterStemmer
from Levenshtein import distance

# Download necessary NLTK data
nltk.download('wordnet', quiet=True)

# Configuration
MODEL_NAME = "all-mpnet-base-v2"  # Upgraded model for better accuracy
CACHE_SIZE = 1000
API_TIMEOUT = 5.0  # seconds
EDIT_DISTANCE_THRESHOLD = 1  # Maximum edit distance for fuzzy matching
SIMILARITY_THRESHOLD = 0.75  # Default semantic similarity threshold

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()
model = SentenceTransformer(MODEL_NAME)
executor = ThreadPoolExecutor(max_workers=4)
nlp = spacy.load("en_core_web_sm")
stemmer = PorterStemmer()
redis_client = redis.Redis(host='localhost', port=6379, db=0)  # Redis connection

# Load rules with caching
class RuleManager:
    def __init__(self):
        self.rules = []
        self.keyword_map = {}
        self.stemmed_keyword_map = {}
        self.rule_embeddings = {}

    def load_rules(self, filepath):
        """Load rules and precompute embeddings"""
        try:
            with open(filepath) as f:
                data = json.load(f)
                self.rules = data['rules']
                self._precompute()
            logger.info(f"Loaded {len(self.rules)} rules from {filepath}")
        except Exception as e:
            logger.error(f"Error loading rules: {str(e)}")
            raise

    def _precompute(self):
        """Precompute keyword map and embeddings"""
        self.keyword_map = {}
        self.stemmed_keyword_map = {}
        self.rule_embeddings = {}

        for rule in self.rules:
            # Expand keywords with synonyms
            expanded_keywords = set(rule.get('keywords', []))
            for kw in list(expanded_keywords):
                expanded_keywords.update(self.get_wordnet_synonyms(kw))

            # Create keyword index (original and stemmed)
            for kw in expanded_keywords:
                kw_lower = kw.lower()
                self.keyword_map.setdefault(kw_lower, []).append(rule['id'])
                
                # Add stemmed version
                stemmed_kw = stemmer.stem(kw_lower)
                self.stemmed_keyword_map.setdefault(stemmed_kw, []).append(rule['id'])

            # Semantic index for examples
            if 'examples' in rule:
                rule_embs = [model.encode(ex) for ex in rule['examples']]
                self.rule_embeddings[rule['id']] = {
                    'embeddings': rule_embs,
                    'threshold': rule.get('threshold', SIMILARITY_THRESHOLD)
                }
                
        logger.info(f"Precomputed {len(self.keyword_map)} keywords and {len(self.rule_embeddings)} rule embeddings")

    def get_wordnet_synonyms(self, word):
        """Get synonyms from WordNet"""
        synonyms = set()
        for syn in wordnet.synsets(word):
            for lemma in syn.lemmas():
                synonyms.add(lemma.name().lower())
        return synonyms

    def check_with_cache(self, text):
        """Check rules with Redis caching"""
        cache_key = f"cache:{hash(text)}"
        
        try:
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)
        except Exception as e:
            logger.warning(f"Redis error: {str(e)}")
            # Continue without caching if Redis fails

        result = self.full_check(text)
        
        try:
            redis_client.setex(cache_key, 300, json.dumps(result))  # Cache for 5 min
        except Exception as e:
            logger.warning(f"Redis caching error: {str(e)}")
            
        return result

    def check_fuzzy_keywords(self, word, max_distance=EDIT_DISTANCE_THRESHOLD):
        """Check if word is close to any keyword using edit distance"""
        matches = []
        for keyword in self.keyword_map:
            if distance(word, keyword) <= max_distance:
                rule_ids = self.keyword_map[keyword]
                for rule_id in rule_ids:
                    matches.append({
                        "rule_id": rule_id,
                        "type": "fuzzy_keyword",
                        "original": word,
                        "matched": keyword,
                        "distance": distance(word, keyword)
                    })
        return matches

    def full_check(self, text):
        """Perform full rule check (keyword + semantic + fuzzy)"""
        violations = []
        
        # Normalize and process text
        text_lower = text.lower()
        
        # Split into words for direct keyword matching
        words = text_lower.split()
        stemmed_words = [stemmer.stem(word) for word in words]
        
        # Apply spaCy for lemmatization
        doc = nlp(text_lower)
        lemmatized_words = [token.lemma_ for token in doc]
        
        # 1. Direct keyword check
        for word in words:
            if word in self.keyword_map:
                for rule_id in self.keyword_map[word]:
                    violations.append({
                        "rule_id": rule_id,
                        "type": "keyword",
                        "matched": word
                    })
        
        # 2. Stemmed keyword check
        for stemmed_word in stemmed_words:
            if stemmed_word in self.stemmed_keyword_map:
                for rule_id in self.stemmed_keyword_map[stemmed_word]:
                    violations.append({
                        "rule_id": rule_id,
                        "type": "stemmed_keyword",
                        "matched": stemmed_word
                    })
        
        # 3. Lemmatized keyword check
        for lemma in lemmatized_words:
            if lemma in self.keyword_map:
                for rule_id in self.keyword_map[lemma]:
                    violations.append({
                        "rule_id": rule_id,
                        "type": "lemma_keyword",
                        "matched": lemma
                    })
        
        # 4. Fuzzy keyword matching (if no exact matches found)
        if not violations:
            for word in words:
                fuzzy_matches = self.check_fuzzy_keywords(word)
                violations.extend(fuzzy_matches)
        
        # 5. Semantic similarity check 
        if not violations:  # Only if no keyword matches
            text_emb = model.encode(text)
            for rule_id, data in self.rule_embeddings.items():
                similarities = np.dot(data['embeddings'], text_emb) / (
                    np.linalg.norm(data['embeddings'], axis=1) * np.linalg.norm(text_emb)
                )
                max_sim = np.max(similarities)
                max_idx = np.argmax(similarities)
                if max_sim > data['threshold']:
                    # Find which example matched
                    rule_info = next((r for r in self.rules if r['id'] == rule_id), None)
                    example = rule_info['examples'][max_idx] if rule_info else "Unknown"
                    
                    violations.append({
                        "rule_id": rule_id,
                        "type": "semantic",
                        "similarity": float(max_sim),
                        "matched_example": example
                    })
        
        return {"violations": violations}

# Initialize rule manager
rule_manager = RuleManager()
rule_manager.load_rules('rules.json')

class InputRequest(BaseModel):
    text: str

@app.post("/check")
async def check_input(request: InputRequest):
    """Check if input violates rules"""
    try:
        logger.info(f"Checking text: {request.text[:50]}...")
        
        # Check rule violations first
        cached_result = rule_manager.check_with_cache(request.text)
        if cached_result["violations"]:
            # Get rule details for response
            rule_ids = set(v["rule_id"] for v in cached_result["violations"])
            rule_details = {}
            for rule_id in rule_ids:
                rule = next((r for r in rule_manager.rules if r['id'] == rule_id), None)
                if rule:
                    rule_details[rule_id] = {
                        "description": rule.get('description', ''),
                        "response": rule.get('response', 'This content violates our guidelines.')
                    }
            
            return {
                "status": "violation", 
                "rule_violations": cached_result["violations"], 
                "rule_details": rule_details,
                "message": "Rule violations detected."
            }

        # If no rule violations, check with toxic classifier
        llm_result = await check_llm_guardrails(request.text)
        if "error" in llm_result or "warning" in llm_result:
            return llm_result

        # Check toxicity levels
        toxicity_levels = {k: float(llm_result.get(k, 0)) for k in ["toxic", "obscene", "threat", "insult", "identity_hate", "severe_toxic"]}
        is_safe = all(value < 0.1 for value in toxicity_levels.values())

        return {
            "status": "safe" if is_safe else "unsafe", 
            "toxic_classifier": toxicity_levels, 
            "message": "Content is safe." if is_safe else "Content may be unsafe."
        }
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return {"error": "Processing failed", "details": str(e)}

async def check_llm_guardrails(text):
    """Calls toxic classifier API only when needed"""
    try:
        response = requests.post(
            "https://toxic-classifier-api-936459055446.us-central1.run.app/predict", 
            json={"text": text}, 
            timeout=API_TIMEOUT
        )
        if response.status_code == 200:
            return response.json()
        logger.warning(f"Toxic classifier API error: {response.status_code}")
        return {"warning": "Needs human review"}
    except Exception as e:
        logger.error(f"LLM Check Error: {str(e)}")
        return {"warning": "System busy, try again later"}

@app.post("/batch_check")
async def batch_check(requests: List[InputRequest], background_tasks: BackgroundTasks):
    """Process multiple texts in parallel"""
    tasks = [process_single(req.text) for req in requests]
    batch_results = await asyncio.gather(*tasks, return_exceptions=True)

    results = [
        {"text": requests[idx].text, "error": str(result)} 
        if isinstance(result, Exception) 
        else result 
        for idx, result in enumerate(batch_results)
    ]
    return {"results": results}

async def process_single(text: str):
    """Process a single text asynchronously"""
    cached_result = rule_manager.check_with_cache(text)
    if cached_result["violations"]:
        return {"text": text, "status": "violation", "violations": cached_result["violations"]}

    llm_result = await check_llm_guardrails(text)
    if "error" in llm_result or "warning" in llm_result:
        return {"text": text, "status": "warning", "details": llm_result}
        
    return {
        "text": text, 
        "status": "safe" if is_safe(llm_result) else "unsafe", 
        "toxic_scores": llm_result
    }

def is_safe(llm_result: dict) -> bool:
    """Check if all toxicity scores are below threshold"""
    thresholds = {
        "toxic": 0.1, 
        "obscene": 0.1, 
        "threat": 0.1, 
        "insult": 0.1, 
        "identity_hate": 0.1, 
        "severe_toxic": 0.1
    }
    return all(float(llm_result.get(k, 0)) < v for k, v in thresholds.items())

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "rules_loaded": len(rule_manager.rules)}

@app.get("/rules/stats")
async def rule_stats():
    """Get statistics about loaded rules"""
    return {
        "total_rules": len(rule_manager.rules),
        "total_keywords": len(rule_manager.keyword_map),
        "total_stemmed_keywords": len(rule_manager.stemmed_keyword_map),
        "total_rule_embeddings": len(rule_manager.rule_embeddings)
    }

if __name__ == "__main__":
    import uvicorn
    # Download NLTK data and load SpaCy model
    nltk.download('wordnet')
    # Start the server
    uvicorn.run(app, host="0.0.0.0", port=8000)