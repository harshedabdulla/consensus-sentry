import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

export interface ClientOptions {
  apiKey: string;
  environment?: string;
  baseURL?: string;
  timeout?: number;
}

export interface Violation {
  ruleId: string;
  type: string;
  matched: string;
  confidence: number;
  details?: Record<string, any>;
  category?: string;
}

export interface CheckResult {
  valid: boolean;
  violations: Violation[];
  requestId: string;
  status: string;
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

export interface BatchResult {
  batchId: string;
  results: CheckResult[];
  totalItems: number;
  processingTimeMs: number;
}

export class ConsensusSentry {
  private client: AxiosInstance;
  private apiKey: string;
  private environment: string;

  constructor(options: ClientOptions) {
    this.apiKey = options.apiKey;
    this.environment = options.environment || 'production';
    
    this.client = axios.create({
      baseURL: options.baseURL || 'https://consensussentry-app.eastus.azurecontainer.io:8080',
      timeout: options.timeout || 5000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'X-Environment': this.environment
      }
    });
  }

  async validate(content: string): Promise<CheckResult> {
    try {
      const response: AxiosResponse = await this.client.post('/check', {
        text: content
      });

      return this.transformResponse(response.data);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async validateBatch(contents: string[]): Promise<BatchResult> {
    try {
      const response: AxiosResponse = await this.client.post('/batch_check', {
        items: contents.map(text => ({ text }))
      });

      return {
        batchId: response.data.batch_id,
        results: response.data.results.map((item: any) => this.transformResponse(item)),
        totalItems: response.data.total_items,
        processingTimeMs: response.data.processing_time_ms
      };
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  private transformResponse(responseData: any): CheckResult {
    const valid = responseData.status === 'safe';
    const violations: Violation[] = (responseData.violations || []).map((v: any) => ({
      ruleId: v.rule_id,
      type: v.type,
      matched: v.matched,
      confidence: v.confidence,
      details: v.details,
      category: v.category
    }));

    return {
      valid,
      violations,
      requestId: responseData.request_id,
      status: responseData.status,
      message: responseData.message,
      metadata: this.transformMetadata(responseData.metadata),
      ruleDetails: responseData.rule_details
    };
  }

  private transformMetadata(metadata?: any) {
    if (!metadata) return undefined;
    
    return {
      processingTimeMs: metadata.processing_time_ms,
      toxicityScores: metadata.toxicity_scores,
      classifierError: metadata.classifier_error
    };
  }

  private handleError(error: AxiosError): never {
    if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error(`Request timed out after ${this.client.defaults.timeout}ms`);
    }

    throw new Error(`Network Error: ${error.message}`);
  }
}