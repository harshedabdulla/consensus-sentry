export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unavailable';
  timestamp: string;
  message?: string;
}