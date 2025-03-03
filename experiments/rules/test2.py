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
from nltk.corpus import wordnet

# Configuration
MODEL_NAME = "all-mpnet-base-v2"  # Upgraded model for better accuracy
CACHE_SIZE = 1000
API_TIMEOUT = 5.0  # seconds

app = FastAPI()
model = SentenceTransformer(MODEL_NAME)
executor = ThreadPoolExecutor(max_workers=4)
nlp = spacy.load("en_core_web_sm")
redis_client = redis.Redis(host='localhost', port=6379, db=0)  # Redis connection

# Load rules with caching
class RuleManager:
    def __init__(self):
        self.rules = []
        self.keyword_map = {}
        self.rule_embeddings = {}

    def load_rules(self, filepath):
        """Load rules and precompute embeddings"""
        with open(filepath) as f:
            data = json.load(f)
            self.rules = data['rules']
            self._precompute()

    def _precompute(self):
        """Precompute keyword map and embeddings"""
        self.keyword_map = {}
        self.rule_embeddings = {}

        for rule in self.rules:
            # Keyword index
            for kw in rule.get('keywords', []):
                self.keyword_map.setdefault(kw.lower(), []).append(rule['id'])

            # Semantic index
            if 'examples' in rule:
                rule_embs = [model.encode(ex) for ex in rule['examples']]
                self.rule_embeddings[rule['id']] = {
                    'embeddings': rule_embs,
                    'threshold': rule.get('threshold', 0.75)
                }

    def check_with_cache(self, text):
        """Check rules with Redis caching"""
        cache_key = f"cache:{hash(text)}"
        
        cached_result = redis_client.get(cache_key)
        if cached_result:
            return json.loads(cached_result)

        result = self.full_check(text)
        redis_client.setex(cache_key, 300, json.dumps(result))  # Cache for 5 min
        return result

    def full_check(self, text):
        """Perform full rule check (keyword + semantic)"""
        violations = []
        
        # Apply lemmatization
        doc = nlp(text.lower())
        lemmatized_words = [token.lemma_ for token in doc]

        # Keyword check with lemmatization
        for word in lemmatized_words:
            if word in self.keyword_map:
                for rule_id in self.keyword_map[word]:
                    violations.append({
                        "rule_id": rule_id,
                        "type": "keyword",
                        "matched": word
                    })
        
        # Semantic similarity check (unchanged)
        text_emb = model.encode(text)
        for rule_id, data in self.rule_embeddings.items():
            similarities = np.dot(data['embeddings'], text_emb) / (
                np.linalg.norm(data['embeddings'], axis=1) * np.linalg.norm(text_emb)
            )
            max_sim = np.max(similarities)
            if max_sim > data['threshold']:
                violations.append({
                    "rule_id": rule_id,
                    "type": "semantic",
                    "similarity": float(max_sim)
                })
        
        return {"violations": violations}

rule_manager = RuleManager()
rule_manager.load_rules('rules.json')

class InputRequest(BaseModel):
    text: str

@app.post("/check")
async def check_input(request: InputRequest):
    """Check if input violates rules"""
    try:
        cached_result = rule_manager.check_with_cache(request.text)
        if cached_result["violations"]:
            return {"status": "violation", "rule_violations": cached_result["violations"], "message": "Rule violations detected."}

        # Final LLM guardrail check
        llm_result = await check_llm_guardrails(request.text)
        if "error" in llm_result or "warning" in llm_result:
            return llm_result

        # Check toxicity levels
        toxicity_levels = {k: float(llm_result.get(k, 0)) for k in ["toxic", "obscene", "threat", "insult", "identity_hate", "severe_toxic"]}
        is_safe = all(value < 0.1 for value in toxicity_levels.values())

        return {"status": "safe" if is_safe else "unsafe", "toxic_classifier": toxicity_levels, "message": "Content is safe." if is_safe else "Content may be unsafe."}
    except Exception as e:
        logging.error(f"Error processing request: {str(e)}")
        return {"error": "Processing failed"}

async def check_llm_guardrails(text):
    """Calls model only when needed"""
    try:
        response = requests.post("https://toxic-classifier-api-936459055446.us-central1.run.app/predict", json={"text": text}, timeout=API_TIMEOUT)
        if response.status_code == 200:
            return response.json()
        return {"warning": "Needs human review"}
    except Exception as e:
        logging.error(f"LLM Check Error: {str(e)}")
        return {"warning": "System busy, try again later"}

def get_wordnet_synonyms(word):
    """Get synonyms from WordNet"""
    synonyms = set()
    for syn in wordnet.synsets(word):
        for lemma in syn.lemmas():
            synonyms.add(lemma.name())
    return synonyms

async def check_semantic(text):
    """Parallel semantic similarity check"""
    text_emb = model.encode(text)
    tasks = [executor.submit(check_rule_similarity, rule_id, text_emb, data['embeddings'], data['threshold']) for rule_id, data in rule_manager.rule_embeddings.items()]
    results = [f.result() for f in tasks]
    return [r for r in results if r]

def check_rule_similarity(rule_id, text_emb, example_embs, threshold):
    """Vector similarity check with numpy"""
    similarities = np.dot(example_embs, text_emb) / (
        np.linalg.norm(example_embs, axis=1) * np.linalg.norm(text_emb)
    )
    max_sim = np.max(similarities)

    if max_sim > threshold:
        return {"rule_id": rule_id, "type": "semantic", "similarity": float(max_sim)}
    return None

@app.post("/batch_check")
async def batch_check(requests: List[InputRequest], background_tasks: BackgroundTasks):
    """Process multiple texts in parallel"""
    tasks = [process_single(req.text) for req in requests]
    batch_results = await asyncio.gather(*tasks, return_exceptions=True)

    results = [{"text": requests[idx].text, "error": str(result)} if isinstance(result, Exception) else result for idx, result in enumerate(batch_results)]
    return {"results": results}

async def process_single(text: str):
    """Process a single text asynchronously"""
    cached_result = rule_manager.check_with_cache(text)
    if cached_result["violations"]:
        return {"text": text, "status": "violation", "violations": cached_result["violations"]}

    llm_result = await check_llm_guardrails(text)
    return {"text": text, "status": "safe" if is_safe(llm_result) else "unsafe", "toxic_scores": llm_result}

def is_safe(llm_result: dict) -> bool:
    """Check if all toxicity scores are below threshold"""
    thresholds = {"toxic": 0.1, "obscene": 0.1, "threat": 0.1, "insult": 0.1, "identity_hate": 0.1, "severe_toxic": 0.1}
    return all(llm_result.get(k, 0) < v for k, v in thresholds.items())