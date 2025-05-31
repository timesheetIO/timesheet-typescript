import { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { Authentication } from './Authentication';

/**
 * OAuth2 authentication implementation with automatic token refresh.
 * 
 * Supports both simple bearer token authentication and full OAuth2 flow with refresh tokens.
 */
export class OAuth2Auth implements Authentication {
  private static readonly TOKEN_ENDPOINT = 'https://api.timesheet.io/oauth2/token';
  
  private accessToken: string;
  private refreshToken?: string;
  private readonly clientId?: string;
  private readonly clientSecret?: string;
  private tokenExpiry?: Date;
  
  /**
   * Creates OAuth2 authentication with a simple bearer token.
   * 
   * @param accessToken The OAuth2 access token
   */
  constructor(accessToken: string);
  
  /**
   * Creates OAuth2 authentication with refresh capability.
   * 
   * @param clientId The OAuth2 client ID
   * @param clientSecret The OAuth2 client secret
   * @param refreshToken The OAuth2 refresh token
   */
  constructor(clientId: string, clientSecret: string, refreshToken: string);
  
  constructor(
    accessTokenOrClientId: string,
    clientSecret?: string,
    refreshToken?: string
  ) {
    if (clientSecret && refreshToken) {
      // OAuth2 with refresh
      this.clientId = accessTokenOrClientId;
      this.clientSecret = clientSecret;
      this.refreshToken = refreshToken;
      this.accessToken = ''; // Will be set by refresh()
      this.refresh().catch(err => {
        throw new Error(`Failed to get initial access token: ${err.message}`);
      });
    } else {
      // Simple bearer token
      this.accessToken = accessTokenOrClientId;
      this.parseTokenExpiry();
    }
  }
  
  applyAuth(config: AxiosRequestConfig): void {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers['Authorization'] = `Bearer ${this.accessToken}`;
  }
  
  needsRefresh(): boolean {
    if (!this.refreshToken || !this.tokenExpiry) {
      return false;
    }
    // Refresh if token expires in less than 5 minutes
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    return fiveMinutesFromNow >= this.tokenExpiry;
  }
  
  async refresh(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('Cannot refresh without refresh token');
    }
    
    try {
      const response = await axios.post(
        OAuth2Auth.TOKEN_ENDPOINT,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          client_id: this.clientId!,
          client_secret: this.clientSecret!,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      this.accessToken = response.data.access_token;
      
      if (response.data.refresh_token) {
        this.refreshToken = response.data.refresh_token;
      }
      
      this.parseTokenExpiry();
    } catch (error: any) {
      throw new Error(`Failed to refresh OAuth2 token: ${error.message}`);
    }
  }
  
  /**
   * Performs the OAuth2 authorization code flow.
   * 
   * @param clientId The OAuth2 client ID
   * @param clientSecret The OAuth2 client secret
   * @param authorizationCode The authorization code from the OAuth2 flow
   * @param redirectUri The redirect URI used in the authorization request
   * @returns A new OAuth2Auth instance with the obtained tokens
   */
  static async fromAuthorizationCode(
    clientId: string,
    clientSecret: string,
    authorizationCode: string,
    redirectUri: string
  ): Promise<OAuth2Auth> {
    try {
      const response = await axios.post(
        OAuth2Auth.TOKEN_ENDPOINT,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: authorizationCode,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;
      
      if (refreshToken) {
        return new OAuth2Auth(clientId, clientSecret, refreshToken);
      } else {
        return new OAuth2Auth(accessToken);
      }
    } catch (error: any) {
      throw new Error(`Failed to exchange authorization code: ${error.message}`);
    }
  }
  
  /**
   * Builds the OAuth2 authorization URL.
   * 
   * @param clientId The OAuth2 client ID
   * @param redirectUri The redirect URI for the OAuth2 flow
   * @param state Optional state parameter for CSRF protection
   * @returns The authorization URL
   */
  static buildAuthorizationUrl(
    clientId: string,
    redirectUri: string,
    state?: string
  ): string {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
    });
    
    if (state) {
      params.append('state', state);
    }
    
    return `https://api.timesheet.io/oauth2/auth?${params.toString()}`;
  }
  
  private parseTokenExpiry(): void {
    try {
      const decoded = jwt.decode(this.accessToken) as any;
      if (decoded && decoded.exp) {
        this.tokenExpiry = new Date(decoded.exp * 1000);
      }
    } catch {
      // If we can't parse the JWT, assume it expires in 1 hour
      this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    }
  }
} 