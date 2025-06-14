import { OAuth2Auth } from '../../../auth/OAuth2Auth';
import { AxiosRequestConfig } from 'axios';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OAuth2Auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with simple bearer token', () => {
      const auth = new OAuth2Auth('test-access-token');
      expect(auth).toBeDefined();
    });

    it('should create instance with OAuth2 refresh configuration', () => {
      const auth = new OAuth2Auth('client-id', 'client-secret', 'refresh-token');
      expect(auth).toBeDefined();
    });
  });

  describe('applyAuth', () => {
    it('should add Authorization header with bearer token', () => {
      const auth = new OAuth2Auth('test-access-token');
      const config: AxiosRequestConfig = {};
      
      auth.applyAuth(config);
      
      expect(config.headers).toBeDefined();
      expect(config.headers!['Authorization']).toBe('Bearer test-access-token');
    });

    it('should preserve existing headers', () => {
      const auth = new OAuth2Auth('test-access-token');
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      auth.applyAuth(config);
      
      expect(config.headers!['Content-Type']).toBe('application/json');
      expect(config.headers!['Authorization']).toBe('Bearer test-access-token');
    });
  });

  describe('needsRefresh', () => {
    it('should return true when no access token but has refresh token', () => {
      const auth = new OAuth2Auth('client-id', 'client-secret', 'refresh-token');
      expect(auth.needsRefresh()).toBe(true);
    });

    it('should return false for simple bearer token', () => {
      const auth = new OAuth2Auth('test-access-token');
      expect(auth.needsRefresh()).toBe(false);
    });
  });

  describe('refresh', () => {
    it('should refresh token using refresh token', async () => {
      const auth = new OAuth2Auth('client-id', 'client-secret', 'refresh-token');
      
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
        },
      });

      await auth.refresh();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.timesheet.io/oauth2/token',
        expect.any(URLSearchParams),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      );
    });

    it('should throw error if no refresh token', async () => {
      const auth = new OAuth2Auth('test-access-token');
      await expect(auth.refresh()).rejects.toThrow('Cannot refresh without refresh token');
    });
  });

  describe('getAuthHeaders', () => {
    it('should return authorization headers', async () => {
      const auth = new OAuth2Auth('test-access-token');
      const headers = await auth.getAuthHeaders();
      
      expect(headers).toEqual({
        Authorization: 'Bearer test-access-token',
      });
    });

    it('should refresh token if needed before returning headers', async () => {
      const auth = new OAuth2Auth('client-id', 'client-secret', 'refresh-token');
      
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: 'new-access-token',
        },
      });

      const headers = await auth.getAuthHeaders();
      
      expect(mockedAxios.post).toHaveBeenCalled();
      expect(headers).toEqual({
        Authorization: 'Bearer new-access-token',
      });
    });
  });

  describe('static methods', () => {
    describe('fromAuthorizationCode', () => {
      it('should exchange authorization code for tokens', async () => {
        mockedAxios.post.mockResolvedValueOnce({
          data: {
            access_token: 'access-token',
            refresh_token: 'refresh-token',
          },
        });

        const auth = await OAuth2Auth.fromAuthorizationCode(
          'client-id',
          'client-secret',
          'auth-code',
          'http://localhost:3000/callback'
        );

        expect(auth).toBeInstanceOf(OAuth2Auth);
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'https://api.timesheet.io/oauth2/token',
          expect.any(URLSearchParams),
          expect.any(Object)
        );
      });
    });

    describe('buildAuthorizationUrl', () => {
      it('should build authorization URL', () => {
        const url = OAuth2Auth.buildAuthorizationUrl(
          'client-id',
          'http://localhost:3000/callback'
        );

        expect(url).toContain('https://api.timesheet.io/oauth2/auth');
        expect(url).toContain('client_id=client-id');
        expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback');
        expect(url).toContain('response_type=code');
      });

      it('should include state parameter if provided', () => {
        const url = OAuth2Auth.buildAuthorizationUrl(
          'client-id',
          'http://localhost:3000/callback',
          'random-state'
        );

        expect(url).toContain('state=random-state');
      });
    });
  });
});