import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import type { Authentication } from './Authentication';
import {
  generatePkceCodePair,
  isValidCodeVerifier,
  type CodeChallengeMethod,
  type PkceCodePair,
} from './pkce';

/**
 * Options for building an OAuth 2.1 authorization URL.
 */
export interface AuthorizationUrlOptions {
  /** The OAuth2 client ID */
  clientId: string;
  /** The redirect URI for the OAuth2 flow */
  redirectUri: string;
  /** The PKCE code challenge (required for OAuth 2.1) */
  codeChallenge: string;
  /** The code challenge method (default: 'S256') */
  codeChallengeMethod?: CodeChallengeMethod;
  /** Optional state parameter for CSRF protection */
  state?: string;
  /** Optional scope parameter */
  scope?: string;
  /** Optional resource indicator (RFC 8707) */
  resource?: string;
}

/**
 * Options for exchanging an authorization code for tokens.
 */
export interface TokenExchangeOptions {
  /** The OAuth2 client ID */
  clientId: string;
  /** The OAuth2 client secret (optional for public clients with PKCE) */
  clientSecret?: string;
  /** The authorization code from the OAuth2 flow */
  authorizationCode: string;
  /** The redirect URI used in the authorization request */
  redirectUri: string;
  /** The PKCE code verifier (required for OAuth 2.1) */
  codeVerifier: string;
  /** Optional resource indicator (RFC 8707) */
  resource?: string;
}

/**
 * Options for creating OAuth21Auth with refresh capability.
 */
export interface OAuth21RefreshOptions {
  /** The OAuth2 client ID */
  clientId: string;
  /** The OAuth2 client secret (optional for public clients) */
  clientSecret?: string;
  /** The OAuth2 refresh token */
  refreshToken: string;
  /** Optional resource indicator (RFC 8707) */
  resource?: string;
}

/**
 * Token response from the OAuth 2.1 server.
 */
interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}

/**
 * OAuth 2.1 authentication implementation with PKCE support.
 *
 * OAuth 2.1 is the next evolution of OAuth 2.0, consolidating best practices:
 * - PKCE is REQUIRED for all clients (not just public clients)
 * - Implicit flow is removed
 * - Resource Owner Password Credentials grant is removed
 *
 * This implementation supports:
 * - Authorization code flow with PKCE (S256)
 * - Refresh token flow
 * - Automatic token refresh
 * - Resource indicators (RFC 8707)
 *
 * @example
 * ```typescript
 * // Step 1: Generate PKCE parameters
 * import { generatePkceCodePair } from '@timesheet/sdk';
 * const pkce = generatePkceCodePair();
 *
 * // Step 2: Build authorization URL and redirect user
 * const authUrl = OAuth21Auth.buildAuthorizationUrl({
 *   clientId: 'your-client-id',
 *   redirectUri: 'https://your-app.com/callback',
 *   codeChallenge: pkce.codeChallenge,
 *   codeChallengeMethod: pkce.codeChallengeMethod,
 *   state: 'random-state-for-csrf',
 * });
 *
 * // Step 3: After user authorizes, exchange code for tokens
 * const auth = await OAuth21Auth.fromAuthorizationCode({
 *   clientId: 'your-client-id',
 *   authorizationCode: codeFromCallback,
 *   redirectUri: 'https://your-app.com/callback',
 *   codeVerifier: pkce.codeVerifier,
 * });
 *
 * // Step 4: Use with TimesheetClient
 * const client = new TimesheetClient({ auth });
 * ```
 */
export class OAuth21Auth implements Authentication {
  private static readonly TOKEN_ENDPOINT = 'https://api.timesheet.io/oauth2/token';
  private static readonly AUTH_ENDPOINT = 'https://api.timesheet.io/oauth2/auth';

  private accessToken: string;
  private refreshToken?: string;
  private readonly clientId?: string;
  private readonly clientSecret?: string;
  private readonly resource?: string;
  private tokenExpiry?: Date;
  private refreshPromise?: Promise<void>;

  /**
   * Creates OAuth 2.1 authentication with a simple bearer token.
   * Use this when you already have an access token.
   *
   * @param accessToken The OAuth2 access token
   */
  constructor(accessToken: string);

  /**
   * Creates OAuth 2.1 authentication with refresh capability.
   *
   * @param options The refresh options including clientId, refreshToken, etc.
   */
  constructor(options: OAuth21RefreshOptions);

  constructor(accessTokenOrOptions: string | OAuth21RefreshOptions) {
    if (typeof accessTokenOrOptions === 'string') {
      // Simple bearer token
      this.accessToken = accessTokenOrOptions;
      this.parseTokenExpiry();
    } else {
      // OAuth 2.1 with refresh
      const options = accessTokenOrOptions;
      this.clientId = options.clientId;
      this.clientSecret = options.clientSecret;
      this.refreshToken = options.refreshToken;
      this.resource = options.resource;
      this.accessToken = ''; // Will be set by refresh()
    }
  }

  applyAuth(config: AxiosRequestConfig): void {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers['Authorization'] = `Bearer ${this.accessToken}`;
  }

  needsRefresh(): boolean {
    // If we have refresh capabilities but no access token, we need to refresh
    if (this.refreshToken && !this.accessToken) {
      return true;
    }

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

    // Prevent multiple concurrent refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = undefined;
    }
  }

  private async performRefresh(): Promise<void> {
    try {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken!,
        client_id: this.clientId!,
      });

      // Client secret is optional for public clients using PKCE
      if (this.clientSecret) {
        params.append('client_secret', this.clientSecret);
      }

      // Include resource indicator if specified
      if (this.resource) {
        params.append('resource', this.resource);
      }

      const response = await axios.post<TokenResponse>(OAuth21Auth.TOKEN_ENDPOINT, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this.accessToken = response.data.access_token;

      if (response.data.refresh_token) {
        this.refreshToken = response.data.refresh_token;
      }

      this.parseTokenExpiry();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to refresh OAuth 2.1 token: ${message}`);
    }
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    // Ensure we have a valid token before returning headers
    if (this.needsRefresh()) {
      await this.refresh();
    }

    return {
      Authorization: `Bearer ${this.accessToken}`,
    };
  }

  /**
   * Performs the OAuth 2.1 authorization code flow with PKCE.
   *
   * @param options The token exchange options
   * @returns A new OAuth21Auth instance with the obtained tokens
   * @throws Error if the code verifier is invalid or token exchange fails
   */
  static async fromAuthorizationCode(options: TokenExchangeOptions): Promise<OAuth21Auth> {
    const { clientId, clientSecret, authorizationCode, redirectUri, codeVerifier, resource } =
      options;

    // Validate code verifier
    if (!isValidCodeVerifier(codeVerifier)) {
      throw new Error(
        'Invalid code verifier: must be 43-128 characters using only A-Z, a-z, 0-9, -, ., _, ~',
      );
    }

    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier,
      });

      // Client secret is optional for public clients using PKCE
      if (clientSecret) {
        params.append('client_secret', clientSecret);
      }

      // Include resource indicator if specified
      if (resource) {
        params.append('resource', resource);
      }

      const response = await axios.post<TokenResponse>(OAuth21Auth.TOKEN_ENDPOINT, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;

      if (refreshToken) {
        return new OAuth21Auth({
          clientId,
          clientSecret,
          refreshToken,
          resource,
        });
      } else {
        return new OAuth21Auth(accessToken);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to exchange authorization code: ${message}`);
    }
  }

  /**
   * Builds the OAuth 2.1 authorization URL with PKCE.
   *
   * @param options The authorization URL options
   * @returns The authorization URL
   */
  static buildAuthorizationUrl(options: AuthorizationUrlOptions): string {
    const {
      clientId,
      redirectUri,
      codeChallenge,
      codeChallengeMethod = 'S256',
      state,
      scope,
      resource,
    } = options;

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
    });

    if (state) {
      params.append('state', state);
    }

    if (scope) {
      params.append('scope', scope);
    }

    if (resource) {
      params.append('resource', resource);
    }

    return `${OAuth21Auth.AUTH_ENDPOINT}?${params.toString()}`;
  }

  /**
   * Generates a complete PKCE code pair for use in OAuth 2.1 flow.
   *
   * This is a convenience method that wraps the generatePkceCodePair function.
   *
   * @param method The challenge method ('S256' or 'plain', default: 'S256')
   * @returns A PKCE code pair with verifier, challenge, and method
   *
   * @example
   * ```typescript
   * const pkce = OAuth21Auth.generatePkce();
   *
   * // Store verifier securely (e.g., in session)
   * sessionStorage.setItem('pkce_verifier', pkce.codeVerifier);
   *
   * // Use challenge in authorization URL
   * const authUrl = OAuth21Auth.buildAuthorizationUrl({
   *   clientId: 'your-client-id',
   *   redirectUri: 'https://your-app.com/callback',
   *   codeChallenge: pkce.codeChallenge,
   *   codeChallengeMethod: pkce.codeChallengeMethod,
   * });
   * ```
   */
  static generatePkce(method: CodeChallengeMethod = 'S256'): PkceCodePair {
    return generatePkceCodePair(method);
  }

  private parseTokenExpiry(): void {
    interface JWTPayload {
      exp?: number;
      iat?: number;
      sub?: string;
      [key: string]: unknown;
    }

    try {
      const decoded = jwt.decode(this.accessToken) as JWTPayload | null;
      if (decoded && decoded.exp) {
        this.tokenExpiry = new Date(decoded.exp * 1000);
      }
    } catch {
      // If we can't parse the JWT, assume it expires in 1 hour
      this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    }
  }
}
