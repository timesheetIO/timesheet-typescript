import { TimesheetApiError } from './TimesheetApiError';

/**
 * Exception thrown when rate limit is exceeded.
 */
export class TimesheetRateLimitError extends TimesheetApiError {
  public readonly retryAfter?: string;
  
  /**
   * Creates a new rate limit exception.
   * 
   * @param message The error message
   * @param retryAfter The retry-after header value
   */
  constructor(message: string, retryAfter?: string) {
    super(message, 429, undefined, 'rate_limit_exceeded');
    this.name = 'TimesheetRateLimitError';
    this.retryAfter = retryAfter;
  }
  
  /**
   * Parses the retry-after value as a Date.
   * 
   * @returns The retry-after time as a Date, or null if parsing fails
   */
  getRetryAfterDate(): Date | null {
    if (!this.retryAfter) {
      return null;
    }
    
    // Try to parse as epoch seconds
    const epochSeconds = Number(this.retryAfter);
    if (!isNaN(epochSeconds)) {
      return new Date(epochSeconds * 1000);
    }
    
    // Try to parse as ISO string
    const date = new Date(this.retryAfter);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    return null;
  }
} 