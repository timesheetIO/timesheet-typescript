import { createHash } from 'crypto';
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generatePkceCodePair,
  isValidCodeVerifier,
} from '../../../auth/pkce';

describe('PKCE Utilities', () => {
  describe('generateCodeVerifier', () => {
    test('should generate verifier with default length of 64', () => {
      const verifier = generateCodeVerifier();
      expect(verifier.length).toBe(64);
    });

    test('should generate verifier with custom length', () => {
      const verifier = generateCodeVerifier(43);
      expect(verifier.length).toBe(43);

      const verifier128 = generateCodeVerifier(128);
      expect(verifier128.length).toBe(128);
    });

    test('should throw error for length below 43', () => {
      expect(() => generateCodeVerifier(42)).toThrow(
        'Code verifier length must be between 43 and 128 characters',
      );
    });

    test('should throw error for length above 128', () => {
      expect(() => generateCodeVerifier(129)).toThrow(
        'Code verifier length must be between 43 and 128 characters',
      );
    });

    test('should generate unique verifiers', () => {
      const verifier1 = generateCodeVerifier();
      const verifier2 = generateCodeVerifier();
      expect(verifier1).not.toBe(verifier2);
    });

    test('should only contain valid unreserved characters', () => {
      const verifier = generateCodeVerifier();
      // RFC 7636: unreserved characters are A-Z, a-z, 0-9, -, ., _, ~
      const validPattern = /^[A-Za-z0-9\-._~]+$/;
      expect(validPattern.test(verifier)).toBe(true);
    });
  });

  describe('generateCodeChallenge', () => {
    test('should generate S256 challenge correctly', () => {
      // Test with known value
      const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
      const challenge = generateCodeChallenge(verifier, 'S256');

      // Manually compute expected challenge
      const hash = createHash('sha256').update(verifier, 'ascii').digest();
      const expected = hash
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      expect(challenge).toBe(expected);
    });

    test('should use S256 by default', () => {
      const verifier = 'test_verifier_with_enough_characters_for_valid_length';
      const challenge1 = generateCodeChallenge(verifier);
      const challenge2 = generateCodeChallenge(verifier, 'S256');
      expect(challenge1).toBe(challenge2);
    });

    test('should return verifier as challenge for plain method', () => {
      const verifier = 'test_verifier_with_enough_characters_for_valid_length';
      const challenge = generateCodeChallenge(verifier, 'plain');
      expect(challenge).toBe(verifier);
    });

    test('should generate base64url encoded challenge (no padding)', () => {
      const verifier = generateCodeVerifier();
      const challenge = generateCodeChallenge(verifier, 'S256');

      // Should not contain padding or invalid base64url chars
      expect(challenge).not.toContain('=');
      expect(challenge).not.toContain('+');
      expect(challenge).not.toContain('/');
    });

    test('should generate consistent challenges for same verifier', () => {
      const verifier = generateCodeVerifier();
      const challenge1 = generateCodeChallenge(verifier, 'S256');
      const challenge2 = generateCodeChallenge(verifier, 'S256');
      expect(challenge1).toBe(challenge2);
    });
  });

  describe('generatePkceCodePair', () => {
    test('should generate complete PKCE pair with S256', () => {
      const pair = generatePkceCodePair('S256');

      expect(pair.codeVerifier).toBeDefined();
      expect(pair.codeChallenge).toBeDefined();
      expect(pair.codeChallengeMethod).toBe('S256');
      expect(pair.codeVerifier.length).toBe(64);
    });

    test('should use S256 by default', () => {
      const pair = generatePkceCodePair();
      expect(pair.codeChallengeMethod).toBe('S256');
    });

    test('should generate valid verifier-challenge relationship', () => {
      const pair = generatePkceCodePair('S256');

      // Verify the challenge matches the verifier
      const expectedChallenge = generateCodeChallenge(pair.codeVerifier, 'S256');
      expect(pair.codeChallenge).toBe(expectedChallenge);
    });

    test('should allow custom verifier length', () => {
      const pair = generatePkceCodePair('S256', 100);
      expect(pair.codeVerifier.length).toBe(100);
    });

    test('should generate plain method pair when requested', () => {
      const pair = generatePkceCodePair('plain');

      expect(pair.codeChallengeMethod).toBe('plain');
      expect(pair.codeChallenge).toBe(pair.codeVerifier);
    });
  });

  describe('isValidCodeVerifier', () => {
    test('should return true for valid verifier', () => {
      const verifier = generateCodeVerifier();
      expect(isValidCodeVerifier(verifier)).toBe(true);
    });

    test('should return false for verifier shorter than 43 chars', () => {
      const shortVerifier = 'a'.repeat(42);
      expect(isValidCodeVerifier(shortVerifier)).toBe(false);
    });

    test('should return false for verifier longer than 128 chars', () => {
      const longVerifier = 'a'.repeat(129);
      expect(isValidCodeVerifier(longVerifier)).toBe(false);
    });

    test('should return true for verifier at minimum length (43)', () => {
      const verifier = 'a'.repeat(43);
      expect(isValidCodeVerifier(verifier)).toBe(true);
    });

    test('should return true for verifier at maximum length (128)', () => {
      const verifier = 'a'.repeat(128);
      expect(isValidCodeVerifier(verifier)).toBe(true);
    });

    test('should return false for invalid characters', () => {
      const invalidVerifiers = [
        'a'.repeat(42) + '!', // 43 chars but contains !
        'a'.repeat(42) + '@',
        'a'.repeat(42) + '#',
        'a'.repeat(42) + ' ',
        'a'.repeat(42) + '+',
        'a'.repeat(42) + '=',
      ];

      invalidVerifiers.forEach((verifier) => {
        expect(isValidCodeVerifier(verifier)).toBe(false);
      });
    });

    test('should allow all valid unreserved characters', () => {
      // All valid characters: A-Z, a-z, 0-9, -, ., _, ~
      const validVerifier = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrs';
      expect(isValidCodeVerifier(validVerifier)).toBe(true);

      const validWithSpecial = 'abcdefghijklmnopqrstuvwxyz0123456789-._~abc';
      expect(isValidCodeVerifier(validWithSpecial)).toBe(true);
    });
  });
});
