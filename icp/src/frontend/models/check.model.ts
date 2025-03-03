export interface CheckRequest {
  text: string;
  context?: Record<string, any>;
}

export interface Violation {
  rule_id: string;
  type: string;
  matched: string;
  confidence: number;
  details?: Record<string, any>;
}

export interface CheckResponse {
  status: string;
  message: string;
  violations?: Violation[];
  metadata?: Record<string, any>;
  request_id: string;
}