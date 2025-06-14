import { createTestClient, skipIfNoApiKey, testConfig, testData } from '../setup';
import { TimesheetClient } from '../../index';

describe('Webhooks Resource Integration Tests', () => {
  let client: TimesheetClient;
  let createdWebhookId: string | undefined;

  beforeAll(() => {
    if (skipIfNoApiKey()) return;
    client = createTestClient();
  });

  afterAll(async () => {
    // Clean up created webhook
    if (createdWebhookId) {
      try {
        await client.webhooks.delete(createdWebhookId);
      } catch (error) {
        console.error('Failed to clean up webhook:', error);
      }
    }
  });

  if (!testConfig.apiKey) {
    test('API key not configured - skipping integration tests', () => {
      console.log('ℹ️  To run integration tests, set TIMESHEET_API_KEY in your .env file');
      expect(true).toBe(true);
    });
    return;
  }

  describe('Webhooks CRUD Operations', () => {
    test('should create a new webhook', async () => {
      const webhookData = {
        target: testData.generateWebhookUrl(),
        event: 'task.created',
        enabled: true,
      };

      const webhook = await client.webhooks.create(webhookData);

      expect(webhook).toBeDefined();
      expect(webhook.id).toBeDefined();
      expect(webhook.target).toBe(webhookData.target);
      expect(webhook.event).toBe(webhookData.event);

      createdWebhookId = webhook.id;
    });

    test('should list webhooks', async () => {
      const response = await client.webhooks.list({
        limit: 10,
        page: 1,
        sort: 'created',
        order: 'desc',
      });

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
      expect(response.params.count).toBeGreaterThanOrEqual(0);
      expect(response.params.page).toBe(1);
      expect(response.params.limit).toBe(10);

      if (response.items.length > 0) {
        const webhook = response.items[0];
        expect(webhook?.id).toBeDefined();
        expect(webhook?.target).toBeDefined();
      }
    });

    test('should get a specific webhook', async () => {
      if (!createdWebhookId) {
        console.warn('Skipping get webhook test - no webhook created');
        return;
      }

      const webhook = await client.webhooks.get(createdWebhookId);

      expect(webhook).toBeDefined();
      expect(webhook.id).toBe(createdWebhookId);
      expect(webhook.target).toBeDefined();
      expect(webhook.event).toBeDefined();
    });

    test('should update a webhook', async () => {
      if (!createdWebhookId) {
        console.warn('Skipping update webhook test - no webhook created');
        return;
      }

      const updateData = {
        target: 'https://updated.example.com/webhook',
        event: 'task.deleted',
        enabled: false,
      };

      const updatedWebhook = await client.webhooks.update(createdWebhookId, updateData);

      expect(updatedWebhook).toBeDefined();
      expect(updatedWebhook.id).toBe(createdWebhookId);
      expect(updatedWebhook.target).toBe(updateData.target);
      expect(updatedWebhook.event).toBe(updateData.event);
    });

    test('should search webhooks', async () => {
      const searchParams = {
        search: 'example.com',
        limit: 20,
        page: 1,
        count: 0,
      };

      const response = await client.webhooks.search(searchParams);

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle getting non-existent webhook', async () => {
      await expect(client.webhooks.get('non-existent-webhook-id')).rejects.toThrow();
    });

    test('should handle creating webhook with invalid data', async () => {
      await expect(
        client.webhooks.create({
          target: 'invalid-url', // Invalid URL format
          event: '',
        }),
      ).rejects.toThrow();
    });

    test('should handle updating non-existent webhook', async () => {
      await expect(
        client.webhooks.update('non-existent-webhook-id', {
          target: 'https://example.com/webhook',
        }),
      ).rejects.toThrow();
    });
  });
});
