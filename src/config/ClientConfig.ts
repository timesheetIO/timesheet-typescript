import { Authentication } from '../auth/Authentication';
import { RetryConfig } from './RetryConfig';

/**
 * Configuration for the API client.
 */
export interface ClientConfig {
  /**
   * Base URL for the API.
   */
  baseUrl: string;
  
  /**
   * Authentication mechanism.
   */
  authentication: Authentication;
  
  /**
   * Retry configuration.
   */
  retryConfig: RetryConfig;
  
  /**
   * Optional custom HTTP client (axios instance).
   */
  httpClient?: any;
} 