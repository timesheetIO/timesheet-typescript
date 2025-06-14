import type { AxiosRequestConfig } from 'axios';
import type { Authentication } from './Authentication';

/**
 * API Key authentication implementation.
 *
 * Uses the ApiKey scheme in the Authorization header.
 * Format: `Authorization: ApiKey {api_key}`
 */
export class ApiKeyAuth implements Authentication {
  constructor(private readonly apiKey: string) {
    if (apiKey === null) {
      throw new Error('API key cannot be null');
    }
    if (apiKey === undefined) {
      throw new Error('API key cannot be undefined');
    }
    if (!apiKey) {
      throw new Error('API key cannot be empty');
    }
    if (typeof apiKey !== 'string') {
      throw new Error('API key must be a string');
    }
    if (apiKey.trim().length === 0) {
      throw new Error('API key cannot be empty or whitespace');
    }

    // Validate API key format: should be ts_{prefix}.{secret}
    if (!this.isValidFormat(apiKey)) {
      throw new Error('Invalid API key format');
    }
  }

  private isValidFormat(apiKey: string): boolean {
    // API key format: ts_{prefix}.{secret}
    const apiKeyPattern = /^ts_[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;
    return apiKeyPattern.test(apiKey);
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

  async getAuthHeaders(): Promise<Record<string, string>> {
    return {
      Authorization: `ApiKey ${this.apiKey}`,
    };
  }

  isValid(): boolean {
    return (
      typeof this.apiKey === 'string' &&
      this.apiKey.trim().length > 0 &&
      this.isValidFormat(this.apiKey)
    );
  }
}
