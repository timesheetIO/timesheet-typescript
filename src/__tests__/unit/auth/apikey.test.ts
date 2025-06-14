import { ApiKeyAuth } from '../../../auth';
import { AxiosRequestConfig } from 'axios';

describe('ApiKeyAuth', () => {
  describe('constructor', () => {
    test('should create instance with valid API key', () => {
      const apiKey = 'ts_iJ39Pmy1.hixzoMeXZ5xCUpsYxsoUyCykCC1BrAek';
      const auth = new ApiKeyAuth(apiKey);
      expect(auth).toBeInstanceOf(ApiKeyAuth);
    });

    test('should throw error with empty API key', () => {
      expect(() => new ApiKeyAuth('')).toThrow('API key cannot be empty');
    });

    test('should throw error with null API key', () => {
      expect(() => new ApiKeyAuth(null as any)).toThrow('API key cannot be null');
    });

    test('should throw error with undefined API key', () => {
      expect(() => new ApiKeyAuth(undefined as any)).toThrow('API key cannot be undefined');
    });

    test('should throw error with invalid API key format', () => {
      const invalidFormats = [
        'invalid',
        'prefix.',
        '.secret',
        'prefix.secret.extra',
        'prefix_with_underscore.secret',
        'prefix-with-dash.secret',
        'prefix with space.secret',
        'ak_prefix.secret',
        'iJ39Pmy1.hixzoMeXZ5xCUpsYxsoUyCykCC1BrAek',
        'testkey.1234567890abcdef',
      ];

      invalidFormats.forEach((invalidKey) => {
        expect(() => new ApiKeyAuth(invalidKey)).toThrow('Invalid API key format');
      });
    });
  });

  describe('applyAuth', () => {
    const validApiKey = 'ts_iJ39Pmy1.hixzoMeXZ5xCUpsYxsoUyCykCC1BrAek';
    let auth: ApiKeyAuth;

    beforeEach(() => {
      auth = new ApiKeyAuth(validApiKey);
    });

    test('should add Authorization header with ApiKey scheme', () => {
      const config: AxiosRequestConfig = {
        headers: {},
      };

      auth.applyAuth(config);

      expect(config.headers).toBeDefined();
      expect(config.headers!.Authorization).toBe(`ApiKey ${validApiKey}`);
    });

    test('should preserve existing headers', () => {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'custom-value',
        },
      };

      auth.applyAuth(config);

      expect(config.headers!['Content-Type']).toBe('application/json');
      expect(config.headers!['X-Custom-Header']).toBe('custom-value');
      expect(config.headers!.Authorization).toBe(`ApiKey ${validApiKey}`);
    });

    test('should handle config without headers', () => {
      const config: AxiosRequestConfig = {};

      auth.applyAuth(config);

      expect(config.headers).toBeDefined();
      expect(config.headers!.Authorization).toBe(`ApiKey ${validApiKey}`);
    });

    test('should follow API key format from documentation', () => {
      const apiKeyFormats = [
        'ts_iJ39Pmy1.hixzoMeXZ5xCUpsYxsoUyCykCC1BrAek',
        'ts_testkey.1234567890abcdef',
        'ts_123.fedcba0987654321',
        'ts_user123.abcdef1234567890',
      ];

      apiKeyFormats.forEach((apiKey) => {
        const auth = new ApiKeyAuth(apiKey);
        expect(auth).toBeInstanceOf(ApiKeyAuth);
      });
    });
  });

  describe('needsRefresh', () => {
    test('should always return false (API keys do not need refresh)', () => {
      const auth = new ApiKeyAuth('ts_testkey.123456');
      expect(auth.needsRefresh()).toBe(false);
    });
  });

  describe('refresh', () => {
    test('should throw error (API keys cannot be refreshed)', async () => {
      const auth = new ApiKeyAuth('ts_testkey.123456');
      await expect(auth.refresh()).rejects.toThrow('API keys cannot be refreshed');
    });
  });

  describe('getAuthHeaders', () => {
    test('should return authorization headers', async () => {
      const apiKey = 'ts_testkey.123456';
      const auth = new ApiKeyAuth(apiKey);

      const headers = await auth.getAuthHeaders();

      expect(headers).toEqual({
        Authorization: `ApiKey ${apiKey}`,
      });
    });

    test('should return consistent headers across multiple calls', async () => {
      const apiKey = 'ts_testkey.123456';
      const auth = new ApiKeyAuth(apiKey);

      const headers1 = await auth.getAuthHeaders();
      const headers2 = await auth.getAuthHeaders();

      expect(headers1).toEqual(headers2);
    });
  });

  describe('isValid', () => {
    test('should validate API key format', () => {
      const auth = new ApiKeyAuth('ts_testkey.123456');
      expect(auth.isValid()).toBe(true);
    });

    test('should return false for invalid format', () => {
      const invalidKey = 'invalid_key';
      expect(() => new ApiKeyAuth(invalidKey)).toThrow();
    });
  });
});
