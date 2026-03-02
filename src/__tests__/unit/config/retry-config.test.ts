import { RetryConfig } from '../../../config/RetryConfig';

describe('RetryConfig', () => {
  describe('constructor', () => {
    it('should create with default values when no options provided', () => {
      const config = new RetryConfig();

      expect(config.maxRetries).toBe(3);
      expect(config.initialDelay).toBe(100);
      expect(config.maxDelay).toBe(10000);
      expect(config.backoffMultiplier).toBe(2.0);
      expect(config.retryableStatusCodes).toEqual([429, 502, 503, 504]);
    });

    it('should create with empty options object', () => {
      const config = new RetryConfig({});

      expect(config.maxRetries).toBe(3);
      expect(config.initialDelay).toBe(100);
      expect(config.maxDelay).toBe(10000);
      expect(config.backoffMultiplier).toBe(2.0);
      expect(config.retryableStatusCodes).toEqual([429, 502, 503, 504]);
    });

    it('should override default values with provided options', () => {
      const options = {
        maxRetries: 5,
        initialDelay: 200,
        maxDelay: 20000,
        backoffMultiplier: 3.0,
        retryableStatusCodes: [500, 502, 503],
      };

      const config = new RetryConfig(options);

      expect(config.maxRetries).toBe(5);
      expect(config.initialDelay).toBe(200);
      expect(config.maxDelay).toBe(20000);
      expect(config.backoffMultiplier).toBe(3.0);
      expect(config.retryableStatusCodes).toEqual([500, 502, 503]);
    });

    it('should allow partial options override', () => {
      const options = {
        maxRetries: 10,
        retryableStatusCodes: [429, 500],
      };

      const config = new RetryConfig(options);

      expect(config.maxRetries).toBe(10);
      expect(config.initialDelay).toBe(100); // default
      expect(config.maxDelay).toBe(10000); // default
      expect(config.backoffMultiplier).toBe(2.0); // default
      expect(config.retryableStatusCodes).toEqual([429, 500]);
    });

    it('should handle zero values', () => {
      const options = {
        maxRetries: 0,
        initialDelay: 0,
        maxDelay: 0,
        backoffMultiplier: 0,
        retryableStatusCodes: [],
      };

      const config = new RetryConfig(options);

      expect(config.maxRetries).toBe(0);
      expect(config.initialDelay).toBe(0);
      expect(config.maxDelay).toBe(0);
      expect(config.backoffMultiplier).toBe(0);
      expect(config.retryableStatusCodes).toEqual([]);
    });
  });

  describe('default static method', () => {
    it('should return a RetryConfig with default values', () => {
      const config = RetryConfig.default();

      expect(config).toBeInstanceOf(RetryConfig);
      expect(config.maxRetries).toBe(3);
      expect(config.initialDelay).toBe(100);
      expect(config.maxDelay).toBe(10000);
      expect(config.backoffMultiplier).toBe(2.0);
      expect(config.retryableStatusCodes).toEqual([429, 502, 503, 504]);
    });

    it('should return a new instance each time', () => {
      const config1 = RetryConfig.default();
      const config2 = RetryConfig.default();

      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });
  });

  describe('property types', () => {
    it('should have correct property types', () => {
      const config = new RetryConfig();

      expect(typeof config.maxRetries).toBe('number');
      expect(typeof config.initialDelay).toBe('number');
      expect(typeof config.maxDelay).toBe('number');
      expect(typeof config.backoffMultiplier).toBe('number');
      expect(Array.isArray(config.retryableStatusCodes)).toBe(true);
    });

    it('should maintain property values after construction', () => {
      const options = {
        maxRetries: 7,
        initialDelay: 150,
        maxDelay: 15000,
        backoffMultiplier: 2.5,
        retryableStatusCodes: [400, 429, 500],
      };

      const config = new RetryConfig(options);

      // Verify values haven't changed
      expect(config.maxRetries).toBe(7);
      expect(config.initialDelay).toBe(150);
      expect(config.maxDelay).toBe(15000);
      expect(config.backoffMultiplier).toBe(2.5);
      expect(config.retryableStatusCodes).toEqual([400, 429, 500]);
    });
  });
});