import axios from 'axios';
import type {
  AuthorizationServerMetadata,
  OpenIdConfiguration,
  ProtectedResourceMetadata,
  OAuthDiscoveryResult,
} from './OAuthMetadata';

/**
 * Options for OAuth discovery
 */
export interface OAuthDiscoveryOptions {
  /** Cache TTL in milliseconds (default: 1 hour) */
  cacheTtl?: number;

  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number;

  /** Whether to also fetch OpenID configuration (default: false) */
  fetchOpenIdConfig?: boolean;

  /** Whether to also fetch protected resource metadata (default: false) */
  fetchProtectedResource?: boolean;
}

/**
 * Cached metadata entry
 */
interface CacheEntry {
  result: OAuthDiscoveryResult;
  expiresAt: Date;
}

/**
 * OAuth 2.1 Discovery Service
 *
 * Implements RFC 8414 (OAuth 2.0 Authorization Server Metadata) for automatic
 * discovery of OAuth endpoints from well-known URLs.
 *
 * Supports:
 * - /.well-known/oauth-authorization-server (RFC 8414)
 * - /.well-known/oauth-protected-resource (RFC 9728)
 * - /.well-known/openid-configuration (OpenID Connect Discovery)
 *
 * @example
 * ```typescript
 * // Discover OAuth endpoints from issuer URL
 * const discovery = new OAuthDiscovery();
 * const metadata = await discovery.discover('https://api.timesheet.io');
 *
 * console.log(metadata.authorizationServer.authorization_endpoint);
 * console.log(metadata.authorizationServer.token_endpoint);
 * ```
 */
export class OAuthDiscovery {
  private static readonly DEFAULT_CACHE_TTL = 60 * 60 * 1000; // 1 hour
  private static readonly DEFAULT_TIMEOUT = 10000; // 10 seconds

  private readonly cache: Map<string, CacheEntry> = new Map();
  private readonly options: Required<OAuthDiscoveryOptions>;

  constructor(options: OAuthDiscoveryOptions = {}) {
    this.options = {
      cacheTtl: options.cacheTtl ?? OAuthDiscovery.DEFAULT_CACHE_TTL,
      timeout: options.timeout ?? OAuthDiscovery.DEFAULT_TIMEOUT,
      fetchOpenIdConfig: options.fetchOpenIdConfig ?? false,
      fetchProtectedResource: options.fetchProtectedResource ?? false,
    };
  }

  /**
   * Discover OAuth metadata from an issuer URL.
   *
   * @param issuerUrl The OAuth authorization server issuer URL
   * @returns Discovery result containing all fetched metadata
   * @throws Error if discovery fails
   *
   * @example
   * ```typescript
   * const discovery = new OAuthDiscovery();
   * const result = await discovery.discover('https://api.timesheet.io');
   *
   * // Use discovered endpoints
   * const authUrl = result.authorizationServer.authorization_endpoint;
   * const tokenUrl = result.authorizationServer.token_endpoint;
   * ```
   */
  async discover(issuerUrl: string): Promise<OAuthDiscoveryResult> {
    const normalizedUrl = this.normalizeIssuerUrl(issuerUrl);

    // Check cache first
    const cached = this.getCached(normalizedUrl);
    if (cached) {
      return cached;
    }

    // Fetch authorization server metadata (required)
    const authServerMetadata = await this.fetchAuthorizationServerMetadata(normalizedUrl);

    const result: OAuthDiscoveryResult = {
      issuer: authServerMetadata.issuer,
      authorizationServer: authServerMetadata,
      fetchedAt: new Date(),
    };

    // Optionally fetch OpenID configuration
    if (this.options.fetchOpenIdConfig) {
      try {
        result.openIdConfiguration = await this.fetchOpenIdConfiguration(normalizedUrl);
      } catch {
        // OpenID configuration is optional, continue without it
      }
    }

    // Optionally fetch protected resource metadata
    if (this.options.fetchProtectedResource) {
      try {
        result.protectedResource = await this.fetchProtectedResourceMetadata(normalizedUrl);
      } catch {
        // Protected resource metadata is optional, continue without it
      }
    }

    // Cache the result
    this.setCache(normalizedUrl, result);

    return result;
  }

  /**
   * Fetch Authorization Server Metadata (RFC 8414)
   *
   * @param issuerUrl The OAuth authorization server issuer URL
   * @returns Authorization server metadata
   */
  async fetchAuthorizationServerMetadata(issuerUrl: string): Promise<AuthorizationServerMetadata> {
    const url = `${this.normalizeIssuerUrl(issuerUrl)}/.well-known/oauth-authorization-server`;

    try {
      const response = await axios.get<AuthorizationServerMetadata>(url, {
        timeout: this.options.timeout,
        headers: {
          Accept: 'application/json',
        },
      });

      this.validateAuthorizationServerMetadata(response.data);
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch authorization server metadata from ${url}: ${message}`);
    }
  }

  /**
   * Fetch OpenID Connect Discovery Configuration
   *
   * @param issuerUrl The OpenID Provider issuer URL
   * @returns OpenID Connect configuration
   */
  async fetchOpenIdConfiguration(issuerUrl: string): Promise<OpenIdConfiguration> {
    const url = `${this.normalizeIssuerUrl(issuerUrl)}/.well-known/openid-configuration`;

    try {
      const response = await axios.get<OpenIdConfiguration>(url, {
        timeout: this.options.timeout,
        headers: {
          Accept: 'application/json',
        },
      });

      this.validateOpenIdConfiguration(response.data);
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch OpenID configuration from ${url}: ${message}`);
    }
  }

  /**
   * Fetch Protected Resource Metadata (RFC 9728)
   *
   * @param resourceUrl The protected resource URL
   * @returns Protected resource metadata
   */
  async fetchProtectedResourceMetadata(resourceUrl: string): Promise<ProtectedResourceMetadata> {
    const url = `${this.normalizeIssuerUrl(resourceUrl)}/.well-known/oauth-protected-resource`;

    try {
      const response = await axios.get<ProtectedResourceMetadata>(url, {
        timeout: this.options.timeout,
        headers: {
          Accept: 'application/json',
        },
      });

      this.validateProtectedResourceMetadata(response.data);
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch protected resource metadata from ${url}: ${message}`);
    }
  }

  /**
   * Clear the metadata cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear a specific issuer from the cache
   */
  clearCacheForIssuer(issuerUrl: string): void {
    this.cache.delete(this.normalizeIssuerUrl(issuerUrl));
  }

  /**
   * Check if a specific issuer's metadata is cached
   */
  isCached(issuerUrl: string): boolean {
    const cached = this.getCached(this.normalizeIssuerUrl(issuerUrl));
    return cached !== null;
  }

  private normalizeIssuerUrl(url: string): string {
    // Remove trailing slash
    return url.replace(/\/+$/, '');
  }

  private getCached(issuerUrl: string): OAuthDiscoveryResult | null {
    const entry = this.cache.get(issuerUrl);
    if (!entry) {
      return null;
    }

    if (new Date() >= entry.expiresAt) {
      this.cache.delete(issuerUrl);
      return null;
    }

    return entry.result;
  }

  private setCache(issuerUrl: string, result: OAuthDiscoveryResult): void {
    const expiresAt = new Date(Date.now() + this.options.cacheTtl);
    this.cache.set(issuerUrl, { result, expiresAt });
  }

  private validateAuthorizationServerMetadata(metadata: AuthorizationServerMetadata): void {
    if (!metadata.issuer) {
      throw new Error('Authorization server metadata missing required field: issuer');
    }
    if (!metadata.authorization_endpoint) {
      throw new Error(
        'Authorization server metadata missing required field: authorization_endpoint',
      );
    }
    if (!metadata.token_endpoint) {
      throw new Error('Authorization server metadata missing required field: token_endpoint');
    }
    if (!metadata.response_types_supported || metadata.response_types_supported.length === 0) {
      throw new Error(
        'Authorization server metadata missing required field: response_types_supported',
      );
    }
  }

  private validateOpenIdConfiguration(config: OpenIdConfiguration): void {
    if (!config.issuer) {
      throw new Error('OpenID configuration missing required field: issuer');
    }
    if (!config.authorization_endpoint) {
      throw new Error('OpenID configuration missing required field: authorization_endpoint');
    }
    if (!config.token_endpoint) {
      throw new Error('OpenID configuration missing required field: token_endpoint');
    }
    if (!config.jwks_uri) {
      throw new Error('OpenID configuration missing required field: jwks_uri');
    }
  }

  private validateProtectedResourceMetadata(metadata: ProtectedResourceMetadata): void {
    if (!metadata.resource) {
      throw new Error('Protected resource metadata missing required field: resource');
    }
    if (!metadata.authorization_servers || metadata.authorization_servers.length === 0) {
      throw new Error('Protected resource metadata missing required field: authorization_servers');
    }
  }
}

/**
 * Singleton instance for convenience
 */
let defaultDiscovery: OAuthDiscovery | null = null;

/**
 * Get the default OAuthDiscovery instance
 */
export function getDefaultDiscovery(): OAuthDiscovery {
  if (!defaultDiscovery) {
    defaultDiscovery = new OAuthDiscovery();
  }
  return defaultDiscovery;
}

/**
 * Convenience function to discover OAuth metadata
 *
 * @param issuerUrl The OAuth authorization server issuer URL
 * @param options Discovery options
 * @returns Discovery result
 *
 * @example
 * ```typescript
 * import { discoverOAuth } from '@timesheet/sdk';
 *
 * const metadata = await discoverOAuth('https://api.timesheet.io');
 * console.log(metadata.authorizationServer.token_endpoint);
 * ```
 */
export async function discoverOAuth(
  issuerUrl: string,
  options?: OAuthDiscoveryOptions,
): Promise<OAuthDiscoveryResult> {
  const discovery = options ? new OAuthDiscovery(options) : getDefaultDiscovery();
  return discovery.discover(issuerUrl);
}
