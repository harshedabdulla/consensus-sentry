# Content Moderation System Deployment Guide

This guide explains how to deploy the **Content Moderation System** as a middleware service on **Google Cloud Platform (GCP)**. The system is built using **FastAPI**, **spaCy**, **Sentence Transformers**, and **Redis** for caching. It is designed to analyze and filter text content for violations of predefined rules and toxic language.

---

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Deployment Steps](#deployment-steps)
   - [Step 1: Set Up GCP Project](#step-1-set-up-gcp-project)
   - [Step 2: Build and Push Docker Image](#step-2-build-and-push-docker-image)
   - [Step 3: Deploy to Cloud Run](#step-3-deploy-to-cloud-run)
   - [Step 4: Set Up Redis (Memorystore)](#step-4-set-up-redis-memorystore)
   - [Step 5: Configure API Gateway](#step-5-configure-api-gateway)
4. [Testing the Deployment](#testing-the-deployment)
5. [Scaling and Monitoring](#scaling-and-monitoring)
6. [Troubleshooting](#troubleshooting)

---

## Overview

The Content Moderation System is deployed as a **middleware service** that sits between your application and user input. It performs the following tasks:
1. **Rule-Based Checks**: Regex patterns, keyword matching, and semantic similarity.
2. **Toxicity Classification**: Uses an external ML model to detect toxic content.
3. **Caching**: Redis is used to cache rule check results for faster processing.

---

## Prerequisites

Before deploying, ensure you have the following:
1. **GCP Account**: A Google Cloud Platform account with billing enabled.
2. **Google Cloud SDK**: Installed and configured on your local machine.
3. **Docker**: Installed and running on your local machine.
4. **Python**: Installed on your local machine (for testing and development).
5. **Redis**: A Redis instance (can be GCP Memorystore or self-hosted).

---

## Deployment Steps

### Step 1: Set Up GCP Project

1. **Create a New Project**:
   - Go to the [GCP Console](https://console.cloud.google.com/).
   - Create a new project (e.g., `content-moderation`).

2. **Enable Required APIs**:
   - Enable the following APIs:
     - **Cloud Run API**
     - **Memorystore for Redis API**
     - **Vertex AI API** (if using GCP for toxicity classification).

3. **Install Google Cloud SDK**:
   - Install the SDK if you haven’t already:
     ```bash
     curl https://sdk.cloud.google.com | bash
     exec -l $SHELL
     gcloud init
     ```

---

### Step 2: Build and Push Docker Image

1. **Build the Docker Image**:
   - Navigate to your project directory:
     ```bash
     cd /path/to/your/project
     ```
   - Build the Docker image:
     ```bash
     docker build -t gcr.io/YOUR_PROJECT_ID/guardrail-middleware .
     ```

2. **Push the Docker Image to GCR**:
   - Authenticate Docker with GCP:
     ```bash
     gcloud auth configure-docker
     ```
   - Push the image to Google Container Registry (GCR):
     ```bash
     docker push gcr.io/YOUR_PROJECT_ID/guardrail-middleware
     ```

---

### Step 3: Deploy to Cloud Run

1. **Deploy the Service**:
   - Go to the [Cloud Run Console](https://console.cloud.google.com/run).
   - Click **Create Service**.
   - Select the Docker image you pushed to GCR.
   - Configure environment variables:
     ```
     REDIS_HOST=<memorystore-host>
     REDIS_PORT=6379
     TOXIC_CLASSIFIER_URL=<your-classifier-url>
     ```
   - Set the service name (e.g., `guardrail-middleware`).
   - Deploy the service.

2. **Note the Service URL**:
   - After deployment, note the service URL (e.g., `https://guardrail-middleware-xyz.a.run.app`).

---

### Step 4: Set Up Redis (Memorystore)

1. **Create a Redis Instance**:
   - Go to the [Memorystore Console](https://console.cloud.google.com/memorystore).
   - Create a Redis instance:
     - Choose a region close to your Cloud Run service.
     - Enable authentication.
   - Note the connection details (host, port, password).

2. **Update Environment Variables**:
   - Update the `REDIS_HOST` and `REDIS_PORT` environment variables in Cloud Run with the Redis instance details.

---

### Step 5: Configure API Gateway

1. **Create an API Gateway**:
   - Go to the [API Gateway Console](https://console.cloud.google.com/api-gateway).
   - Create a new API:
     - Define routes (e.g., `/check` → Guardrail Middleware).
     - Add authentication (API keys or OAuth).

2. **Deploy the API**:
   - Deploy the API and note the gateway URL.

---

## Testing the Deployment

1. **Test the API**:
   - Use `curl` or Postman to test the API:
     ```bash
     curl -X POST https://api-gateway-url/check \
       -H "Content-Type: application/json" \
       -d '{"text": "sample input"}'
     ```

2. **Expected Response**:
   ```json
   {
     "status": "safe",
     "message": "No rule violations detected. Content is safe.",
     "violations": [],
     "metadata": {
       "processing_time_ms": 123
     }
   }