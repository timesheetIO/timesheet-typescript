import { randomBytes, createHash } from 'crypto';

/**
 * PKCE (Proof Key for Code Exchange) utilities for OAuth 2.1.
 *
 * Implements RFC 7636 with S256 challenge method as required by OAuth 2.1.
 */

/**
 * Supported PKCE code challenge methods.
 * OAuth 2.1 requires S256 - plain is only for legacy compatibility.
 */
export type CodeChallengeMethod = 'S256' | 'plain';

/**
 * PKCE code pair containing verifier and challenge.
 */
export interface PkceCodePair {
  /** The code verifier - a cryptographically random string (43-128 chars) */
  codeVerifier: string;
  /** The code challenge - derived from the verifier using the challenge method */
  codeChallenge: string;
  /** The challenge method used (S256 or plain) */
  codeChallengeMethod: CodeChallengeMethod;
}

/**
 * Generates a cryptographically random code verifier.
 *
 * The verifier is a high-entropy random string between 43-128 characters
 * using unreserved URI characters (A-Z, a-z, 0-9, -, ., _, ~).
 *
 * @param length The length of the verifier (default: 64, min: 43, max: 128)
 * @returns A random code verifier string
 */
export function generateCodeVerifier(length: number = 64): string {
  if (length < 43 || length > 128) {
    throw new Error('Code verifier length must be between 43 and 128 characters');
  }

  // Generate random bytes and encode as base64url
  const buffer = randomBytes(Math.ceil((length * 3) / 4));
  return base64UrlEncode(buffer).slice(0, length);
}

/**
 * Generates a code challenge from a code verifier.
 *
 * For S256 (recommended by OAuth 2.1):
 *   code_challenge = BASE64URL(SHA256(code_verifier))
 *
 * For plain (legacy, not recommended):
 *   code_challenge = code_verifier
 *
 * @param codeVerifier The code verifier string
 * @param method The challenge method ('S256' or 'plain', default: 'S256')
 * @returns The code challenge string
 */
export function generateCodeChallenge(
  codeVerifier: string,
  method: CodeChallengeMethod = 'S256',
): string {
  if (method === 'plain') {
    return codeVerifier;
  }

  // S256: BASE64URL(SHA256(ASCII(code_verifier)))
  const hash = createHash('sha256').update(codeVerifier, 'ascii').digest();
  return base64UrlEncode(hash);
}

/**
 * Generates a complete PKCE code pair (verifier and challenge).
 *
 * This is the recommended way to generate PKCE parameters for OAuth 2.1.
 *
 * @param method The challenge method ('S256' or 'plain', default: 'S256')
 * @param verifierLength The length of the verifier (default: 64)
 * @returns A complete PKCE code pair
 *
 * @example
 * ```typescript
 * const pkce = generatePkceCodePair();
 *
 * // Use codeChallenge in authorization request
 * const authUrl = OAuth21Auth.buildAuthorizationUrl({
 *   clientId: 'your-client-id',
 *   redirectUri: 'https://your-app.com/callback',
 *   codeChallenge: pkce.codeChallenge,
 *   codeChallengeMethod: pkce.codeChallengeMethod,
 * });
 *
 * // Later, use codeVerifier in token exchange
 * const auth = await OAuth21Auth.fromAuthorizationCode({
 *   clientId: 'your-client-id',
 *   authorizationCode: code,
 *   redirectUri: 'https://your-app.com/callback',
 *   codeVerifier: pkce.codeVerifier,
 * });
 * ```
 */
export function generatePkceCodePair(
  method: CodeChallengeMethod = 'S256',
  verifierLength: number = 64,
): PkceCodePair {
  const codeVerifier = generateCodeVerifier(verifierLength);
  const codeChallenge = generateCodeChallenge(codeVerifier, method);

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: method,
  };
}

/**
 * Validates a code verifier format.
 *
 * @param codeVerifier The code verifier to validate
 * @returns True if valid, false otherwise
 */
export function isValidCodeVerifier(codeVerifier: string): boolean {
  if (codeVerifier.length < 43 || codeVerifier.length > 128) {
    return false;
  }

  // Must only contain unreserved characters: A-Z, a-z, 0-9, -, ., _, ~
  const validChars = /^[A-Za-z0-9\-._~]+$/;
  return validChars.test(codeVerifier);
}

/**
 * Base64URL encodes a buffer (RFC 4648 Section 5).
 *
 * @param buffer The buffer to encode
 * @returns Base64URL encoded string (no padding)
 */
function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
