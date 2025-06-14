import { TimesheetClient } from '../../index';

describe('TimesheetClient - Simple Tests', () => {
  it('should create client with API key', () => {
    const client = new TimesheetClient({
      apiKey: 'ts_test.validapikey123456',
    });

    expect(client).toBeDefined();
    expect(client.tasks).toBeDefined();
    expect(client.projects).toBeDefined();
    expect(client.teams).toBeDefined();
    expect(client.organizations).toBeDefined();
  });

  it('should create client with OAuth2 token', () => {
    const client = new TimesheetClient({
      oauth2Token: 'test-access-token',
    });

    expect(client).toBeDefined();
    expect(client.tasks).toBeDefined();
  });

  it('should create client with custom base URL', () => {
    const client = new TimesheetClient({
      apiKey: 'test-api-key',
      baseUrl: 'https://custom.api.com',
    });

    expect(client).toBeDefined();
  });

  it('should have all resource endpoints', () => {
    const client = new TimesheetClient({
      apiKey: 'ts_test.validapikey123456',
    });

    // Check all resources exist
    expect(client.tasks).toBeDefined();
    expect(client.projects).toBeDefined();
    expect(client.tags).toBeDefined();
    expect(client.teams).toBeDefined();
    expect(client.organizations).toBeDefined();
    expect(client.timer).toBeDefined();
    expect(client.rates).toBeDefined();
    expect(client.expenses).toBeDefined();
    expect(client.notes).toBeDefined();
    expect(client.pauses).toBeDefined();
    expect(client.documents).toBeDefined();
    expect(client.webhooks).toBeDefined();
    expect(client.automations).toBeDefined();
    expect(client.profile).toBeDefined();
    expect(client.settings).toBeDefined();
    expect(client.todos).toBeDefined();
  });
});