import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import type { ClientConfig } from '../config';
import { TimesheetApiError, TimesheetAuthError, TimesheetRateLimitError } from '../exceptions';

interface ErrorResponseData {
  message?: string;
  code?: string;
}

/**
 * HTTP client for making API requests.
 */
export class ApiClient {
  private readonly config: ClientConfig;
  private readonly httpClient: AxiosInstance;

  constructor(config: ClientConfig) {
    this.config = config;
    this.httpClient =
      config.httpClient ||
      axios.create({
        baseURL: config.baseUrl,
        timeout: 30000,
        headers: {
          'User-Agent': 'Timesheet-TypeScript-SDK/1.0.0',
          'Content-Type': 'application/json',
        },
      });

    // Request interceptor for authentication
    this.httpClient.interceptors.request.use(async (config) => {
      // Add authentication headers if configured
      if (config.url !== '/oauth/token' && this.config.authentication) {
        const authHeaders = await this.config.authentication.getAuthHeaders();
        if (authHeaders) {
          // Set headers directly to avoid type issues
          for (const [key, value] of Object.entries(authHeaders)) {
            config.headers.set(key, value);
          }
        }
      }

      return config;
    });
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
      } catch (error) {
        lastError = error as Error;

        // Handle authentication errors
        if (axios.isAxiosError<ErrorResponseData>(error) && error.response?.status === 401) {
          const errorData = error.response.data;
          throw new TimesheetAuthError(
            errorData?.message || 'Authentication failed',
            401,
            JSON.stringify(errorData),
          );
        }

        // Handle rate limit errors
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'] as string | undefined;
          throw new TimesheetRateLimitError('Rate limit exceeded', retryAfter);
        }

        // Check if we should retry
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        if (
          attempt < retryConfig.maxRetries &&
          status &&
          retryConfig.retryableStatusCodes.includes(status)
        ) {
          // Calculate delay with exponential backoff
          const delay = Math.min(
            retryConfig.initialDelay * Math.pow(retryConfig.backoffMultiplier, attempt),
            retryConfig.maxDelay,
          );

          await this.sleep(delay);
          continue;
        }

        // Non-retryable error
        if (axios.isAxiosError<ErrorResponseData>(error)) {
          const errorData = error.response?.data;
          throw new TimesheetApiError(
            errorData?.message || error.message,
            error.response?.status,
            JSON.stringify(errorData),
            errorData?.code,
          );
        } else if (error instanceof Error) {
          throw new TimesheetApiError(error.message);
        } else {
          throw new TimesheetApiError('Unknown error occurred');
        }
      }
    }

    // This should never happen, but TypeScript needs it
    throw lastError || new Error('Unknown error');
  }

  /**
   * GET request.
   */
  async get<T, P = Record<string, unknown>>(path: string, params?: P): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url: path,
      params: params as Record<string, unknown>,
    });
  }

  /**
   * POST request.
   */
  async post<T, P = Record<string, unknown>>(path: string, data?: unknown, params?: P): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url: path,
      data,
      params: params as Record<string, unknown>,
    });
  }

  /**
   * PUT request.
   */
  async put<T, P = Record<string, unknown>>(path: string, data?: unknown, params?: P): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url: path,
      data,
      params: params as Record<string, unknown>,
    });
  }

  /**
   * DELETE request.
   */
  async delete<T, P = Record<string, unknown>>(path: string, params?: P): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url: path,
      params: params as Record<string, unknown>,
    });
  }

  /**
   * Sleep for the specified number of milliseconds.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
