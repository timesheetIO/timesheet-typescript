/**
 * Base exception for all Timesheet API errors.
 */
export class TimesheetApiError extends Error {
  public readonly statusCode?: number;
  public readonly responseBody?: string;
  public readonly errorCode?: string;

  /**
   * Creates a new TimesheetApiError.
   *
   * @param message The error message
   * @param statusCode Optional HTTP status code
   * @param responseBody Optional response body
   * @param errorCode Optional API error code
   */
  constructor(message: string, statusCode?: number, responseBody?: string, errorCode?: string) {
    const fullMessage = statusCode
      ? errorCode
        ? `${message} (HTTP ${statusCode}, Code: ${errorCode})`
        : `${message} (HTTP ${statusCode})`
      : message;

    super(fullMessage);

    this.name = 'TimesheetApiError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
    this.errorCode = errorCode;

    // Maintains proper stack trace for where our error was thrown
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, TimesheetApiError);
    }
  }
}
