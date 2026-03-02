import { TimesheetApiError } from './TimesheetApiError';

/**
 * Exception thrown when authentication fails.
 */
export class TimesheetAuthError extends TimesheetApiError {
  /**
   * Creates a new authentication exception.
   *
   * @param message The error message
   * @param statusCode The HTTP status code (usually 401)
   * @param responseBody The response body
   */
  constructor(message: string, statusCode: number = 401, responseBody?: string) {
    super(message, statusCode, responseBody, 'authentication_error');
    this.name = 'TimesheetAuthError';
  }
}
