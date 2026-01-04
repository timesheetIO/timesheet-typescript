import type { AxiosRequestConfig } from 'axios';
import * as axios from 'axios';
import { OAuth21Auth } from '../../../auth/OAuth21Auth';
import { generatePkceCodePair, generateCodeVerifier } from '../../../auth/pkce';

describe('OAuth21Auth', () => {
  let mockedAxiosPost: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxiosPost = jest.spyOn(axios.default, 'post');
  });

  afterEach(() => {
    mockedAxiosPost.mockRestore();
  });

  describe('constructor', () => {
    test('should create instance with access token', () => {
      const auth = new OAuth21Auth('test-access-token');
      expect(auth).toBeInstanceOf(OAuth21Auth);
    });

    test('should create instance with refresh options', () => {
      const auth = new OAuth21Auth({
        clientId: 'test-client-id',
        refreshToken: 'test-refresh-token',
      });
      expect(auth).toBeInstanceOf(OAuth21Auth);
    });

    test('should create instance with full refresh options', () => {
      const auth = new OAuth21Auth({
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        refreshToken: 'test-refresh-token',
        resource: 'https://api.example.com',
      });
      expect(auth).toBeInstanceOf(OAuth21Auth);
    });
  });

  describe('applyAuth', () => {
    test('should add Bearer authorization header', () => {
      const auth = new OAuth21Auth('test-access-token');
      const config: AxiosRequestConfig = { headers: {} };

      auth.applyAuth(config);

      expect(config.headers!.Authorization).toBe('Bearer test-access-token');
    });

    test('should create headers object if not present', () => {
      const auth = new OAuth21Auth('test-access-token');
      const config: AxiosRequestConfig = {};

      auth.applyAuth(config);

      expect(config.headers).toBeDefined();
      expect(config.headers!.Authorization).toBe('Bearer test-access-token');
    });

    test('should preserve existing headers', () => {
      const auth = new OAuth21Auth('test-access-token');
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      auth.applyAuth(config);

      expect(config.headers!['Content-Type']).toBe('application/json');
      expect(config.headers!.Authorization).toBe('Bearer test-access-token');
    });
  });

  describe('needsRefresh', () => {
    test('should return false for simple access token without refresh capability', () => {
      const auth = new OAuth21Auth('test-access-token');
      expect(auth.needsRefresh()).toBe(false);
    });

    test('should return true when refresh token exists but no access token', () => {
      const auth = new OAuth21Auth({
        clientId: 'test-client-id',
        refreshToken: 'test-refresh-token',
      });
      expect(auth.needsRefresh()).toBe(true);
    });
  });

  describe('refresh', () => {
    test('should throw error when no refresh token available', async () => {
      const auth = new OAuth21Auth('test-access-token');
      await expect(auth.refresh()).rejects.toThrow('Cannot refresh without refresh token');
    });

    test('should refresh token with refresh token', async () => {
      mockedAxiosPost.mockResolvedValueOnce({
        data: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          token_type: 'Bearer',
          expires_in: 3600,
        },
      });

      const auth = new OAuth21Auth({
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        refreshToken: 'test-refresh-token',
      });

      await auth.refresh();

      expect(mockedAxiosPost).toHaveBeenCalledWith(
        'https://api.timesheet.io/oauth2/token',
        expect.any(URLSearchParams),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const config: AxiosRequestConfig = { headers: {} };
      auth.applyAuth(config);
      expect(config.headers!.Authorization).toBe('Bearer new-access-token');
    });

    test('should include resource in refresh request if specified', async () => {
      mockedAxiosPost.mockResolvedValueOnce({
        data: {
          access_token: 'new-access-token',
          token_type: 'Bearer',
        },
      });

      const auth = new OAuth21Auth({
        clientId: 'test-client-id',
        refreshToken: 'test-refresh-token',
        resource: 'https://api.example.com',
      });

      await auth.refresh();

      const callArgs = mockedAxiosPost.mock.calls[0];
      const params = callArgs[1] as URLSearchParams;
      expect(params.get('resource')).toBe('https://api.example.com');
    });

    test('should not include client_secret for public clients', async () => {
      mockedAxiosPost.mockResolvedValueOnce({
        data: {
          access_token: 'new-access-token',
          token_type: 'Bearer',
        },
      });

      const auth = new OAuth21Auth({
        clientId: 'test-client-id',
        refreshToken: 'test-refresh-token',
        // No clientSecret - public client
      });

      await auth.refresh();

      const callArgs = mockedAxiosPost.mock.calls[0];
      const params = callArgs[1] as URLSearchParams;
      expect(params.get('client_secret')).toBeNull();
    });
  });

  describe('getAuthHeaders', () => {
    test('should return authorization headers', async () => {
      const auth = new OAuth21Auth('test-access-token');
      const headers = await auth.getAuthHeaders();
      expect(headers).toEqual({ Authorization: 'Bearer test-access-token' });
    });

    test('should refresh before returning headers if needed', async () => {
      mockedAxiosPost.mockResolvedValueOnce({
        data: {
          access_token: 'new-access-token',
          token_type: 'Bearer',
        },
      });

      const auth = new OAuth21Auth({
        clientId: 'test-client-id',
        refreshToken: 'test-refresh-token',
      });

      const headers = await auth.getAuthHeaders();

      expect(mockedAxiosPost).toHaveBeenCalled();
      expect(headers).toEqual({ Authorization: 'Bearer new-access-token' });
    });
  });

  describe('fromAuthorizationCode', () => {
    test('should exchange authorization code for tokens with PKCE', async () => {
      mockedAxiosPost.mockResolvedValueOnce({
        data: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          token_type: 'Bearer',
          expires_in: 3600,
        },
      });

      const codeVerifier = generateCodeVerifier();

      const auth = await OAuth21Auth.fromAuthorizationCode({
        clientId: 'test-client-id',
        authorizationCode: 'auth-code-123',
        redirectUri: 'https://example.com/callback',
        codeVerifier,
      });

      expect(auth).toBeInstanceOf(OAuth21Auth);
      expect(mockedAxiosPost).toHaveBeenCalledWith(
        'https://api.timesheet.io/oauth2/token',
        expect.any(URLSearchParams),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const callArgs = mockedAxiosPost.mock.calls[0];
      const params = callArgs[1] as URLSearchParams;
      expect(params.get('grant_type')).toBe('authorization_code');
      expect(params.get('code')).toBe('auth-code-123');
      expect(params.get('code_verifier')).toBe(codeVerifier);
    });

    test('should throw error for invalid code verifier', async () => {
      await expect(
        OAuth21Auth.fromAuthorizationCode({
          clientId: 'test-client-id',
          authorizationCode: 'auth-code-123',
          redirectUri: 'https://example.com/callback',
          codeVerifier: 'too-short',
        }),
      ).rejects.toThrow('Invalid code verifier');
    });

    test('should include resource in token request if specified', async () => {
      mockedAxiosPost.mockResolvedValueOnce({
        data: {
          access_token: 'new-access-token',
          token_type: 'Bearer',
        },
      });

      const codeVerifier = generateCodeVerifier();

      await OAuth21Auth.fromAuthorizationCode({
        clientId: 'test-client-id',
        authorizationCode: 'auth-code-123',
        redirectUri: 'https://example.com/callback',
        codeVerifier,
        resource: 'https://api.example.com',
      });

      const callArgs = mockedAxiosPost.mock.calls[0];
      const params = callArgs[1] as URLSearchParams;
      expect(params.get('resource')).toBe('https://api.example.com');
    });

    test('should return auth with refresh capability when refresh token is provided', async () => {
      mockedAxiosPost.mockResolvedValueOnce({
        data: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          token_type: 'Bearer',
        },
      });

      const codeVerifier = generateCodeVerifier();

      const auth = await OAuth21Auth.fromAuthorizationCode({
        clientId: 'test-client-id',
        authorizationCode: 'auth-code-123',
        redirectUri: 'https://example.com/callback',
        codeVerifier,
      });

      // Auth should have refresh capability
      expect(auth.needsRefresh()).toBe(true);
    });

    test('should return simple token auth when no refresh token is provided', async () => {
      mockedAxiosPost.mockResolvedValueOnce({
        data: {
          access_token: 'new-access-token',
          token_type: 'Bearer',
          // No refresh_token
        },
      });

      const codeVerifier = generateCodeVerifier();

      const auth = await OAuth21Auth.fromAuthorizationCode({
        clientId: 'test-client-id',
        authorizationCode: 'auth-code-123',
        redirectUri: 'https://example.com/callback',
        codeVerifier,
      });

      // Auth should NOT have refresh capability
      expect(auth.needsRefresh()).toBe(false);
    });
  });

  describe('buildAuthorizationUrl', () => {
    test('should build URL with required PKCE parameters', () => {
      const pkce = generatePkceCodePair();

      const url = OAuth21Auth.buildAuthorizationUrl({
        clientId: 'test-client-id',
        redirectUri: 'https://example.com/callback',
        codeChallenge: pkce.codeChallenge,
        codeChallengeMethod: pkce.codeChallengeMethod,
      });

      expect(url).toContain('https://api.timesheet.io/oauth2/auth?');
      expect(url).toContain('response_type=code');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Fcallback');
      expect(url).toContain(`code_challenge=${pkce.codeChallenge}`);
      expect(url).toContain('code_challenge_method=S256');
    });

    test('should use S256 as default challenge method', () => {
      const url = OAuth21Auth.buildAuthorizationUrl({
        clientId: 'test-client-id',
        redirectUri: 'https://example.com/callback',
        codeChallenge: 'test-challenge',
      });

      expect(url).toContain('code_challenge_method=S256');
    });

    test('should include state if provided', () => {
      const url = OAuth21Auth.buildAuthorizationUrl({
        clientId: 'test-client-id',
        redirectUri: 'https://example.com/callback',
        codeChallenge: 'test-challenge',
        state: 'csrf-state-123',
      });

      expect(url).toContain('state=csrf-state-123');
    });

    test('should include scope if provided', () => {
      const url = OAuth21Auth.buildAuthorizationUrl({
        clientId: 'test-client-id',
        redirectUri: 'https://example.com/callback',
        codeChallenge: 'test-challenge',
        scope: 'read write',
      });

      expect(url).toContain('scope=read+write');
    });

    test('should include resource if provided', () => {
      const url = OAuth21Auth.buildAuthorizationUrl({
        clientId: 'test-client-id',
        redirectUri: 'https://example.com/callback',
        codeChallenge: 'test-challenge',
        resource: 'https://api.example.com',
      });

      expect(url).toContain('resource=https%3A%2F%2Fapi.example.com');
    });
  });

  describe('generatePkce', () => {
    test('should generate PKCE pair with default S256 method', () => {
      const pkce = OAuth21Auth.generatePkce();

      expect(pkce.codeVerifier).toBeDefined();
      expect(pkce.codeChallenge).toBeDefined();
      expect(pkce.codeChallengeMethod).toBe('S256');
      expect(pkce.codeVerifier.length).toBe(64);
    });

    test('should generate PKCE pair with plain method', () => {
      const pkce = OAuth21Auth.generatePkce('plain');

      expect(pkce.codeChallengeMethod).toBe('plain');
      expect(pkce.codeChallenge).toBe(pkce.codeVerifier);
    });
  });

  describe('complete OAuth 2.1 flow', () => {
    test('should complete full authorization code flow with PKCE', async () => {
      // Step 1: Generate PKCE
      const pkce = OAuth21Auth.generatePkce();

      // Step 2: Build authorization URL
      const authUrl = OAuth21Auth.buildAuthorizationUrl({
        clientId: 'test-client-id',
        redirectUri: 'https://example.com/callback',
        codeChallenge: pkce.codeChallenge,
        codeChallengeMethod: pkce.codeChallengeMethod,
        state: 'csrf-state',
      });

      expect(authUrl).toContain('code_challenge');
      expect(authUrl).toContain('code_challenge_method=S256');

      // Step 3: Exchange code for tokens (mocked)
      mockedAxiosPost.mockResolvedValueOnce({
        data: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          token_type: 'Bearer',
          expires_in: 3600,
        },
      });

      const auth = await OAuth21Auth.fromAuthorizationCode({
        clientId: 'test-client-id',
        authorizationCode: 'auth-code-from-callback',
        redirectUri: 'https://example.com/callback',
        codeVerifier: pkce.codeVerifier,
      });

      // Verify code_verifier was sent
      const callArgs = mockedAxiosPost.mock.calls[0];
      const params = callArgs[1] as URLSearchParams;
      expect(params.get('code_verifier')).toBe(pkce.codeVerifier);

      // Step 4: Use auth instance
      expect(auth).toBeInstanceOf(OAuth21Auth);
      expect(auth.needsRefresh()).toBe(true);
    });
  });

  describe('custom endpoints', () => {
    test('should use custom token endpoint in fromAuthorizationCode', async () => {
      mockedAxiosPost.mockResolvedValueOnce({
        data: {
          access_token: 'new-access-token',
          token_type: 'Bearer',
        },
      });

      const codeVerifier = generateCodeVerifier();

      await OAuth21Auth.fromAuthorizationCode({
        clientId: 'test-client-id',
        authorizationCode: 'auth-code-123',
        redirectUri: 'https://example.com/callback',
        codeVerifier,
        tokenEndpoint: 'https://custom.server.com/oauth/token',
      });

      expect(mockedAxiosPost).toHaveBeenCalledWith(
        'https://custom.server.com/oauth/token',
        expect.any(URLSearchParams),
        expect.any(Object),
      );
    });

    test('should use custom authorization endpoint in buildAuthorizationUrl', () => {
      const pkce = generatePkceCodePair();

      const url = OAuth21Auth.buildAuthorizationUrl({
        clientId: 'test-client-id',
        redirectUri: 'https://example.com/callback',
        codeChallenge: pkce.codeChallenge,
        authorizationEndpoint: 'https://custom.server.com/oauth/authorize',
      });

      expect(url).toContain('https://custom.server.com/oauth/authorize?');
    });

    test('should use custom token endpoint for refresh', async () => {
      mockedAxiosPost.mockResolvedValueOnce({
        data: {
          access_token: 'new-access-token',
          token_type: 'Bearer',
        },
      });

      const auth = new OAuth21Auth({
        clientId: 'test-client-id',
        refreshToken: 'test-refresh-token',
        tokenEndpoint: 'https://custom.server.com/oauth/token',
      });

      await auth.refresh();

      expect(mockedAxiosPost).toHaveBeenCalledWith(
        'https://custom.server.com/oauth/token',
        expect.any(URLSearchParams),
        expect.any(Object),
      );
    });
  });
});
