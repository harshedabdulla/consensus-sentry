# Consensus Sentry 🛡️

[![npm version](https://img.shields.io/npm/v/consensus-sentry)](https://www.npmjs.com/package/consensus-sentry)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A robust content moderation SDK for AI applications, providing multi-layered content safety checks including rule-based pattern matching, semantic analysis, and machine learning toxicity classification.

## Features

- 🚦 **Content Validation**: Check text against customizable rules and AI models
- ⚡ **Batch Processing**: Validate multiple content items in parallel
- 🔍 **Detailed Violations**: Get specific rule violations with confidence scores
- 🧪 **Toxicity Scoring**: Built-in toxicity classification (sexual, hate, threat, etc.)
- 📦 **Caching**: Redis-powered caching for improved performance
- ⚙️ **Configurable Thresholds**: Adjust similarity and toxicity thresholds

## Installation

```bash
npm install consensus-sentry
```

## Usage

### Basic Usage

```bash
import { ConsensusSentry } from 'consensus-sentry';

// Initialize client
const sentry = new ConsensusSentry({
  apiKey: 'your_api_key',
  environment: 'production' // or 'staging'
});

// Validate content
async function checkContent(text: string) {
  try {
    const result = await sentry.validate(text);
    
    if (result.valid) {
      console.log('✅ Safe content');
    } else {
      console.log('❌ Violations:', result.violations);
    }
    
    return result;
  } catch (error) {
    console.error('Validation error:', error);
    throw error;
  }
}

// Example usage
checkContent('This is some user-generated content');
```

### Batch Validation

```bash
async function checkBatchContent(texts: string[]) {
  try {
    const batchResult = await sentry.validateBatch(texts);
    console.log(`Processed ${batchResult.totalItems} items`);
    return batchResult.results;
  } catch (error) {
    console.error('Batch validation error:', error);
    throw error;
  }
}

// Example usage
checkBatchContent(['First content', 'Second content']);
```

### Response Structure

```bash
interface CheckResult {
  valid: boolean;
  violations: Violation[];
  requestId: string;
  status: 'safe' | 'violation' | 'warning' | 'invalid';
  message?: string;
  metadata?: {
    processingTimeMs?: number;
    toxicityScores?: Record<string, number>;
    classifierError?: string;
  };
  ruleDetails?: Record<string, {
    description: string;
    response: string;
  }>;
}
```

### Error Handling

```bash
try {
  await sentry.validate(content);
} catch (error) {
  if (error.message.startsWith('API Error')) {
    // Handle API errors (4xx/5xx responses)
  } else if (error.message.startsWith('Network Error')) {
    // Handle network connectivity issues
  } else if (error.message.includes('timeout')) {
    // Handle request timeouts
  }
}
```

### Advanced Usage

```bash
// Example rule configuration (server-side)
{
  "rules": [{
    "id": "profanity-filter",
    "keywords": ["badword1", "badword2"],
    "threshold": 0.85,
    "response": "Content contains prohibited language"
  }]
}
```

### Contributing
We welcome contributions! Please follow these steps:

Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

See our Contribution Guidelines for more details.


Consensus Sentry is maintained by Consensus Sentry. For support contact support@consensus.dev