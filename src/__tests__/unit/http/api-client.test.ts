import { ApiClient } from '../../../http/ApiClient';
import { ClientConfig } from '../../../config/ClientConfig';
import { RetryConfig } from '../../../config/RetryConfig';
import { TimesheetApiError, TimesheetAuthError, TimesheetRateLimitError } from '../../../exceptions';
import { Authentication } from '../../../auth/Authentication';
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Create a manual mock for axios
const mockAxiosInstance: Partial<AxiosInstance> = {
  request: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn(),
      clear: jest.fn(),
    },
    response: {
      use: jest.fn(),
      eject: jest.fn(),
      clear: jest.fn(),
    },
  },
} as any;

jest.mock('axios', () => ({
  default: {
    create: jest.fn(() => mockAxiosInstance),
    isAxiosError: jest.fn(),
  },
  create: jest.fn(() => mockAxiosInstance),
  isAxiosError: jest.fn(),
}));

describe('ApiClient', () => {
  let apiClient: ApiClient;
  let mockConfig: ClientConfig;
  let mockAuthentication: jest.Mocked<Authentication>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock authentication
    mockAuthentication = {
      getAuthHeaders: jest.fn().mockResolvedValue({ Authorization: 'Bearer test-token' }),
    } as jest.Mocked<Authentication>;

    // Mock config
    mockConfig = {
      baseUrl: 'https://api.timesheet.io',
      authentication: mockAuthentication,
      retryConfig: new RetryConfig({
        maxRetries: 3,
        initialDelay: 100,
        maxDelay: 5000,
        backoffMultiplier: 2,
        retryableStatusCodes: [429, 502, 503, 504],
      }),
    };

    // Reset the mock instance
    (mockAxiosInstance.request as jest.Mock).mockReset();
    (mockAxiosInstance.interceptors!.request.use as jest.Mock).mockReset();
  });

  describe('constructor', () => {
    it('should create axios instance with default configuration', () => {
      apiClient = new ApiClient(mockConfig);

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.timesheet.io',
        timeout: 30000,
        headers: {
          'User-Agent': 'Timesheet-TypeScript-SDK/1.0.0',
          'Content-Type': 'application/json',
        },
      });
    });

    it('should use provided httpClient if available', () => {
      const customHttpClient = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
        },
      } as unknown as AxiosInstance;
      mockConfig.httpClient = customHttpClient;

      apiClient = new ApiClient(mockConfig);

      expect(axios.create).not.toHaveBeenCalled();
      expect(customHttpClient.interceptors.request.use).toHaveBeenCalled();
    });

    it('should set up request interceptor for authentication', () => {
      apiClient = new ApiClient(mockConfig);

      expect(mockAxiosInstance.interceptors!.request.use).toHaveBeenCalled();
    });
  });

  describe('request interceptor', () => {
    let interceptor: (config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig>;

    beforeEach(() => {
      apiClient = new ApiClient(mockConfig);
      interceptor = (mockAxiosInstance.interceptors!.request.use as jest.Mock).mock.calls[0][0];
    });

    it('should add authentication headers for non-oauth endpoints', async () => {
      const config = {
        url: '/tasks',
        headers: {
          set: jest.fn(),
        },
      } as unknown as InternalAxiosRequestConfig;

      const result = await interceptor(config);

      expect(mockAuthentication.getAuthHeaders).toHaveBeenCalled();
      expect(config.headers.set).toHaveBeenCalledWith('Authorization', 'Bearer test-token');
      expect(result).toBe(config);
    });

    it('should skip authentication for oauth token endpoint', async () => {
      const config = {
        url: '/oauth/token',
        headers: {
          set: jest.fn(),
        },
      } as unknown as InternalAxiosRequestConfig;

      const result = await interceptor(config);

      expect(mockAuthentication.getAuthHeaders).not.toHaveBeenCalled();
      expect(config.headers.set).not.toHaveBeenCalled();
      expect(result).toBe(config);
    });

    it('should handle missing authentication headers gracefully', async () => {
      mockAuthentication.getAuthHeaders.mockResolvedValue(null);
      const config = {
        url: '/tasks',
        headers: {
          set: jest.fn(),
        },
      } as unknown as InternalAxiosRequestConfig;

      const result = await interceptor(config);

      expect(mockAuthentication.getAuthHeaders).toHaveBeenCalled();
      expect(config.headers.set).not.toHaveBeenCalled();
      expect(result).toBe(config);
    });
  });

  describe('request method', () => {
    beforeEach(() => {
      apiClient = new ApiClient(mockConfig);
    });

    it('should make successful request and return data', async () => {
      const mockData = { id: 1, name: 'Test' };
      (mockAxiosInstance.request as jest.Mock).mockResolvedValueOnce({ data: mockData });

      const result = await apiClient.request({ url: '/test' });

      expect(result).toEqual(mockData);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({ url: '/test' });
    });

    it('should handle 401 authentication error', async () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Invalid token', code: 'INVALID_TOKEN' },
        },
        message: 'Unauthorized',
      };
      
      (mockAxiosInstance.request as jest.Mock).mockRejectedValueOnce(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(apiClient.request({ url: '/test' })).rejects.toThrow(TimesheetAuthError);
      await expect(apiClient.request({ url: '/test' })).rejects.toThrow('Invalid token (HTTP 401, Code: authentication_error)');
    });

    it('should handle 429 rate limit error', async () => {
      const error = {
        response: {
          status: 429,
          data: {},
          headers: { 'retry-after': '60' },
        },
        message: 'Too Many Requests',
      };
      
      (mockAxiosInstance.request as jest.Mock).mockRejectedValueOnce(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(apiClient.request({ url: '/test' })).rejects.toThrow(TimesheetRateLimitError);
    });

    it('should retry on retryable status codes', async () => {
      const error503 = {
        response: {
          status: 503,
          data: {},
        },
        message: 'Service Unavailable',
      };

      const mockData = { id: 1, name: 'Test' };
      (mockAxiosInstance.request as jest.Mock)
        .mockRejectedValueOnce(error503)
        .mockRejectedValueOnce(error503)
        .mockResolvedValueOnce({ data: mockData });
      
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      // Mock setTimeout to speed up tests
      jest.useFakeTimers();
      const sleepSpy = jest.spyOn(apiClient as any, 'sleep').mockResolvedValue(undefined);

      const resultPromise = apiClient.request({ url: '/test' });
      const result = await resultPromise;

      expect(result).toEqual(mockData);
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(3);
      expect(sleepSpy).toHaveBeenCalledTimes(2);
      expect(sleepSpy).toHaveBeenNthCalledWith(1, 100); // Initial delay
      expect(sleepSpy).toHaveBeenNthCalledWith(2, 200); // Initial delay * backoff multiplier

      jest.useRealTimers();
    });

    it('should apply exponential backoff with max delay cap', async () => {
      const error503 = {
        response: {
          status: 503,
          data: {},
        },
        message: 'Service Unavailable',
      };

      (mockAxiosInstance.request as jest.Mock).mockRejectedValue(error503);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      jest.useFakeTimers();
      const sleepSpy = jest.spyOn(apiClient as any, 'sleep').mockResolvedValue(undefined);

      const resultPromise = apiClient.request({ url: '/test' });
      
      await expect(resultPromise).rejects.toThrow(TimesheetApiError);

      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(4); // Initial + 3 retries
      expect(sleepSpy).toHaveBeenCalledTimes(3);
      expect(sleepSpy).toHaveBeenNthCalledWith(1, 100); // Initial delay
      expect(sleepSpy).toHaveBeenNthCalledWith(2, 200); // 100 * 2
      expect(sleepSpy).toHaveBeenNthCalledWith(3, 400); // 200 * 2

      jest.useRealTimers();
    });

    it('should not retry on non-retryable status codes', async () => {
      const error400 = {
        response: {
          status: 400,
          data: { message: 'Invalid request' },
        },
        message: 'Bad Request',
      };

      (mockAxiosInstance.request as jest.Mock).mockRejectedValueOnce(error400);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      await expect(apiClient.request({ url: '/test' })).rejects.toThrow(TimesheetApiError);
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    });

    it('should handle non-axios errors', async () => {
      const error = new Error('Network error');
      (mockAxiosInstance.request as jest.Mock).mockRejectedValueOnce(error);
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(apiClient.request({ url: '/test' })).rejects.toThrow(TimesheetApiError);
      await expect(apiClient.request({ url: '/test' })).rejects.toThrow('Network error');
    });

    it('should handle unknown error types', async () => {
      (mockAxiosInstance.request as jest.Mock).mockRejectedValueOnce('String error');
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      await expect(apiClient.request({ url: '/test' })).rejects.toThrow(TimesheetApiError);
      await expect(apiClient.request({ url: '/test' })).rejects.toThrow('Unknown error occurred');
    });
  });

  describe('HTTP methods', () => {
    beforeEach(() => {
      apiClient = new ApiClient(mockConfig);
      // Mock the request method
      jest.spyOn(apiClient, 'request').mockResolvedValue({ data: 'test' });
    });

    describe('GET', () => {
      it('should make GET request without params', async () => {
        await apiClient.get('/test');

        expect(apiClient.request).toHaveBeenCalledWith({
          method: 'GET',
          url: '/test',
          params: undefined,
        });
      });

      it('should make GET request with params', async () => {
        const params = { page: 1, limit: 10 };
        await apiClient.get('/test', params);

        expect(apiClient.request).toHaveBeenCalledWith({
          method: 'GET',
          url: '/test',
          params,
        });
      });
    });

    describe('POST', () => {
      it('should make POST request without data or params', async () => {
        await apiClient.post('/test');

        expect(apiClient.request).toHaveBeenCalledWith({
          method: 'POST',
          url: '/test',
          data: undefined,
          params: undefined,
        });
      });

      it('should make POST request with data and params', async () => {
        const data = { name: 'Test' };
        const params = { validate: true };
        await apiClient.post('/test', data, params);

        expect(apiClient.request).toHaveBeenCalledWith({
          method: 'POST',
          url: '/test',
          data,
          params,
        });
      });
    });

    describe('PUT', () => {
      it('should make PUT request without data or params', async () => {
        await apiClient.put('/test');

        expect(apiClient.request).toHaveBeenCalledWith({
          method: 'PUT',
          url: '/test',
          data: undefined,
          params: undefined,
        });
      });

      it('should make PUT request with data and params', async () => {
        const data = { name: 'Updated' };
        const params = { validate: true };
        await apiClient.put('/test', data, params);

        expect(apiClient.request).toHaveBeenCalledWith({
          method: 'PUT',
          url: '/test',
          data,
          params,
        });
      });
    });

    describe('DELETE', () => {
      it('should make DELETE request without params', async () => {
        await apiClient.delete('/test');

        expect(apiClient.request).toHaveBeenCalledWith({
          method: 'DELETE',
          url: '/test',
          params: undefined,
        });
      });

      it('should make DELETE request with params', async () => {
        const params = { force: true };
        await apiClient.delete('/test', params);

        expect(apiClient.request).toHaveBeenCalledWith({
          method: 'DELETE',
          url: '/test',
          params,
        });
      });
    });
  });

  describe('sleep method', () => {
    beforeEach(() => {
      apiClient = new ApiClient(mockConfig);
    });

    it('should delay for specified milliseconds', async () => {
      jest.useFakeTimers();
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      
      const sleepPromise = (apiClient as any).sleep(1000);
      
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
      
      jest.advanceTimersByTime(1000);
      await sleepPromise;

      jest.useRealTimers();
      setTimeoutSpy.mockRestore();
    });
  });
});