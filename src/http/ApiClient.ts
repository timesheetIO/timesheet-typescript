import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ClientConfig } from '../config';
import { TimesheetApiError, TimesheetAuthError, TimesheetRateLimitError } from '../exceptions';

/**
 * HTTP client for making API requests.
 */
export class ApiClient {
  private readonly config: ClientConfig;
  private readonly httpClient: AxiosInstance;
  
  constructor(config: ClientConfig) {
    this.config = config;
    this.httpClient = config.httpClient || axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      headers: {
        'User-Agent': 'Timesheet-TypeScript-SDK/1.0.0',
        'Content-Type': 'application/json',
      },
    });
    
    // Add request interceptor for authentication
    this.httpClient.interceptors.request.use(
      async (config) => {
        const headers = await this.config.authentication.getAuthHeaders();
        config.headers = { ...config.headers, ...headers };
        return config;
      },
      (error) => Promise.reject(error)
    );
  }
  
  /**
   * Makes an HTTP request with retry support.
   */
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    let lastError: Error | null = null;
    const retryConfig = this.config.retryConfig;
    
    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const response = await this.httpClient.request<T>(config);
        return response.data;
      } catch (error: any) {
        lastError = error;
        
        // Handle authentication errors
        if (error.response?.status === 401) {
          throw new TimesheetAuthError(
            error.response.data?.message || 'Authentication failed',
            401,
            JSON.stringify(error.response.data)
          );
        }
        
        // Handle rate limit errors
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          throw new TimesheetRateLimitError(
            'Rate limit exceeded',
            retryAfter
          );
        }
        
        // Check if we should retry
        const status = error.response?.status;
        if (
          attempt < retryConfig.maxRetries &&
          status &&
          retryConfig.retryableStatusCodes.includes(status)
        ) {
          // Calculate delay with exponential backoff
          const delay = Math.min(
            retryConfig.initialDelay * Math.pow(retryConfig.backoffMultiplier, attempt),
            retryConfig.maxDelay
          );
          
          await this.sleep(delay);
          continue;
        }
        
        // Non-retryable error
        throw new TimesheetApiError(
          error.response?.data?.message || error.message,
          error.response?.status,
          JSON.stringify(error.response?.data),
          error.response?.data?.code
        );
      }
    }
    
    // This should never happen, but TypeScript needs it
    throw lastError || new Error('Unknown error');
  }
  
  /**
   * GET request.
   */
  async get<T>(path: string, params?: any): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url: path,
      params,
    });
  }
  
  /**
   * POST request.
   */
  async post<T>(path: string, data?: any, params?: any): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url: path,
      data,
      params,
    });
  }
  
  /**
   * PUT request.
   */
  async put<T>(path: string, data?: any, params?: any): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url: path,
      data,
      params,
    });
  }
  
  /**
   * DELETE request.
   */
  async delete<T>(path: string, params?: any): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url: path,
      params,
    });
  }
  
  /**
   * Sleep for the specified number of milliseconds.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
} 