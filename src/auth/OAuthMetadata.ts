/**
 * OAuth 2.1 Discovery Metadata Types
 *
 * These interfaces define the metadata structures returned by OAuth 2.1
 * well-known endpoints as specified in RFC 8414 and related specifications.
 */

/**
 * Authorization Server Metadata (RFC 8414)
 * Retrieved from /.well-known/oauth-authorization-server
 */
export interface AuthorizationServerMetadata {
  /** The authorization server's issuer identifier (URL) */
  issuer: string;

  /** URL of the authorization endpoint */
  authorization_endpoint: string;

  /** URL of the token endpoint */
  token_endpoint: string;

  /** URL of the dynamic client registration endpoint */
  registration_endpoint?: string;

  /** List of supported OAuth 2.0 scope values */
  scopes_supported?: string[];

  /** List of supported response_type values */
  response_types_supported: string[];

  /** List of supported grant types */
  grant_types_supported?: string[];

  /** List of client authentication methods supported by the token endpoint */
  token_endpoint_auth_methods_supported?: string[];

  /** List of PKCE code challenge methods supported */
  code_challenge_methods_supported?: string[];

  /** URL of the token revocation endpoint */
  revocation_endpoint?: string;

  /** List of client authentication methods for revocation endpoint */
  revocation_endpoint_auth_methods_supported?: string[];

  /** URL of the token introspection endpoint */
  introspection_endpoint?: string;

  /** List of client authentication methods for introspection endpoint */
  introspection_endpoint_auth_methods_supported?: string[];

  /** URL to human-readable documentation */
  service_documentation?: string;
}

/**
 * Protected Resource Metadata (RFC 9728)
 * Retrieved from /.well-known/oauth-protected-resource
 */
export interface ProtectedResourceMetadata {
  /** The protected resource's identifier (URL) */
  resource: string;

  /** List of authorization servers that can authorize access */
  authorization_servers: string[];

  /** List of supported OAuth 2.0 scope values */
  scopes_supported?: string[];

  /** List of supported bearer token delivery methods */
  bearer_methods_supported?: string[];

  /** URL to resource documentation */
  resource_documentation?: string;

  /** List of signing algorithms supported for resource tokens */
  resource_signing_alg_values_supported?: string[];
}

/**
 * OpenID Connect Discovery Configuration
 * Retrieved from /.well-known/openid-configuration
 */
export interface OpenIdConfiguration {
  /** The OpenID Provider's issuer identifier (URL) */
  issuer: string;

  /** URL of the authorization endpoint */
  authorization_endpoint: string;

  /** URL of the token endpoint */
  token_endpoint: string;

  /** URL of the UserInfo endpoint */
  userinfo_endpoint?: string;

  /** URL of the JSON Web Key Set document */
  jwks_uri: string;

  /** URL of the dynamic client registration endpoint */
  registration_endpoint?: string;

  /** List of supported OAuth 2.0 scope values */
  scopes_supported?: string[];

  /** List of supported response_type values */
  response_types_supported: string[];

  /** List of supported response_mode values */
  response_modes_supported?: string[];

  /** List of supported grant types */
  grant_types_supported?: string[];

  /** List of client authentication methods supported by the token endpoint */
  token_endpoint_auth_methods_supported?: string[];

  /** List of JWS signing algorithms for token endpoint auth */
  token_endpoint_auth_signing_alg_values_supported?: string[];

  /** URL to human-readable documentation */
  service_documentation?: string;

  /** List of supported UI locales */
  ui_locales_supported?: string[];

  /** URL to the OpenID Provider's privacy policy */
  op_policy_uri?: string;

  /** URL to the OpenID Provider's terms of service */
  op_tos_uri?: string;

  /** URL of the token revocation endpoint */
  revocation_endpoint?: string;

  /** URL of the token introspection endpoint */
  introspection_endpoint?: string;

  /** List of PKCE code challenge methods supported */
  code_challenge_methods_supported?: string[];
}

/**
 * Combined discovery result containing all available metadata
 */
export interface OAuthDiscoveryResult {
  /** The base issuer URL */
  issuer: string;

  /** Authorization Server Metadata (primary for OAuth 2.1) */
  authorizationServer: AuthorizationServerMetadata;

  /** Protected Resource Metadata (optional) */
  protectedResource?: ProtectedResourceMetadata;

  /** OpenID Connect Configuration (optional) */
  openIdConfiguration?: OpenIdConfiguration;

  /** Timestamp when the metadata was fetched */
  fetchedAt: Date;
}
