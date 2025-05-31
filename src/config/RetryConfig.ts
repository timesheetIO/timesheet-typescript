/**
 * Configuration for automatic retry behavior.
 */
export class RetryConfig {
  public readonly maxRetries: number;
  public readonly initialDelay: number;
  public readonly maxDelay: number;
  public readonly backoffMultiplier: number;
  public readonly retryableStatusCodes: number[];
  
  constructor(options: Partial<RetryConfigOptions> = {}) {
    this.maxRetries = options.maxRetries ?? 3;
    this.initialDelay = options.initialDelay ?? 100;
    this.maxDelay = options.maxDelay ?? 10000;
    this.backoffMultiplier = options.backoffMultiplier ?? 2.0;
    this.retryableStatusCodes = options.retryableStatusCodes ?? [429, 502, 503, 504];
  }
  
  /**
   * Returns the default retry configuration.
   */
  static default(): RetryConfig {
    return new RetryConfig();
  }
}

/**
 * Options for RetryConfig constructor.
 */
export interface RetryConfigOptions {
  /**
   * Maximum number of retry attempts.
   * @default 3
   */
  maxRetries: number;
  
  /**
   * Initial delay before the first retry in milliseconds.
   * @default 100
   */
  initialDelay: number;
  
  /**
   * Maximum delay between retries in milliseconds.
   * @default 10000
   */
  maxDelay: number;
  
  /**
   * Backoff multiplier for exponential backoff.
   * @default 2.0
   */
  backoffMultiplier: number;
  
  /**
   * HTTP status codes that should trigger a retry.
   * @default [429, 502, 503, 504]
   */
  retryableStatusCodes: number[];
} 