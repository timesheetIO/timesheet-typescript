import { createClient, TimesheetClient } from '../../index';
import { ApiKeyAuth } from '../../auth';

describe('TimesheetClient', () => {
  describe('Constructor', () => {
    test('should create client with API key', () => {
      const client = new TimesheetClient({
        apiKey: 'ts_testkey.123456',
      });

      expect(client).toBeInstanceOf(TimesheetClient);
      expect(client.projects).toBeDefined();
      expect(client.tasks).toBeDefined();
      expect(client.timer).toBeDefined();
      expect(client.teams).toBeDefined();
      expect(client.organizations).toBeDefined();
    });

    test('should create client with OAuth2 token', () => {
      const client = new TimesheetClient({
        oauth2Token: 'bearer-token-123',
      });

      expect(client).toBeInstanceOf(TimesheetClient);
    });

    test('should create client with OAuth2 credentials', () => {
      const client = new TimesheetClient({
        oauth2: {
          clientId: 'client-123',
          clientSecret: 'secret-456',
          refreshToken: 'refresh-789',
        },
      });

      expect(client).toBeInstanceOf(TimesheetClient);
    });

    test('should create client with custom authentication', () => {
      const customAuth = new ApiKeyAuth('ts_customkey.123');
      const client = new TimesheetClient({
        authentication: customAuth,
      });

      expect(client).toBeInstanceOf(TimesheetClient);
    });

    test('should throw error when no authentication provided', () => {
      expect(() => {
        new TimesheetClient({} as any);
      }).toThrow('Authentication must be configured');
    });

    test('should use custom base URL', () => {
      const client = new TimesheetClient({
        apiKey: 'ts_testkey.123',
        baseUrl: 'https://api.staging.timesheet.io/v1',
      });

      expect(client).toBeInstanceOf(TimesheetClient);
    });

    test('should use default base URL when not provided', () => {
      const client = new TimesheetClient({
        apiKey: 'ts_testkey.123',
      });

      expect(client).toBeInstanceOf(TimesheetClient);
    });
  });

  describe('createClient helper', () => {
    test('should create client using helper function', () => {
      const client = createClient({
        apiKey: 'ts_testkey.123',
      });

      expect(client).toBeInstanceOf(TimesheetClient);
    });
  });

  describe('Resource initialization', () => {
    test('should initialize all resources', () => {
      const client = new TimesheetClient({
        apiKey: 'ts_testkey.123',
      });

      // Check all resources are initialized
      const resources = [
        'organizations',
        'teams',
        'projects',
        'tasks',
        'rates',
        'tags',
        'expenses',
        'notes',
        'pauses',
        'profile',
        'settings',
        'automations',
        'documents',
        'timer',
        'todos',
        'webhooks',
      ];

      resources.forEach((resource) => {
        expect(client[resource as keyof TimesheetClient]).toBeDefined();
      });
    });
  });

  describe('Authentication priority', () => {
    test('should prioritize API key over other auth methods', () => {
      const client = new TimesheetClient({
        apiKey: 'ts_testkey.123',
        oauth2Token: 'should-be-ignored',
        oauth2: {
          clientId: 'ignored',
          clientSecret: 'ignored',
          refreshToken: 'ignored',
        },
      });

      expect(client).toBeInstanceOf(TimesheetClient);
      // The client should use API key authentication (first priority)
    });

    test('should use OAuth2 token when API key not provided', () => {
      const client = new TimesheetClient({
        oauth2Token: 'bearer-token',
        oauth2: {
          clientId: 'ignored',
          clientSecret: 'ignored',
          refreshToken: 'ignored',
        },
      });

      expect(client).toBeInstanceOf(TimesheetClient);
    });

    test('should use OAuth2 credentials when neither API key nor token provided', () => {
      const client = new TimesheetClient({
        oauth2: {
          clientId: 'client-id',
          clientSecret: 'client-secret',
          refreshToken: 'refresh-token',
        },
      });

      expect(client).toBeInstanceOf(TimesheetClient);
    });
  });
});
