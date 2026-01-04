import * as axios from 'axios';
import { OAuthDiscovery, discoverOAuth, getDefaultDiscovery } from '../../../auth/OAuthDiscovery';
import type {
  AuthorizationServerMetadata,
  ProtectedResourceMetadata,
  OpenIdConfiguration,
} from '../../../auth/OAuthMetadata';

describe('OAuthDiscovery', () => {
  let mockedAxiosGet: jest.SpyInstance;

  const mockAuthServerMetadata: AuthorizationServerMetadata = {
    issuer: 'https://api.timesheet.io',
    authorization_endpoint: 'https://api.timesheet.io/oauth2/auth',
    token_endpoint: 'https://api.timesheet.io/oauth2/token',
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'none'],
    scopes_supported: ['read', 'write'],
    revocation_endpoint: 'https://api.timesheet.io/oauth2/revoke',
    introspection_endpoint: 'https://api.timesheet.io/oauth2/introspect',
    service_documentation: 'https://docs.timesheet.io',
  };

  const mockProtectedResourceMetadata: ProtectedResourceMetadata = {
    resource: 'https://api.timesheet.io',
    authorization_servers: ['https://api.timesheet.io'],
    scopes_supported: ['read', 'write'],
    bearer_methods_supported: ['header'],
  };

  const mockOpenIdConfiguration: OpenIdConfiguration = {
    issuer: 'https://api.timesheet.io',
    authorization_endpoint: 'https://api.timesheet.io/oauth2/auth',
    token_endpoint: 'https://api.timesheet.io/oauth2/token',
    jwks_uri: 'https://api.timesheet.io/.well-known/jwks.json',
    response_types_supported: ['code'],
    scopes_supported: ['openid', 'profile', 'email'],
    code_challenge_methods_supported: ['S256'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxiosGet = jest.spyOn(axios.default, 'get');
  });

  afterEach(() => {
    mockedAxiosGet.mockRestore();
  });

  describe('constructor', () => {
    test('should create instance with default options', () => {
      const discovery = new OAuthDiscovery();
      expect(discovery).toBeInstanceOf(OAuthDiscovery);
    });

    test('should create instance with custom options', () => {
      const discovery = new OAuthDiscovery({
        cacheTtl: 30000,
        timeout: 5000,
        fetchOpenIdConfig: true,
        fetchProtectedResource: true,
      });
      expect(discovery).toBeInstanceOf(OAuthDiscovery);
    });
  });

  describe('discover', () => {
    test('should fetch authorization server metadata', async () => {
      mockedAxiosGet.mockResolvedValueOnce({ data: mockAuthServerMetadata });

      const discovery = new OAuthDiscovery();
      const result = await discovery.discover('https://api.timesheet.io');

      expect(mockedAxiosGet).toHaveBeenCalledWith(
        'https://api.timesheet.io/.well-known/oauth-authorization-server',
        expect.objectContaining({
          timeout: 10000,
          headers: { Accept: 'application/json' },
        }),
      );

      expect(result.issuer).toBe('https://api.timesheet.io');
      expect(result.authorizationServer).toEqual(mockAuthServerMetadata);
      expect(result.fetchedAt).toBeInstanceOf(Date);
    });

    test('should normalize issuer URL by removing trailing slash', async () => {
      mockedAxiosGet.mockResolvedValueOnce({ data: mockAuthServerMetadata });

      const discovery = new OAuthDiscovery();
      await discovery.discover('https://api.timesheet.io/');

      expect(mockedAxiosGet).toHaveBeenCalledWith(
        'https://api.timesheet.io/.well-known/oauth-authorization-server',
        expect.any(Object),
      );
    });

    test('should use cache for subsequent requests', async () => {
      mockedAxiosGet.mockResolvedValueOnce({ data: mockAuthServerMetadata });

      const discovery = new OAuthDiscovery();

      // First call should fetch
      const result1 = await discovery.discover('https://api.timesheet.io');
      expect(mockedAxiosGet).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await discovery.discover('https://api.timesheet.io');
      expect(mockedAxiosGet).toHaveBeenCalledTimes(1);

      expect(result1).toEqual(result2);
    });

    test('should fetch OpenID configuration when enabled', async () => {
      mockedAxiosGet
        .mockResolvedValueOnce({ data: mockAuthServerMetadata })
        .mockResolvedValueOnce({ data: mockOpenIdConfiguration });

      const discovery = new OAuthDiscovery({ fetchOpenIdConfig: true });
      const result = await discovery.discover('https://api.timesheet.io');

      expect(mockedAxiosGet).toHaveBeenCalledTimes(2);
      expect(result.openIdConfiguration).toEqual(mockOpenIdConfiguration);
    });

    test('should fetch protected resource metadata when enabled', async () => {
      mockedAxiosGet
        .mockResolvedValueOnce({ data: mockAuthServerMetadata })
        .mockResolvedValueOnce({ data: mockProtectedResourceMetadata });

      const discovery = new OAuthDiscovery({ fetchProtectedResource: true });
      const result = await discovery.discover('https://api.timesheet.io');

      expect(mockedAxiosGet).toHaveBeenCalledTimes(2);
      expect(result.protectedResource).toEqual(mockProtectedResourceMetadata);
    });

    test('should continue without OpenID config if fetch fails', async () => {
      mockedAxiosGet
        .mockResolvedValueOnce({ data: mockAuthServerMetadata })
        .mockRejectedValueOnce(new Error('Not found'));

      const discovery = new OAuthDiscovery({ fetchOpenIdConfig: true });
      const result = await discovery.discover('https://api.timesheet.io');

      expect(result.authorizationServer).toEqual(mockAuthServerMetadata);
      expect(result.openIdConfiguration).toBeUndefined();
    });

    test('should continue without protected resource if fetch fails', async () => {
      mockedAxiosGet
        .mockResolvedValueOnce({ data: mockAuthServerMetadata })
        .mockRejectedValueOnce(new Error('Not found'));

      const discovery = new OAuthDiscovery({ fetchProtectedResource: true });
      const result = await discovery.discover('https://api.timesheet.io');

      expect(result.authorizationServer).toEqual(mockAuthServerMetadata);
      expect(result.protectedResource).toBeUndefined();
    });
  });

  describe('fetchAuthorizationServerMetadata', () => {
    test('should fetch and validate metadata', async () => {
      mockedAxiosGet.mockResolvedValueOnce({ data: mockAuthServerMetadata });

      const discovery = new OAuthDiscovery();
      const metadata = await discovery.fetchAuthorizationServerMetadata('https://api.timesheet.io');

      expect(metadata).toEqual(mockAuthServerMetadata);
    });

    test('should throw error for missing issuer', async () => {
      mockedAxiosGet.mockResolvedValueOnce({
        data: { ...mockAuthServerMetadata, issuer: undefined },
      });

      const discovery = new OAuthDiscovery();
      await expect(discovery.fetchAuthorizationServerMetadata('https://api.timesheet.io')).rejects.toThrow(
        'missing required field: issuer',
      );
    });

    test('should throw error for missing authorization_endpoint', async () => {
      mockedAxiosGet.mockResolvedValueOnce({
        data: { ...mockAuthServerMetadata, authorization_endpoint: undefined },
      });

      const discovery = new OAuthDiscovery();
      await expect(discovery.fetchAuthorizationServerMetadata('https://api.timesheet.io')).rejects.toThrow(
        'missing required field: authorization_endpoint',
      );
    });

    test('should throw error for missing token_endpoint', async () => {
      mockedAxiosGet.mockResolvedValueOnce({
        data: { ...mockAuthServerMetadata, token_endpoint: undefined },
      });

      const discovery = new OAuthDiscovery();
      await expect(discovery.fetchAuthorizationServerMetadata('https://api.timesheet.io')).rejects.toThrow(
        'missing required field: token_endpoint',
      );
    });

    test('should throw error for missing response_types_supported', async () => {
      mockedAxiosGet.mockResolvedValueOnce({
        data: { ...mockAuthServerMetadata, response_types_supported: undefined },
      });

      const discovery = new OAuthDiscovery();
      await expect(discovery.fetchAuthorizationServerMetadata('https://api.timesheet.io')).rejects.toThrow(
        'missing required field: response_types_supported',
      );
    });

    test('should throw error on network failure', async () => {
      mockedAxiosGet.mockRejectedValueOnce(new Error('Network error'));

      const discovery = new OAuthDiscovery();
      await expect(discovery.fetchAuthorizationServerMetadata('https://api.timesheet.io')).rejects.toThrow(
        'Failed to fetch authorization server metadata',
      );
    });
  });

  describe('fetchOpenIdConfiguration', () => {
    test('should fetch and validate OpenID configuration', async () => {
      mockedAxiosGet.mockResolvedValueOnce({ data: mockOpenIdConfiguration });

      const discovery = new OAuthDiscovery();
      const config = await discovery.fetchOpenIdConfiguration('https://api.timesheet.io');

      expect(config).toEqual(mockOpenIdConfiguration);
      expect(mockedAxiosGet).toHaveBeenCalledWith(
        'https://api.timesheet.io/.well-known/openid-configuration',
        expect.any(Object),
      );
    });

    test('should throw error for missing jwks_uri', async () => {
      mockedAxiosGet.mockResolvedValueOnce({
        data: { ...mockOpenIdConfiguration, jwks_uri: undefined },
      });

      const discovery = new OAuthDiscovery();
      await expect(discovery.fetchOpenIdConfiguration('https://api.timesheet.io')).rejects.toThrow(
        'missing required field: jwks_uri',
      );
    });
  });

  describe('fetchProtectedResourceMetadata', () => {
    test('should fetch and validate protected resource metadata', async () => {
      mockedAxiosGet.mockResolvedValueOnce({ data: mockProtectedResourceMetadata });

      const discovery = new OAuthDiscovery();
      const metadata = await discovery.fetchProtectedResourceMetadata('https://api.timesheet.io');

      expect(metadata).toEqual(mockProtectedResourceMetadata);
      expect(mockedAxiosGet).toHaveBeenCalledWith(
        'https://api.timesheet.io/.well-known/oauth-protected-resource',
        expect.any(Object),
      );
    });

    test('should throw error for missing resource', async () => {
      mockedAxiosGet.mockResolvedValueOnce({
        data: { ...mockProtectedResourceMetadata, resource: undefined },
      });

      const discovery = new OAuthDiscovery();
      await expect(discovery.fetchProtectedResourceMetadata('https://api.timesheet.io')).rejects.toThrow(
        'missing required field: resource',
      );
    });

    test('should throw error for missing authorization_servers', async () => {
      mockedAxiosGet.mockResolvedValueOnce({
        data: { ...mockProtectedResourceMetadata, authorization_servers: [] },
      });

      const discovery = new OAuthDiscovery();
      await expect(discovery.fetchProtectedResourceMetadata('https://api.timesheet.io')).rejects.toThrow(
        'missing required field: authorization_servers',
      );
    });
  });

  describe('cache management', () => {
    test('isCached should return false for uncached issuer', () => {
      const discovery = new OAuthDiscovery();
      expect(discovery.isCached('https://api.timesheet.io')).toBe(false);
    });

    test('isCached should return true for cached issuer', async () => {
      mockedAxiosGet.mockResolvedValueOnce({ data: mockAuthServerMetadata });

      const discovery = new OAuthDiscovery();
      await discovery.discover('https://api.timesheet.io');

      expect(discovery.isCached('https://api.timesheet.io')).toBe(true);
    });

    test('clearCache should remove all cached entries', async () => {
      mockedAxiosGet.mockResolvedValueOnce({ data: mockAuthServerMetadata });

      const discovery = new OAuthDiscovery();
      await discovery.discover('https://api.timesheet.io');

      discovery.clearCache();

      expect(discovery.isCached('https://api.timesheet.io')).toBe(false);
    });

    test('clearCacheForIssuer should remove specific cached entry', async () => {
      mockedAxiosGet
        .mockResolvedValueOnce({ data: mockAuthServerMetadata })
        .mockResolvedValueOnce({
          data: { ...mockAuthServerMetadata, issuer: 'https://other.example.com' },
        });

      const discovery = new OAuthDiscovery();
      await discovery.discover('https://api.timesheet.io');
      await discovery.discover('https://other.example.com');

      discovery.clearCacheForIssuer('https://api.timesheet.io');

      expect(discovery.isCached('https://api.timesheet.io')).toBe(false);
      expect(discovery.isCached('https://other.example.com')).toBe(true);
    });

    test('cache should expire after TTL', async () => {
      jest.useFakeTimers();

      mockedAxiosGet.mockResolvedValue({ data: mockAuthServerMetadata });

      const discovery = new OAuthDiscovery({ cacheTtl: 1000 }); // 1 second TTL
      await discovery.discover('https://api.timesheet.io');

      expect(discovery.isCached('https://api.timesheet.io')).toBe(true);

      // Advance time past TTL
      jest.advanceTimersByTime(1001);

      expect(discovery.isCached('https://api.timesheet.io')).toBe(false);

      jest.useRealTimers();
    });
  });

  describe('discoverOAuth convenience function', () => {
    test('should use default discovery instance', async () => {
      mockedAxiosGet.mockResolvedValueOnce({ data: mockAuthServerMetadata });

      const result = await discoverOAuth('https://api.timesheet.io');

      expect(result.issuer).toBe('https://api.timesheet.io');
      expect(result.authorizationServer).toEqual(mockAuthServerMetadata);
    });

    test('should use custom options when provided', async () => {
      mockedAxiosGet
        .mockResolvedValueOnce({ data: mockAuthServerMetadata })
        .mockResolvedValueOnce({ data: mockOpenIdConfiguration });

      const result = await discoverOAuth('https://api.timesheet.io', {
        fetchOpenIdConfig: true,
      });

      expect(result.openIdConfiguration).toEqual(mockOpenIdConfiguration);
    });
  });

  describe('getDefaultDiscovery', () => {
    test('should return singleton instance', () => {
      const instance1 = getDefaultDiscovery();
      const instance2 = getDefaultDiscovery();

      expect(instance1).toBe(instance2);
    });
  });
});
