import { OAuth2Auth } from '../../../auth/OAuth2Auth';
import { ApiClient } from '../../../http/ApiClient';
import { TimesheetAuthError } from '../../../exceptions';

// Mock ApiClient
jest.mock('../../../http/ApiClient');

describe('OAuth2Auth', () => {
  let oauth2Auth: OAuth2Auth;
  let mockHttpClient: jest.Mocked<ApiClient>;
  const mockConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/callback',
  };

  beforeEach(() => {
    mockHttpClient = {
      post: jest.fn(),
    } as unknown as jest.Mocked<ApiClient>;

    oauth2Auth = new OAuth2Auth(mockConfig, mockHttpClient);
  });

  describe('constructor', () => {
    it('should initialize with config', () => {
      expect(oauth2Auth).toBeDefined();
      expect((oauth2Auth as any).config).toEqual(mockConfig);
    });

    it('should throw error if httpClient is not provided', () => {
      expect(() => new OAuth2Auth(mockConfig)).toThrow(
        'HTTP client is required for OAuth2 authentication'
      );
    });
  });

  describe('getAuthorizationUrl', () => {
    it('should generate authorization URL with default parameters', () => {
      const url = oauth2Auth.getAuthorizationUrl();
      const urlObj = new URL(url);

      expect(urlObj.origin).toBe('https://api.timesheet.io');
      expect(urlObj.pathname).toBe('/oauth/authorize');
      expect(urlObj.searchParams.get('client_id')).toBe('test-client-id');
      expect(urlObj.searchParams.get('redirect_uri')).toBe('http://localhost:3000/callback');
      expect(urlObj.searchParams.get('response_type')).toBe('code');
      expect(urlObj.searchParams.get('scope')).toBe('read write');
      expect(urlObj.searchParams.get('state')).toBeTruthy(); // Random state
    });

    it('should generate authorization URL with custom state and scope', () => {
      const customState = 'custom-state-123';
      const customScope = 'read:tasks write:tasks';
      
      const url = oauth2Auth.getAuthorizationUrl(customState, customScope);
      const urlObj = new URL(url);

      expect(urlObj.searchParams.get('state')).toBe(customState);
      expect(urlObj.searchParams.get('scope')).toBe(customScope);
    });
  });

  describe('exchangeCodeForToken', () => {
    it('should exchange authorization code for tokens', async () => {
      const mockResponse = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        token_type: 'Bearer',
        expires_in: 3600,
      };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await oauth2Auth.exchangeCodeForToken('test-auth-code');

      expect(mockHttpClient.post).toHaveBeenCalledWith('/oauth/token', {
        grant_type: 'authorization_code',
        code: 'test-auth-code',
        client_id: 'test-client-id',
        client_secret: 'test-client-secret',
        redirect_uri: 'http://localhost:3000/callback',
      });
      expect(result).toEqual(mockResponse);
      expect(oauth2Auth.getAccessToken()).toBe('test-access-token');
      expect(oauth2Auth.getRefreshToken()).toBe('test-refresh-token');
    });

    it('should handle token exchange errors', async () => {
      mockHttpClient.post.mockRejectedValueOnce(new Error('Invalid authorization code'));

      await expect(oauth2Auth.exchangeCodeForToken('invalid-code')).rejects.toThrow(
        TimesheetAuthError
      );
    });
  });

  describe('refreshAccessToken', () => {
    beforeEach(() => {
      // Set initial tokens
      (oauth2Auth as any).accessToken = 'old-access-token';
      (oauth2Auth as any).refreshToken = 'test-refresh-token';
    });

    it('should refresh access token using refresh token', async () => {
      const mockResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        token_type: 'Bearer',
        expires_in: 3600,
      };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await oauth2Auth.refreshAccessToken();

      expect(mockHttpClient.post).toHaveBeenCalledWith('/oauth/token', {
        grant_type: 'refresh_token',
        refresh_token: 'test-refresh-token',
        client_id: 'test-client-id',
        client_secret: 'test-client-secret',
      });
      expect(result).toEqual(mockResponse);
      expect(oauth2Auth.getAccessToken()).toBe('new-access-token');
      expect(oauth2Auth.getRefreshToken()).toBe('new-refresh-token');
    });

    it('should throw error if no refresh token available', async () => {
      (oauth2Auth as any).refreshToken = null;

      await expect(oauth2Auth.refreshAccessToken()).rejects.toThrow(
        'No refresh token available'
      );
    });

    it('should handle refresh token errors', async () => {
      mockHttpClient.post.mockRejectedValueOnce(new Error('Invalid refresh token'));

      await expect(oauth2Auth.refreshAccessToken()).rejects.toThrow(
        TimesheetAuthError
      );
    });
  });

  describe('getAuthHeaders', () => {
    it('should return auth headers when access token is available', async () => {
      (oauth2Auth as any).accessToken = 'test-access-token';

      const headers = await oauth2Auth.getAuthHeaders();

      expect(headers).toEqual({
        Authorization: 'Bearer test-access-token',
      });
    });

    it('should return null when no access token is available', async () => {
      (oauth2Auth as any).accessToken = null;

      const headers = await oauth2Auth.getAuthHeaders();

      expect(headers).toBeNull();
    });

    it('should refresh token if expired', async () => {
      (oauth2Auth as any).accessToken = 'old-access-token';
      (oauth2Auth as any).refreshToken = 'test-refresh-token';
      (oauth2Auth as any).tokenExpiresAt = new Date(Date.now() - 1000); // Expired

      const mockResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        token_type: 'Bearer',
        expires_in: 3600,
      };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const headers = await oauth2Auth.getAuthHeaders();

      expect(mockHttpClient.post).toHaveBeenCalled();
      expect(headers).toEqual({
        Authorization: 'Bearer new-access-token',
      });
    });
  });

  describe('isTokenExpired', () => {
    it('should return true if no expiry date', () => {
      (oauth2Auth as any).tokenExpiresAt = null;
      expect(oauth2Auth.isTokenExpired()).toBe(true);
    });

    it('should return true if token is expired', () => {
      (oauth2Auth as any).tokenExpiresAt = new Date(Date.now() - 1000);
      expect(oauth2Auth.isTokenExpired()).toBe(true);
    });

    it('should return false if token is not expired', () => {
      (oauth2Auth as any).tokenExpiresAt = new Date(Date.now() + 10000);
      expect(oauth2Auth.isTokenExpired()).toBe(false);
    });

    it('should consider buffer time for expiry', () => {
      // Set expiry to 30 seconds from now (within 60 second buffer)
      (oauth2Auth as any).tokenExpiresAt = new Date(Date.now() + 30000);
      expect(oauth2Auth.isTokenExpired()).toBe(true);
    });
  });

  describe('setTokens', () => {
    it('should set all token properties', () => {
      const tokenResponse = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        token_type: 'Bearer',
        expires_in: 3600,
      };

      oauth2Auth.setTokens(tokenResponse);

      expect(oauth2Auth.getAccessToken()).toBe('test-access-token');
      expect(oauth2Auth.getRefreshToken()).toBe('test-refresh-token');
      expect(oauth2Auth.getTokenType()).toBe('Bearer');
      expect(oauth2Auth.isTokenExpired()).toBe(false);
    });

    it('should handle missing optional fields', () => {
      const tokenResponse = {
        access_token: 'test-access-token',
        token_type: 'Bearer',
      };

      oauth2Auth.setTokens(tokenResponse);

      expect(oauth2Auth.getAccessToken()).toBe('test-access-token');
      expect(oauth2Auth.getRefreshToken()).toBeNull();
      expect(oauth2Auth.getTokenType()).toBe('Bearer');
    });

    it('should handle custom token type', () => {
      const tokenResponse = {
        access_token: 'test-access-token',
        token_type: 'CustomBearer',
        expires_in: 7200,
      };

      oauth2Auth.setTokens(tokenResponse);

      expect(oauth2Auth.getTokenType()).toBe('CustomBearer');
      const expiresAt = (oauth2Auth as any).tokenExpiresAt;
      expect(expiresAt).toBeInstanceOf(Date);
      expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('getExpiresAt', () => {
    it('should return token expiry date', () => {
      const tokenResponse = {
        access_token: 'test-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      };

      oauth2Auth.setTokens(tokenResponse);
      const expiresAt = oauth2Auth.getExpiresAt();

      expect(expiresAt).toBeInstanceOf(Date);
      expect(expiresAt?.getTime()).toBeGreaterThan(Date.now());
      expect(expiresAt?.getTime()).toBeLessThanOrEqual(Date.now() + 3600 * 1000);
    });

    it('should return null when no expiry is set', () => {
      expect(oauth2Auth.getExpiresAt()).toBeNull();
    });
  });

  describe('revoke', () => {
    it('should revoke access token', async () => {
      (oauth2Auth as any).accessToken = 'test-access-token';
      mockHttpClient.post.mockResolvedValueOnce({});

      await oauth2Auth.revoke();

      expect(mockHttpClient.post).toHaveBeenCalledWith('/oauth/revoke', {
        token: 'test-access-token',
        token_type_hint: 'access_token',
        client_id: 'test-client-id',
        client_secret: 'test-client-secret',
      });
      expect(oauth2Auth.getAccessToken()).toBeNull();
      expect(oauth2Auth.getRefreshToken()).toBeNull();
    });

    it('should revoke refresh token if no access token', async () => {
      (oauth2Auth as any).accessToken = null;
      (oauth2Auth as any).refreshToken = 'test-refresh-token';
      mockHttpClient.post.mockResolvedValueOnce({});

      await oauth2Auth.revoke();

      expect(mockHttpClient.post).toHaveBeenCalledWith('/oauth/revoke', {
        token: 'test-refresh-token',
        token_type_hint: 'refresh_token',
        client_id: 'test-client-id',
        client_secret: 'test-client-secret',
      });
    });

    it('should handle revoke errors gracefully', async () => {
      (oauth2Auth as any).accessToken = 'test-access-token';
      mockHttpClient.post.mockRejectedValueOnce(new Error('Revoke failed'));

      // Should not throw, just clear tokens
      await oauth2Auth.revoke();

      expect(oauth2Auth.getAccessToken()).toBeNull();
      expect(oauth2Auth.getRefreshToken()).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('should clear all token data', () => {
      (oauth2Auth as any).accessToken = 'test-access-token';
      (oauth2Auth as any).refreshToken = 'test-refresh-token';
      (oauth2Auth as any).tokenType = 'Bearer';
      (oauth2Auth as any).tokenExpiresAt = new Date();

      oauth2Auth.clearTokens();

      expect(oauth2Auth.getAccessToken()).toBeNull();
      expect(oauth2Auth.getRefreshToken()).toBeNull();
      expect(oauth2Auth.getTokenType()).toBeNull();
      expect(oauth2Auth.isTokenExpired()).toBe(true);
    });
  });
});