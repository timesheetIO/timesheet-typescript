import { AxiosRequestConfig } from 'axios';
import { Authentication } from './Authentication';

/**
 * API Key authentication implementation.
 * 
 * Uses the ApiKey scheme in the Authorization header.
 * Format: `Authorization: ApiKey {api_key}`
 */
export class ApiKeyAuth implements Authentication {
  constructor(private readonly apiKey: string) {
    if (!apiKey) {
      throw new Error('API key cannot be empty');
    }
  }
  
  applyAuth(config: AxiosRequestConfig): void {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers['Authorization'] = `ApiKey ${this.apiKey}`;
  }
  
  needsRefresh(): boolean {
    // API keys don't need refresh
    return false;
  }
  
  async refresh(): Promise<void> {
    throw new Error('API keys cannot be refreshed');
  }
} 