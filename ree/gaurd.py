import json
import numpy as np
import asyncio
from concurrent.futures import ThreadPoolExecutor
from sentence_transformers import SentenceTransformer
from fastapi import FastAPI, BackgroundTasks, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import requests
import logging
import redis
import spacy
from typing import List, Dict, Any, Optional, Set
import nltk
from nltk.corpus import wordnet
from nltk.stem.porter import PorterStemmer
from Levenshtein import distance
import time
import os
import hashlib
import re
from functools import lru_cache

# Environment configuration with defaults
MODEL_NAME = os.getenv("EMBEDDING_MODEL", "all-mpnet-base-v2")
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)
RULES_PATH = os.getenv("RULES_PATH", "rules.json")
API_TIMEOUT = float(os.getenv("API_TIMEOUT", "5.0"))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
TOXIC_CLASSIFIER_URL = os.getenv("TOXIC_CLASSIFIER_URL", 
                               "https://toxic-classifier-api-936459055446.us-central1.run.app/predict")
CACHE_EXPIRY = int(os.getenv("CACHE_EXPIRY", "300"))  # 5 minutes
MAX_WORKERS = int(os.getenv("MAX_WORKERS", "4"))

# Set up logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Constants for guardrail parameters
DEFAULT_SIMILARITY_THRESHOLD = 0.75
DEFAULT_TOXICITY_THRESHOLD = 0.1
DEFAULT_EDIT_DISTANCE_THRESHOLD = 2
MIN_WORD_LENGTH_FOR_FUZZY = 4
MAX_EDIT_DISTANCE_RATIO = 0.3  # Max edit distance as a ratio of word length

# Common words to exclude from fuzzy matching to prevent false positives
COMMON_WORDS_WHITELIST = {
    "the", "and", "for", "are", "this", "that", "with", "have", "from", 
    "your", "been", "they", "will", "would", "could", "about", "what", 
    "when", "where", "love", "like", "does", "into", "should", "their",
    "here", "than", "then", "some", "very", "just", "much", "only", "also",
    "over", "back", "more", "such", "well", "even", "must", "most", "make",
    "case", "good", "work", "life", "time", "year", "hand", "part", "fact",
    "look", "want", "give", "come", "take", "know", "find", "need", "tell",
    "help", "show", "talk", "form", "days", "week", "both", "last", "next",
    "high", "long", "left", "done", "best", "sure", "each", "name", "ever",
    "live", "felt", "plan", "game", "kind", "move", "keep", "mean", "made",
    "same", "real", "seen", "mind", "home", "line", "says", "read", "area",
    "went", "stop", "feel", "seem", "open", "miss", "heat", "care", "door"
}

app = FastAPI(title="Content Guardrail API", 
              description="A production-grade content moderation system",
              version="2.0.0")

# Add CORS middleware for cross-domain API access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize necessary components
try:
    model = SentenceTransformer(MODEL_NAME)
    executor = ThreadPoolExecutor(max_workers=MAX_WORKERS)
    nlp = spacy.load("en_core_web_sm")
    stemmer = PorterStemmer()
    
    # Initialize Redis with error handling and fallback
    try:
        redis_client = redis.Redis(
            host=REDIS_HOST, 
            port=REDIS_PORT, 
            db=REDIS_DB,
            password=REDIS_PASSWORD,
            socket_timeout=2.0,  # Short timeout to fail fast if Redis is down
            decode_responses=False
        )
        redis_client.ping()  # Test connection
        logger.info("Redis connection established")
        use_redis = True
    except Exception as e:
        logger.warning(f"Redis connection failed: {str(e)}. Running without cache.")
        use_redis = False
        
    # Download necessary NLTK data
    nltk.download('wordnet', quiet=True)
    
    logger.info(f"Initialized with model: {MODEL_NAME}")
except Exception as e:
    logger.critical(f"Initialization error: {str(e)}")
    raise RuntimeError(f"Critical initialization error: {str(e)}")

# Data models
class InputRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Text to analyze")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Optional context data")

class BatchRequest(BaseModel):
    items: List[InputRequest] = Field(..., min_items=1, max_items=100)
    
class Violation(BaseModel):
    rule_id: str
    type: str
    matched: str
    confidence: float = 1.0
    details: Optional[Dict[str, Any]] = None

class ContentCheckResponse(BaseModel):
    status: str
    message: str
    violations: Optional[List[Violation]] = None
    metadata: Optional[Dict[str, Any]] = None
    rule_details: Optional[Dict[str, Dict[str, str]]] = None
    request_id: str

# Rule manager with improved accuracy
class RuleManager:
    def __init__(self):
        self.rules = []
        self.keyword_map = {}
        self.stemmed_keyword_map = {}
        self.rule_embeddings = {}
        self.rule_patterns = {}
        self.last_reload_time = 0
        self.min_word_length_for_fuzzy = MIN_WORD_LENGTH_FOR_FUZZY
        self.whitelist = COMMON_WORDS_WHITELIST

    def load_rules(self, filepath, force_reload=False):
        """Load rules with modification time checking and precompute embeddings"""
        try:
            # Check if file has been modified
            if os.path.exists(filepath):
                current_mtime = os.path.getmtime(filepath)
                if not force_reload and current_mtime <= self.last_reload_time:
                    return  # File hasn't changed, no need to reload
                
                with open(filepath) as f:
                    data = json.load(f)
                    self.rules = data.get('rules', [])
                    
                    # Load optional configuration
                    config = data.get('config', {})
                    self.min_word_length_for_fuzzy = config.get('min_word_length_for_fuzzy', MIN_WORD_LENGTH_FOR_FUZZY)
                    whitelist_additions = set(config.get('whitelist', []))
                    self.whitelist = COMMON_WORDS_WHITELIST.union(whitelist_additions)
                    
                    self._precompute()
                    self.last_reload_time = current_mtime
                    
                logger.info(f"Loaded {len(self.rules)} rules from {filepath}")
            else:
                logger.error(f"Rules file not found: {filepath}")
                # Load empty rules to continue operating
                self.rules = []
                self._precompute()
        except Exception as e:
            logger.error(f"Error loading rules: {str(e)}")
            # Don't raise - continue with existing rules if any

    def _precompute(self):
        """Precompute indices for efficient matching"""
        self.keyword_map = {}
        self.stemmed_keyword_map = {}
        self.rule_embeddings = {}
        self.rule_patterns = {}

        for rule in self.rules:
            rule_id = rule.get('id')
            if not rule_id:
                logger.warning(f"Rule missing ID, skipping: {rule}")
                continue
                
            # Process keywords with improved handling
            self._process_keywords(rule)
            
            # Process regex patterns if present
            if 'patterns' in rule:
                try:
                    compiled_patterns = []
                    for pattern in rule['patterns']:
                        compiled_patterns.append(re.compile(pattern, re.IGNORECASE))
                    self.rule_patterns[rule_id] = compiled_patterns
                except Exception as e:
                    logger.error(f"Error compiling regex for rule {rule_id}: {str(e)}")
            
            # Process embeddings for semantic matching
            if 'examples' in rule and rule['examples']:
                try:
                    rule_embs = [model.encode(ex) for ex in rule['examples']]
                    self.rule_embeddings[rule_id] = {
                        'embeddings': rule_embs,
                        'threshold': rule.get('threshold', DEFAULT_SIMILARITY_THRESHOLD),
                        'examples': rule['examples']
                    }
                except Exception as e:
                    logger.error(f"Error creating embeddings for rule {rule_id}: {str(e)}")
                    
        logger.info(f"Precomputed {len(self.keyword_map)} keywords, {len(self.rule_patterns)} " 
                   f"patterns, and {len(self.rule_embeddings)} rule embeddings")

    def _process_keywords(self, rule):
        """Process and expand keywords with improved handling"""
        rule_id = rule.get('id')
        if not rule_id:
            return
            
        keywords = rule.get('keywords', [])
        if not keywords:
            return
            
        # Get rule category for better organization
        category = rule.get('category', 'general')
        
        # Track expanded keywords to avoid duplication
        expanded_keywords = set()
        
        # Process each keyword
        for kw in keywords:
            # Skip if too short
            if len(kw) < 2:
                continue
                
            # Add original keyword
            kw_lower = kw.lower().strip()
            expanded_keywords.add(kw_lower)
            
            # Add synonyms with limit on number
            if rule.get('expand_synonyms', False):
                synonyms = self.get_wordnet_synonyms(kw_lower)
                # Limit number of synonyms to avoid overexpansion
                for syn in list(synonyms)[:5]:  
                    if len(syn) >= 3:  # Only add synonyms of reasonable length
                        expanded_keywords.add(syn)
        
        # Add keywords to indices
        for kw in expanded_keywords:
            if kw in self.whitelist:
                continue  # Skip whitelisted common words
                
            # Original keyword map
            self.keyword_map.setdefault(kw, []).append({
                'rule_id': rule_id,
                'category': category
            })
            
            # Stemmed keyword map
            stemmed_kw = stemmer.stem(kw)
            if stemmed_kw != kw and len(stemmed_kw) >= 3:
                self.stemmed_keyword_map.setdefault(stemmed_kw, []).append({
                    'rule_id': rule_id,
                    'category': category,
                    'original': kw
                })

    def get_wordnet_synonyms(self, word):
        """Get synonyms from WordNet with better filtering"""
        synonyms = set()
        try:
            for syn in wordnet.synsets(word)[:3]:  # Limit to first 3 synsets
                for lemma in syn.lemmas()[:3]:  # Limit to first 3 lemmas
                    synonym = lemma.name().lower().replace('_', ' ')
                    # Only add if reasonably similar and not the same
                    if synonym != word and len(synonym) >= 3:
                        synonyms.add(synonym)
            return synonyms
        except Exception as e:
            logger.warning(f"Error getting synonyms for {word}: {str(e)}")
            return set()

    def check_with_cache(self, text):
        """Check rules with caching"""
        if not text or not text.strip():
            return {"violations": []}
            
        # Create a deterministic hash for the cache key
        cache_key = f"guard:{hashlib.md5(text.encode()).hexdigest()}"
        
        # Try to get from cache if Redis is available
        if use_redis:
            try:
                cached_result = redis_client.get(cache_key)
                if cached_result:
                    return json.loads(cached_result)
            except Exception as e:
                logger.warning(f"Redis get error: {str(e)}")
        
        # Perform the full check
        result = self.full_check(text)
        
        # Cache the result if Redis is available
        if use_redis:
            try:
                redis_client.setex(cache_key, CACHE_EXPIRY, json.dumps(result))
            except Exception as e:
                logger.warning(f"Redis set error: {str(e)}")
            
        return result

    def check_fuzzy_keywords(self, word):
        """Improved fuzzy keyword matching with length-dependent threshold"""
        if not word or len(word) < self.min_word_length_for_fuzzy:
            return []  # Skip short words entirely

        matches = []
        word_lower = word.lower()
        
        # Skip common words
        if word_lower in self.whitelist:
            return []
        
        # Dynamic threshold based on word length
        max_distance = min(
            DEFAULT_EDIT_DISTANCE_THRESHOLD, 
            int(len(word_lower) * MAX_EDIT_DISTANCE_RATIO)
        )
        
        # If word is very short, require exact match
        if len(word_lower) < 4:
            max_distance = 0
            
        # Check against keyword dictionary
        for keyword in self.keyword_map:
            # Skip if keyword is too different in length
            if abs(len(keyword) - len(word_lower)) > max_distance:
                continue
                
            # Calculate edit distance
            edit_dist = distance(word_lower, keyword)
            
            # Only match if within threshold
            if edit_dist <= max_distance:
                confidence = 1.0 - (edit_dist / max(len(keyword), 1))
                
                # Higher threshold for shorter words
                min_confidence = 0.7 if len(word_lower) < 5 else 0.6
                
                if confidence >= min_confidence:
                    for rule_info in self.keyword_map[keyword]:
                        matches.append({
                            "rule_id": rule_info['rule_id'],
                            "type": "fuzzy_keyword",
                            "original": word_lower,
                            "matched": keyword,
                            "confidence": round(confidence, 2),
                            "category": rule_info['category']
                        })
        
        return matches

    def full_check(self, text):
        """Perform comprehensive rule checking with improved accuracy"""
        violations = []
        processed_violations = set()  # Track processed violations to avoid duplication
        
        # Normalize and process text
        text_lower = text.lower()
        text_clean = re.sub(r'[^\w\s]', ' ', text_lower)  # Replace punctuation with space
        
        # Apply spaCy for better NLP processing
        doc = nlp(text_lower)
        
        # Extract important components
        words = [token.text for token in doc if not token.is_stop and token.text.strip()]
        lemmas = [token.lemma_ for token in doc if not token.is_stop and token.lemma_.strip()]
        tokens_with_pos = [(token.text, token.pos_) for token in doc]
        
        # 1. Check regex patterns first (most specific)
        for rule_id, patterns in self.rule_patterns.items():
            for pattern in patterns:
                matches = pattern.finditer(text_lower)
                for match in matches:
                    match_text = match.group(0)
                    if match_text:
                        violation_key = f"{rule_id}:pattern:{match_text}"
                        if violation_key not in processed_violations:
                            violations.append({
                                "rule_id": rule_id,
                                "type": "pattern",
                                "matched": match_text,
                                "confidence": 1.0
                            })
                            processed_violations.add(violation_key)
        
        # 2. Direct keyword check
        for word in words:
            if word in self.keyword_map:
                for rule_info in self.keyword_map[word]:
                    violation_key = f"{rule_info['rule_id']}:keyword:{word}"
                    if violation_key not in processed_violations:
                        violations.append({
                            "rule_id": rule_info['rule_id'],
                            "type": "keyword",
                            "matched": word,
                            "confidence": 1.0,
                            "category": rule_info['category']
                        })
                        processed_violations.add(violation_key)
        
        # 3. Lemmatized keyword check (only if no exact matches for the word)
        for lemma in lemmas:
            if lemma in self.keyword_map:
                for rule_info in self.keyword_map[lemma]:
                    violation_key = f"{rule_info['rule_id']}:lemma:{lemma}"
                    if violation_key not in processed_violations:
                        violations.append({
                            "rule_id": rule_info['rule_id'],
                            "type": "lemma_keyword",
                            "matched": lemma,
                            "confidence": 0.95,
                            "category": rule_info['category']
                        })
                        processed_violations.add(violation_key)
        
        # 4. Stemmed keyword check
        stemmed_words = [stemmer.stem(word) for word in words]
        for stemmed_word in stemmed_words:
            if stemmed_word in self.stemmed_keyword_map:
                for rule_info in self.stemmed_keyword_map[stemmed_word]:
                    violation_key = f"{rule_info['rule_id']}:stemmed:{stemmed_word}"
                    if violation_key not in processed_violations:
                        violations.append({
                            "rule_id": rule_info['rule_id'],
                            "type": "stemmed_keyword",
                            "matched": stemmed_word,
                            "confidence": 0.9,
                            "details": {"original_keyword": rule_info.get('original', stemmed_word)},
                            "category": rule_info['category']
                        })
                        processed_violations.add(violation_key)
        
        # 5. Fuzzy keyword matching (only if no exact matches and text isn't too short)
        if len(violations) == 0 and len(text_clean) >= 4:
            for word in words:
                if len(word) >= self.min_word_length_for_fuzzy and word not in self.whitelist:
                    fuzzy_matches = self.check_fuzzy_keywords(word)
                    for match in fuzzy_matches:
                        violation_key = f"{match['rule_id']}:fuzzy:{word}:{match['matched']}"
                        if violation_key not in processed_violations:
                            violations.append(match)
                            processed_violations.add(violation_key)
        
        # 6. Semantic similarity check (only if no keyword matches and text is substantial)
        if len(violations) == 0 and len(text_clean.split()) >= 3:
            try:
                text_emb = model.encode(text_lower)
                for rule_id, data in self.rule_embeddings.items():
                    similarities = np.dot(data['embeddings'], text_emb) / (
                        np.linalg.norm(data['embeddings'], axis=1) * np.linalg.norm(text_emb)
                    )
                    max_sim = np.max(similarities)
                    max_idx = np.argmax(similarities)
                    
                    if max_sim > data['threshold']:
                        # Find which example matched
                        example = data['examples'][max_idx] if max_idx < len(data['examples']) else "Unknown"
                        
                        violation_key = f"{rule_id}:semantic:{max_idx}"
                        if violation_key not in processed_violations:
                            violations.append({
                                "rule_id": rule_id,
                                "type": "semantic",
                                "confidence": float(max_sim),
                                "matched": "semantic similarity",
                                "details": {
                                    "similarity": float(max_sim),
                                    "matched_example": example
                                }
                            })
                            processed_violations.add(violation_key)
            except Exception as e:
                logger.warning(f"Semantic matching error: {str(e)}")
        
        # Sort violations by confidence
        violations = sorted(violations, key=lambda x: x.get('confidence', 0), reverse=True)
        
        # Limit to top violations
        return {"violations": violations[:10]}  # Limit to prevent overload

# Initialize rule manager
rule_manager = RuleManager()

# Dependency to ensure rules are loaded
def get_rule_manager():
    """Dependency that ensures rules are loaded before handling requests"""
    global rule_manager
    # Auto-reload rules if needed
    rule_manager.load_rules(RULES_PATH)
    return rule_manager

def generate_request_id():
    """Generate a unique request ID"""
    timestamp = int(time.time() * 1000)
    random_part = os.urandom(4).hex()
    return f"{timestamp}-{random_part}"

@app.post("/check", response_model=ContentCheckResponse)
async def check_input(
    request: InputRequest,
    request_obj: Request,
    rule_manager: RuleManager = Depends(get_rule_manager)
):
    """Check if input violates content guidelines"""
    start_time = time.time()
    request_id = generate_request_id()
    
    try:
        logger.info(f"RequestID {request_id}: Checking text: {request.text[:50]}...")
        
        # Check if input is empty
        if not request.text or not request.text.strip():
            return ContentCheckResponse(
                status="invalid",
                message="Input text is empty or whitespace",
                request_id=request_id
            )
            
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
            
            # Get highest confidence violation for logging
            top_violation = cached_result["violations"][0]
            logger.info(f"RequestID {request_id}: Violation found - Rule {top_violation['rule_id']}, "
                       f"Type {top_violation['type']}, Match '{top_violation['matched']}'")
            
            return ContentCheckResponse(
                status="violation",
                violations=cached_result["violations"],  # Fixed field name to match model
                rule_details=rule_details,
                message="Content policy violation detected",
                request_id=request_id,
                metadata={
                    "processing_time_ms": int((time.time() - start_time) * 1000)
                }
            )

        # If no rule violations, check with toxic classifier
        try:
            llm_result = await check_llm_guardrails(request.text)
            
            if "error" in llm_result:
                logger.warning(f"RequestID {request_id}: Classifier error: {llm_result['error']}")
                return ContentCheckResponse(
                    status="warning",
                    message="Content requires human review (classifier error)",
                    request_id=request_id,
                    metadata={
                        "processing_time_ms": int((time.time() - start_time) * 1000),
                        "classifier_error": llm_result['error']
                    }
                )
                
            # Check toxicity levels
            toxicity_levels = {
                k: float(llm_result.get(k, 0)) 
                for k in ["toxic", "obscene", "threat", "insult", "identity_hate", "severe_toxic"]
            }
            
            toxicity_threshold = DEFAULT_TOXICITY_THRESHOLD
            
            # Calculate max toxicity
            max_toxicity = max(toxicity_levels.values())
            max_category = max(toxicity_levels.items(), key=lambda x: x[1])[0]
            
            is_safe = max_toxicity < toxicity_threshold
            
            status = "safe" if is_safe else "unsafe"
            message = (
                "Content is safe." if is_safe 
                else f"Content may be unsafe (detected {max_category}: {max_toxicity:.2f})"
            )
            
            processing_time = int((time.time() - start_time) * 1000)
            logger.info(f"RequestID {request_id}: Status {status}, " 
                       f"Processing time {processing_time}ms")
            
            return ContentCheckResponse(
                status=status,
                message=message,
                request_id=request_id,
                metadata={
                    "processing_time_ms": processing_time,
                    "toxicity_scores": toxicity_levels
                }
            )
                
        except Exception as e:
            # Fall back to safe if classifier fails
            logger.error(f"RequestID {request_id}: Classifier error: {str(e)}")
            return ContentCheckResponse(
                status="warning",
                message="Content requires human review (fallback)",
                request_id=request_id,
                metadata={
                    "processing_time_ms": int((time.time() - start_time) * 1000),
                    "error": str(e)
                }
            )
            
    except Exception as e:
        logger.error(f"RequestID {request_id}: Processing error: {str(e)}")
        return ContentCheckResponse(
            status="error",
            message="Processing failed",
            request_id=request_id,
            metadata={"error": str(e)}
        )

async def check_llm_guardrails(text):
    """Calls toxic classifier API with better error handling and retries"""
    def attempt_request():
        try:
            response = requests.post(
                TOXIC_CLASSIFIER_URL,
                json={"text": text},
                timeout=API_TIMEOUT
            )
            if response.status_code == 200:
                return response.json()
            logger.warning(f"Toxic classifier API error: {response.status_code}")
            return {"error": f"API error: {response.status_code}"}
        except requests.exceptions.Timeout:
            return {"error": "Classifier API timeout"}
        except Exception as e:
            return {"error": f"Classifier error: {str(e)}"}
    
    # First attempt
    result = await asyncio.to_thread(attempt_request)
    
    # Retry once on error
    if "error" in result:
        logger.info("Retrying classifier request after error")
        result = await asyncio.to_thread(attempt_request)
    
    return result

@app.post("/batch_check")
async def batch_check(
    request: BatchRequest,
    background_tasks: BackgroundTasks,
    rule_manager: RuleManager = Depends(get_rule_manager)
):
    """Process multiple texts in parallel with improved handling"""
    start_time = time.time()
    batch_id = generate_request_id()
    
    try:
        logger.info(f"BatchID {batch_id}: Processing {len(request.items)} items")
        
        # Create tasks for all items
        tasks = []
        for idx, item in enumerate(request.items):
            # Generate individual request IDs
            item_id = f"{batch_id}-{idx}"
            tasks.append(process_single(item.text, item.context, item_id, rule_manager))
        
        # Execute in parallel
        batch_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results, handling exceptions
        results = []
        for idx, result in enumerate(batch_results):
            if isinstance(result, Exception):
                item_text = request.items[idx].text
                display_text = item_text[:50] + "..." if len(item_text) > 50 else item_text
                logger.error(f"Error processing item {idx} '{display_text}': {str(result)}")
                results.append({
                    "status": "error",
                    "message": f"Processing error: {str(result)}",
                    "request_id": f"{batch_id}-{idx}"
                })
            else:
                results.append(result)
        
        processing_time = int((time.time() - start_time) * 1000)
        logger.info(f"BatchID {batch_id}: Completed in {processing_time}ms")
        
        return {
            "batch_id": batch_id,
            "results": results,
            "total_items": len(request.items),
            "processing_time_ms": processing_time
        }
    except Exception as e:
        logger.error(f"Batch processing error: {str(e)}")
        return {
            "batch_id": batch_id,
            "error": str(e),
            "status": "error",
            "processing_time_ms": int((time.time() - start_time) * 1000)
        }

async def process_single(text: str, context: Optional[Dict[str, Any]], request_id: str, rule_manager: RuleManager):
    """Process a single text item with improved handling"""
    try:
        # Check if input is empty or too short
        if not text or not text.strip():
            return {
                "status": "invalid",
                "message": "Input text is empty",
                "request_id": request_id
            }
            
        # Check rule violations first
        result = rule_manager.check_with_cache(text)
        
        if result["violations"]:
            # Get rule details for the response
            rule_ids = set(v["rule_id"] for v in result["violations"])
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
                "violations": result["violations"],
                "rule_details": rule_details,
                "message": "Content policy violation detected",
                "request_id": request_id
            }
        
        # If no rule violations, check with toxic classifier
        try:
            llm_result = await check_llm_guardrails(text)
            
            if "error" in llm_result:
                logger.warning(f"RequestID {request_id}: Classifier error: {llm_result['error']}")
                return {
                    "status": "warning",
                    "message": "Content requires human review (classifier error)",
                    "request_id": request_id,
                    "metadata": {
                        "classifier_error": llm_result['error']
                    }
                }
                
            # Check toxicity levels
            toxicity_levels = {
                k: float(llm_result.get(k, 0)) 
                for k in ["toxic", "obscene", "threat", "insult", "identity_hate", "severe_toxic"]
            }
            
            toxicity_threshold = DEFAULT_TOXICITY_THRESHOLD
            
            # Calculate max toxicity
            max_toxicity = max(toxicity_levels.values())
            max_category = max(toxicity_levels.items(), key=lambda x: x[1])[0]
            
            is_safe = max_toxicity < toxicity_threshold
            
            status = "safe" if is_safe else "unsafe"
            message = (
                "Content is safe." if is_safe 
                else f"Content may be unsafe (detected {max_category}: {max_toxicity:.2f})"
            )
            
            return {
                "status": status,
                "message": message,
                "request_id": request_id,
                "metadata": {
                    "toxicity_scores": toxicity_levels
                }
            }
                
        except Exception as e:
            # Fall back to safe if classifier fails
            logger.error(f"RequestID {request_id}: Classifier error: {str(e)}")
            return {
                "status": "warning",
                "message": "Content requires human review (fallback)",
                "request_id": request_id,
                "metadata": {
                    "error": str(e)
                }
            }
    except Exception as e:
        logger.error(f"Error processing item {request_id}: {str(e)}")
        raise e  # Let the batch handler catch this

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        status = {
            "status": "healthy",
            "timestamp": time.time(),
            "version": app.version,
            "rule_count": len(rule_manager.rules),
            "services": {
                "redis": "available" if use_redis else "unavailable"
            }
        }
        
        # Try to ping the classifier API
        try:
            response = requests.get(
                TOXIC_CLASSIFIER_URL.replace('/predict', '/health'),
                timeout=1.0
            )
            status["services"]["classifier"] = (
                "available" if response.status_code == 200 else 
                f"error: {response.status_code}"
            )
        except Exception as e:
            status["services"]["classifier"] = f"error: {str(e)}"
            
        return status
    except Exception as e:
        return {
            "status": "degraded",
            "error": str(e)
        }

@lru_cache(maxsize=1)
def get_rule_descriptions():
    """Return all rule descriptions for documentation"""
    try:
        rule_manager.load_rules(RULES_PATH, force_reload=True)
        return [
            {
                "id": rule.get('id'),
                "description": rule.get('description', 'No description'),
                "category": rule.get('category', 'general')
            }
            for rule in rule_manager.rules
        ]
    except Exception as e:
        logger.error(f"Error getting rule descriptions: {str(e)}")
        return [{"error": str(e)}]

@app.get("/rules")
async def list_rules():
    """List all available rules"""
    return {
        "rules": get_rule_descriptions(),
        "total": len(rule_manager.rules),
        "last_updated": rule_manager.last_reload_time
    }

@app.post("/reload_rules")
async def reload_rules():
    """Endpoint to force reload rules from file"""
    try:
        rule_manager.load_rules(RULES_PATH, force_reload=True)
        # Clear the cache
        get_rule_descriptions.cache_clear()
        return {
            "status": "success",
            "message": f"Reloaded {len(rule_manager.rules)} rules",
            "timestamp": time.time()
        }
    except Exception as e:
        logger.error(f"Error reloading rules: {str(e)}")
        return {
            "status": "error",
            "message": f"Failed to reload rules: {str(e)}",
            "timestamp": time.time()
        }

# Load rules on startup
@app.on_event("startup")
async def startup_event():
    """Initialize rules when app starts"""
    try:
        rule_manager.load_rules(RULES_PATH)
        logger.info(f"Loaded {len(rule_manager.rules)} rules on startup")
    except Exception as e:
        logger.error(f"Error loading rules on startup: {str(e)}")

# Clean up on shutdown
@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources"""
    try:
        executor.shutdown(wait=False)
        if use_redis:
            redis_client.close()
        logger.info("Cleanup completed on shutdown")
    except Exception as e:
        logger.error(f"Error during shutdown: {str(e)}")

# Main entry point
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    log_level = os.getenv("LOG_LEVEL", "info").lower()
    
    logger.info(f"Starting Content Guardrail API on {host}:{port}")
    uvicorn.run(
        "gaurd:app",
        host=host,
        port=port,
        log_level=log_level,
        workers=int(os.getenv("WORKERS", "1"))
    )