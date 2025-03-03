# Content Moderation System Documentation

## Overview
This is a production-grade content moderation system designed to analyze and filter text content for violations of predefined rules and toxic language. It combines **rule-based checks**, **semantic similarity analysis**, and **machine learning-based toxicity classification** to provide robust content moderation.

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Key Components](#key-components)
3. [Workflow](#workflow)
4. [Rule Processing Pipeline](#rule-processing-pipeline)
5. [Caching Strategy](#caching-strategy)
6. [Toxicity Classification](#toxicity-classification)
7. [Batch Processing](#batch-processing)
8. [Error Handling & Fallbacks](#error-handling--fallbacks)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Deployment](#deployment)
11. [Required Knowledge](#required-knowledge)

---

## System Architecture

The system is built using the following technologies:
- **FastAPI**: REST API framework for handling requests.
- **Redis**: Caching layer for storing rule check results.
- **spaCy/NLTK**: Natural Language Processing (NLP) for text preprocessing.
- **Sentence Transformers**: Semantic similarity using pre-trained models.
- **AsyncIO**: Concurrent processing for improved performance.

The architecture is modular, with the following layers:
1. **Input Validation Layer**: Validates incoming requests.
2. **Rule Processing Layer**: Applies rule-based checks.
3. **Toxicity Classification Layer**: Uses an external ML model for toxicity detection.
4. **Caching Layer**: Stores results to reduce redundant computations.
5. **Output Formatting Layer**: Formats responses for clients.

---

## Key Components

### 1. **Rule Manager**
- Loads and manages rules from a JSON file.
- Precomputes:
  - Keyword indices (exact, stemmed, lemmatized).
  - Regex patterns.
  - Semantic embeddings for rule examples.
- Handles rule reloading and caching.

### 2. **Input Validation**
- Validates input text using Pydantic models.
- Ensures text is non-empty and meets minimum length requirements.

### 3. **Rule Processing Pipeline**
- Applies multiple validation stages:
  1. Regex patterns.
  2. Exact keyword matching.
  3. Lemmatized keyword matching.
  4. Stemmed keyword matching.
  5. Fuzzy keyword matching.
  6. Semantic similarity checks.

### 4. **Toxicity Classifier**
- Calls an external ML API to classify text toxicity.
- Handles API errors and retries.

### 5. **Caching Layer**
- Uses Redis to cache rule check results.
- Fallback to in-memory cache if Redis is unavailable.

### 6. **Batch Processing**
- Processes multiple texts concurrently using `asyncio.gather`.
- Handles errors for individual items without failing the entire batch.

---

## Workflow

### Step-by-Step Flow
1. **Input Validation**:
   - Check if the input text is valid (non-empty, meets length requirements).
2. **Caching Check**:
   - Look up the text in Redis cache.
   - If cached, return the result immediately.
3. **Rule Processing**:
   - Apply regex patterns.
   - Check for exact, lemmatized, and stemmed keywords.
   - Perform fuzzy matching for similar words.
   - Compute semantic similarity with rule examples.
4. **Toxicity Classification**:
   - If no rule violations are found, call the toxicity classifier API.
   - Analyze toxicity scores and determine if the content is safe.
5. **Response Formatting**:
   - Return structured responses with:
     - Status (safe, unsafe, violation).
     - Violation details (if any).
     - Toxicity scores (if applicable).
     - Metadata (processing time, request ID).

---

## Rule Processing Pipeline

### 1. **Regex Patterns**
- Precompiled regex patterns are matched against the input text.
- Example: Detect phone numbers, email addresses, or specific phrases.

### 2. **Exact Keywords**
- Exact matches for predefined keywords.
- Example: Blocklist words like "hate", "violence".

### 3. **Lemmatized Keywords**
- Match keywords after lemmatization (reducing words to their base form).
- Example: "running" → "run".

### 4. **Stemmed Keywords**
- Match keywords after stemming (reducing words to their root form).
- Example: "running" → "run".

### 5. **Fuzzy Matching**
- Use Levenshtein distance to match similar words.
- Example: "hate" matches "haet" (typo).

### 6. **Semantic Similarity**
- Compute cosine similarity between input text and rule examples.
- Example: "I dislike you" is semantically similar to "I hate you".

---

## Caching Strategy

### Cache Key Generation
- MD5 hash of the input text is used as the cache key.
- Example: `cache:md5("sample text")`.

### Cache Expiry
- Results are cached for 5 minutes (configurable).

### Fallback Mechanism
- If Redis is unavailable, the system falls back to in-memory caching.

---

## Toxicity Classification

### External API Integration
- Calls an external ML API for toxicity classification.
- Handles:
  - Timeouts.
  - Retries on failure.
  - Error fallbacks.

### Toxicity Categories
- Toxic
- Obscene
- Threat
- Insult
- Identity Hate
- Severe Toxic

### Thresholds
- Content is flagged as unsafe if any toxicity score exceeds `0.1`.

---

## Batch Processing

### Concurrent Execution
- Uses `asyncio.gather` to process multiple texts concurrently.
- Each text is processed independently.

### Error Handling
- Errors in individual items do not affect the entire batch.
- Failed items are logged and returned with error details.

---

## Error Handling & Fallbacks

### Error Types
1. **Input Errors**:
   - Empty text.
   - Invalid input format.
2. **Rule Processing Errors**:
   - Regex compilation failures.
   - Embedding generation failures.
3. **Toxicity Classifier Errors**:
   - API timeouts.
   - Invalid responses.

### Fallback Strategies
- Return safe status if the toxicity classifier fails.
- Log errors for debugging and monitoring.

---

## Monitoring & Maintenance

### Health Check Endpoint
- `/health`:
  - Checks Redis connectivity.
  - Verifies toxicity classifier API availability.
  - Reports system status.

### Rule Management
- `/rules`:
  - Lists all rules with descriptions.
- `/reload_rules`:
  - Reloads rules from the JSON file.

### Logging
- Detailed logs for:
  - Rule violations.
  - API errors.
  - Processing times.

---

## Deployment

### Environment Variables
- `MODEL_NAME`: Embedding model name.
- `REDIS_HOST`, `REDIS_PORT`: Redis connection details.
- `TOXIC_CLASSIFIER_URL`: Toxicity classifier API URL.
- `LOG_LEVEL`: Logging level (info, debug, error).

### Uvicorn Server
- Configurable host, port, and worker count.
- Example:
  ```bash
  uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4