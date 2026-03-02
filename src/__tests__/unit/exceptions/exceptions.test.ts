import {
  TimesheetApiError,
  TimesheetAuthError,
  TimesheetRateLimitError,
} from '../../../exceptions';

describe('Exceptions', () => {
  describe('TimesheetApiError', () => {
    it('should create error with message only', () => {
      const error = new TimesheetApiError('Something went wrong');

      expect(error.message).toBe('Something went wrong');
      expect(error.name).toBe('TimesheetApiError');
      expect(error.statusCode).toBeUndefined();
      expect(error.responseBody).toBeUndefined();
      expect(error.errorCode).toBeUndefined();
    });

    it('should create error with status code', () => {
      const error = new TimesheetApiError('Bad request', 400);

      expect(error.message).toBe('Bad request (HTTP 400)');
      expect(error.name).toBe('TimesheetApiError');
      expect(error.statusCode).toBe(400);
      expect(error.responseBody).toBeUndefined();
      expect(error.errorCode).toBeUndefined();
    });

    it('should create error with status code and error code', () => {
      const error = new TimesheetApiError('Validation failed', 422, undefined, 'VALIDATION_ERROR');

      expect(error.message).toBe('Validation failed (HTTP 422, Code: VALIDATION_ERROR)');
      expect(error.name).toBe('TimesheetApiError');
      expect(error.statusCode).toBe(422);
      expect(error.responseBody).toBeUndefined();
      expect(error.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should create error with all parameters', () => {
      const responseBody = JSON.stringify({ errors: ['Field is required'] });
      const error = new TimesheetApiError('Validation failed', 422, responseBody, 'VALIDATION_ERROR');

      expect(error.message).toBe('Validation failed (HTTP 422, Code: VALIDATION_ERROR)');
      expect(error.name).toBe('TimesheetApiError');
      expect(error.statusCode).toBe(422);
      expect(error.responseBody).toBe(responseBody);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should capture stack trace if available', () => {
      const originalCaptureStackTrace = Error.captureStackTrace;
      const mockCaptureStackTrace = jest.fn();
      Error.captureStackTrace = mockCaptureStackTrace;

      const error = new TimesheetApiError('Test error');

      expect(mockCaptureStackTrace).toHaveBeenCalledWith(error, TimesheetApiError);
      expect(error.stack).toBeDefined();

      Error.captureStackTrace = originalCaptureStackTrace;
    });

    it('should handle missing captureStackTrace gracefully', () => {
      const originalCaptureStackTrace = Error.captureStackTrace;
      // @ts-ignore - Testing runtime behavior
      delete Error.captureStackTrace;

      const error = new TimesheetApiError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.stack).toBeDefined();

      Error.captureStackTrace = originalCaptureStackTrace;
    });

    it('should be instanceof Error', () => {
      const error = new TimesheetApiError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TimesheetApiError);
    });

    it('should handle edge cases for message formatting', () => {
      // Zero status code
      const error1 = new TimesheetApiError('Error', 0);
      expect(error1.message).toBe('Error');

      // Empty error code
      const error2 = new TimesheetApiError('Error', 500, undefined, '');
      expect(error2.message).toBe('Error (HTTP 500)');

      // Very long error code
      const longCode = 'A'.repeat(100);
      const error3 = new TimesheetApiError('Error', 500, undefined, longCode);
      expect(error3.message).toBe(`Error (HTTP 500, Code: ${longCode})`);
    });
  });

  describe('TimesheetAuthError', () => {
    it('should create auth error with default status code', () => {
      const error = new TimesheetAuthError('Invalid credentials');

      expect(error.message).toBe('Invalid credentials (HTTP 401, Code: authentication_error)');
      expect(error.name).toBe('TimesheetAuthError');
      expect(error.statusCode).toBe(401);
      expect(error.errorCode).toBe('authentication_error');
    });

    it('should create auth error with custom status code', () => {
      const error = new TimesheetAuthError('Forbidden', 403);

      expect(error.message).toBe('Forbidden (HTTP 403, Code: authentication_error)');
      expect(error.name).toBe('TimesheetAuthError');
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe('authentication_error');
    });

    it('should create auth error with response body', () => {
      const responseBody = JSON.stringify({ error: 'Token expired' });
      const error = new TimesheetAuthError('Token expired', 401, responseBody);

      expect(error.message).toBe('Token expired (HTTP 401, Code: authentication_error)');
      expect(error.name).toBe('TimesheetAuthError');
      expect(error.statusCode).toBe(401);
      expect(error.responseBody).toBe(responseBody);
      expect(error.errorCode).toBe('authentication_error');
    });

    it('should extend TimesheetApiError', () => {
      const error = new TimesheetAuthError('Unauthorized');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TimesheetApiError);
      expect(error).toBeInstanceOf(TimesheetAuthError);
    });

    it('should capture stack trace correctly', () => {
      const error = new TimesheetAuthError('Unauthorized');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('TimesheetAuthError');
    });
  });

  describe('TimesheetRateLimitError', () => {
    it('should create rate limit error without retry-after', () => {
      const error = new TimesheetRateLimitError('Too many requests');

      expect(error.message).toBe('Too many requests (HTTP 429, Code: rate_limit_exceeded)');
      expect(error.name).toBe('TimesheetRateLimitError');
      expect(error.statusCode).toBe(429);
      expect(error.errorCode).toBe('rate_limit_exceeded');
      expect(error.retryAfter).toBeUndefined();
    });

    it('should create rate limit error with retry-after', () => {
      const error = new TimesheetRateLimitError('Rate limit exceeded', '60');

      expect(error.message).toBe('Rate limit exceeded (HTTP 429, Code: rate_limit_exceeded)');
      expect(error.name).toBe('TimesheetRateLimitError');
      expect(error.statusCode).toBe(429);
      expect(error.errorCode).toBe('rate_limit_exceeded');
      expect(error.retryAfter).toBe('60');
    });

    it('should extend TimesheetApiError', () => {
      const error = new TimesheetRateLimitError('Rate limited');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TimesheetApiError);
      expect(error).toBeInstanceOf(TimesheetRateLimitError);
    });

    describe('getRetryAfterDate', () => {
      it('should return null when retryAfter is undefined', () => {
        const error = new TimesheetRateLimitError('Rate limited');

        expect(error.getRetryAfterDate()).toBeNull();
      });

      it('should parse epoch seconds correctly', () => {
        const epochSeconds = Math.floor(Date.now() / 1000) + 60; // 60 seconds from now
        const error = new TimesheetRateLimitError('Rate limited', String(epochSeconds));

        const date = error.getRetryAfterDate();
        expect(date).toBeInstanceOf(Date);
        expect(date?.getTime()).toBe(epochSeconds * 1000);
      });

      it('should parse ISO date string correctly', () => {
        const futureDate = new Date(Date.now() + 60000); // 60 seconds from now
        const isoString = futureDate.toISOString();
        const error = new TimesheetRateLimitError('Rate limited', isoString);

        const date = error.getRetryAfterDate();
        expect(date).toBeInstanceOf(Date);
        expect(date?.toISOString()).toBe(isoString);
      });

      it('should return null for invalid date strings', () => {
        const error = new TimesheetRateLimitError('Rate limited', 'invalid-date');

        expect(error.getRetryAfterDate()).toBeNull();
      });

      it('should handle edge cases for retry-after values', () => {
        // Empty string
        const error1 = new TimesheetRateLimitError('Rate limited', '');
        expect(error1.getRetryAfterDate()).toBeNull();

        // Zero epoch seconds
        const error2 = new TimesheetRateLimitError('Rate limited', '0');
        const date2 = error2.getRetryAfterDate();
        expect(date2).toBeInstanceOf(Date);
        expect(date2?.getTime()).toBe(0);

        // Negative epoch seconds
        const error3 = new TimesheetRateLimitError('Rate limited', '-1');
        const date3 = error3.getRetryAfterDate();
        expect(date3).toBeInstanceOf(Date);
        expect(date3?.getTime()).toBe(-1000); // -1 second = -1000 ms

        // Float epoch seconds
        const error4 = new TimesheetRateLimitError('Rate limited', '1609459200.5');
        const date4 = error4.getRetryAfterDate();
        expect(date4).toBeInstanceOf(Date);
        expect(date4?.getTime()).toBe(1609459200.5 * 1000);

        // Very large epoch seconds
        const error5 = new TimesheetRateLimitError('Rate limited', '9999999999');
        const date5 = error5.getRetryAfterDate();
        expect(date5).toBeInstanceOf(Date);
        expect(date5?.getTime()).toBe(9999999999 * 1000);

        // RFC 2822 date string
        const error6 = new TimesheetRateLimitError('Rate limited', 'Wed, 21 Oct 2025 07:28:00 GMT');
        const date6 = error6.getRetryAfterDate();
        expect(date6).toBeInstanceOf(Date);
        expect(date6?.getFullYear()).toBe(2025);
      });
    });
  });

  describe('Error inheritance chain', () => {
    it('should maintain proper prototype chain', () => {
      const apiError = new TimesheetApiError('API error');
      const authError = new TimesheetAuthError('Auth error');
      const rateLimitError = new TimesheetRateLimitError('Rate limit error');

      // Check prototype chain for TimesheetApiError
      expect(Object.getPrototypeOf(apiError)).toBe(TimesheetApiError.prototype);
      expect(Object.getPrototypeOf(TimesheetApiError.prototype)).toBe(Error.prototype);

      // Check prototype chain for TimesheetAuthError
      expect(Object.getPrototypeOf(authError)).toBe(TimesheetAuthError.prototype);
      expect(Object.getPrototypeOf(TimesheetAuthError.prototype)).toBe(TimesheetApiError.prototype);

      // Check prototype chain for TimesheetRateLimitError
      expect(Object.getPrototypeOf(rateLimitError)).toBe(TimesheetRateLimitError.prototype);
      expect(Object.getPrototypeOf(TimesheetRateLimitError.prototype)).toBe(TimesheetApiError.prototype);
    });

    it('should handle try-catch correctly', () => {
      const testError = (error: Error): string => {
        try {
          throw error;
        } catch (e) {
          if (e instanceof TimesheetRateLimitError) {
            return 'rate_limit';
          } else if (e instanceof TimesheetAuthError) {
            return 'auth';
          } else if (e instanceof TimesheetApiError) {
            return 'api';
          } else if (e instanceof Error) {
            return 'error';
          }
          return 'unknown';
        }
      };

      expect(testError(new TimesheetRateLimitError('Rate limit'))).toBe('rate_limit');
      expect(testError(new TimesheetAuthError('Auth'))).toBe('auth');
      expect(testError(new TimesheetApiError('API'))).toBe('api');
      expect(testError(new Error('Generic'))).toBe('error');
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON correctly', () => {
      const apiError = new TimesheetApiError('API error', 500, '{"error": "Internal"}', 'INTERNAL_ERROR');
      const authError = new TimesheetAuthError('Auth error', 401, '{"error": "Invalid token"}');
      const rateLimitError = new TimesheetRateLimitError('Rate limit', '3600');

      // Test JSON.stringify - Error objects don't serialize message by default
      // But custom properties should be included
      const apiJson = JSON.parse(JSON.stringify(apiError));
      expect(apiJson.name).toBe('TimesheetApiError');
      
      // Check custom properties are serialized
      expect(apiError.statusCode).toBe(500);
      expect(apiError.responseBody).toBe('{"error": "Internal"}');
      expect(apiError.errorCode).toBe('INTERNAL_ERROR');

      const authJson = JSON.parse(JSON.stringify(authError));
      expect(authJson.name).toBe('TimesheetAuthError');
      expect(authError.statusCode).toBe(401);
      expect(authError.errorCode).toBe('authentication_error');

      const rateLimitJson = JSON.parse(JSON.stringify(rateLimitError));
      expect(rateLimitJson.name).toBe('TimesheetRateLimitError');
      expect(rateLimitError.statusCode).toBe(429);
      expect(rateLimitError.errorCode).toBe('rate_limit_exceeded');
      expect(rateLimitError.retryAfter).toBe('3600');
    });

    it('should maintain custom properties through serialization', () => {
      const error = new TimesheetApiError('Test error', 400, '{"field": "value"}', 'TEST_CODE');

      // Access all custom properties
      expect(error.statusCode).toBe(400);
      expect(error.responseBody).toBe('{"field": "value"}');
      expect(error.errorCode).toBe('TEST_CODE');

      // Properties should be enumerable
      const keys = Object.keys(error);
      expect(keys).toContain('statusCode');
      expect(keys).toContain('responseBody');
      expect(keys).toContain('errorCode');
    });
  });
});