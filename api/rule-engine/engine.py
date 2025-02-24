import json
import numpy as np
from concurrent.futures import ThreadPoolExecutor
from sentence_transformers import SentenceTransformer
from fastapi import FastAPI
from pydantic import BaseModel
import requests
import logging
import os
import redis
import spacy
from fastapi import BackgroundTasks
from typing import List
import asyncio

'''
• FastAPI → Framework for building APIs.
• Pydantic → Used for data validation in API requests.
• SentenceTransformer → Loads a pre-trained semantic similarity model.
• Redis → Provides caching for rule checks.
• Spacy → Used for natural language processing (NLP) like tokenization and lemmatization.
• ThreadPoolExecutor → Enables parallel execution of tasks (for faster processing).
'''

# Configuration
MODEL_NAME = "all-MiniLM-L6-v2"
CACHE_SIZE = 1000
API_TIMEOUT = 3.0  # seconds

app = FastAPI()
model = SentenceTransformer(MODEL_NAME)
executor = ThreadPoolExecutor(max_workers=4)
nlp = spacy.load("en_core_web_sm")

# Load rules with caching
'''
• Stores rules in self.rules.
• self.keyword_map → Stores rules mapped to keywords (for quick lookup).
• self.rule_embeddings → Stores precomputed embeddings for semantic similarity checking.
• Connects to a Redis server (self.redis_client) → Used for caching results.
'''
class RuleManager:
    def __init__(self):
        self.rules = []
        self.keyword_map = {}
        self.rule_embeddings = {}
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)  # Redis connection
    
    '''
    • Reads rules from rules.json.
	• Calls _precompute() to prepare keyword-based and semantic rule checks.
    '''
    
    def load_rules(self, filepath):
        with open(filepath) as f:
            data = json.load(f)
            self.rules = data['rules']
            self._precompute()
    
    def _precompute(self):
        """Precompute all embeddings and indexes"""
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
    '''
    • First, checks Redis cache for existing results.
	• If not cached, runs full_check() to process the input.
	• Caches the result for 5 minutes.
    '''
    def check_with_cache(self, text):
        """Check rules with Redis caching"""
        cache_key = f"cache:{hash(text)}"
        
        # Check Redis cache first
        cached_result = self.redis_client.get(cache_key)
        if cached_result:
            return json.loads(cached_result)
        
        # Perform full check if not in cache
        result = self.full_check(text)
        
        # Cache the result for 5 minutes (300 seconds)
        self.redis_client.setex(cache_key, 300, json.dumps(result))
        return result
    
    def full_check(self, text):
        """Perform full rule check (keyword + semantic)"""
        violations = []
        
        # Keyword check
        text_lower = text.lower()
        for word in text_lower.split():
            if word in self.keyword_map:
                for rule_id in self.keyword_map[word]:
                    violations.append({
                        "rule_id": rule_id,
                        "type": "keyword",
                        "matched": word
                    })
        
        # Semantic check
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
    try:
        # Use Redis caching for rule checks
        cached_result = rule_manager.check_with_cache(request.text)
        if cached_result["violations"]:
            return {
                "status": "violation",
                "rule_violations": cached_result["violations"],
                "message": "Rule violations detected."
            }
        
        # Final LLM guardrail check
        llm_result = await check_llm_guardrails(request.text)
        if "error" in llm_result or "warning" in llm_result:
            return llm_result
        
        # Check toxicity levels
        toxicity_levels = {
            "toxic": float(llm_result.get("toxic", 0)),
            "obscene": float(llm_result.get("obscene", 0)),
            "threat": float(llm_result.get("threat", 0)),
            "insult": float(llm_result.get("insult", 0)),
            "identity_hate": float(llm_result.get("identity_hate", 0)),
            "severe_toxic": float(llm_result.get("severe_toxic", 0))
        }

        # Determine overall safety
        is_safe = all(value < 0.1 for value in toxicity_levels.values())
        
        return {
            "status": "safe" if is_safe else "unsafe",
            "rule_violations": [],
            "toxic_classifier": toxicity_levels,
            "message": "No rule violations detected. Content is safe." if is_safe else "Content may be unsafe."
        }
        
    except Exception as e:
        logging.error(f"Error processing request: {str(e)}")
        return {"error": "Processing failed"}
      

async def lemmatize(text):
    doc = nlp(text)
    return [token.lemma_ for token in doc]

async def check_keywords(text):
    """Fast trie-based keyword matching with lemmatization"""
    text_lower = text.lower()
    violations = []
    
    # Lemmatize the input text
    lemmatized_words = lemmatize(text_lower)
    
    # Lemmatize the keywords in the rule
    for word in lemmatized_words:
        for rule_id, keywords in rule_manager.keyword_map.items():
            lemmatized_keywords = lemmatize(" ".join(keywords))
            if word in lemmatized_keywords:
                violations.append({
                    "rule_id": rule_id,
                    "type": "keyword",
                    "matched": word
                })
    
    return violations

async def check_semantic(text):
    """Parallel semantic similarity check"""
    text_emb = model.encode(text)
    futures = []
    
    for rule_id, data in rule_manager.rule_embeddings.items():
        futures.append(
            executor.submit(
                check_rule_similarity,
                rule_id,
                text_emb,
                data['embeddings'],
                data['threshold']
            )
        )
    
    results = [f.result() for f in futures]
    return [r for r in results if r]

def check_rule_similarity(rule_id, text_emb, example_embs, threshold):
    """Vector similarity check with numpy"""
    similarities = np.dot(example_embs, text_emb) / (
        np.linalg.norm(example_embs, axis=1) * np.linalg.norm(text_emb)
    )
    max_sim = np.max(similarities)
    
    if max_sim > threshold:
        return {
            "rule_id": rule_id,
            "type": "semantic",
            "similarity": float(max_sim)
        }
    return None

async def check_llm_guardrails(text):
    try:
        response = requests.post(
            "https://toxic-classifier-api-936459055446.us-central1.run.app/predict",
            json={"text": text},
            timeout=API_TIMEOUT
        )
        if response.status_code == 200:
            return response.json()
        return {"warning": "Needs human review"}  
    except Exception as e:
        logging.error(f"LLM Check Error: {str(e)}")
        return {"warning": "System busy, try again later"}
    

async def process_single(text: str):
    """Process a single text asynchronously"""
    # Check cached rules
    cached_result = rule_manager.check_with_cache(text)
    if cached_result["violations"]:
        return {
            "text": text,
            "status": "violation",
            "violations": cached_result["violations"]
        }
    
    # Check LLM guardrails
    llm_result = await check_llm_guardrails(text)
    return {
        "text": text,
        "status": "safe" if is_safe(llm_result) else "unsafe",
        "toxic_scores": llm_result
    }

@app.post("/batch_check")
async def batch_check(
    requests: List[InputRequest], 
    background_tasks: BackgroundTasks
):
    """Process multiple texts in parallel"""
    results = []
    
    # Process in parallel using async
    tasks = [process_single(req.text) for req in requests]
    batch_results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Handle results
    for idx, result in enumerate(batch_results):
        if isinstance(result, Exception):
            results.append({
                "text": requests[idx].text,
                "error": str(result)
            })
        else:
            results.append(result)
    
    return {"results": results}

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
    return all(llm_result.get(k, 0) < v for k, v in thresholds.items())

async def check_semantic_batch(texts: List[str]):
    """Batch process semantic checks"""
    text_embs = model.encode(texts, batch_size=32)  # Batch encoding
    all_violations = []
    
    for text, emb in zip(texts, text_embs):
        futures = []
        for rule_id, data in rule_manager.rule_embeddings.items():
            futures.append(
                executor.submit(
                    check_rule_similarity,
                    rule_id,
                    emb,
                    data['embeddings'],
                    data['threshold']
                )
            )
        results = [f.result() for f in futures]
        all_violations.append([r for r in results if r])
    
    return all_violations