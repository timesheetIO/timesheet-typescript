import { createTestClient, skipIfNoApiKey, testConfig, testData } from '../setup';
import { TimesheetClient } from '../../index';

describe('Rates Resource Integration Tests', () => {
  let client: TimesheetClient;
  let createdRateId: string | undefined;

  beforeAll(() => {
    if (skipIfNoApiKey()) return;
    client = createTestClient();
  });

  afterAll(async () => {
    // Clean up created rate
    if (createdRateId) {
      try {
        await client.rates.delete(createdRateId);
      } catch (error) {
        console.error('Failed to clean up rate:', error);
      }
    }
  });

  describe('Rates CRUD Operations', () => {
    test('should create a new rate', async () => {
      const rateData = {
        title: testData.generateRateTitle(),
        factor: 1.5,
        extra: 10,
        enabled: true,
        teamId: testConfig.teamId,
      };

      const rate = await client.rates.create(rateData);

      expect(rate).toBeDefined();
      expect(rate.id).toBeDefined();
      expect(rate.title).toBe(rateData.title);
      expect(rate.factor).toBe(rateData.factor);
      expect(rate.extra).toBe(rateData.extra);
      expect(rate.enabled).toBe(true);

      createdRateId = rate.id;
    });

    test('should list rates', async () => {
      const response = await client.rates.list({
        count: 0,
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
        const rate = response.items[0];
        expect(rate?.id).toBeDefined();
        expect(rate?.title).toBeDefined();
        expect(typeof rate?.factor).toBe('number');
      }
    });

    test('should get a specific rate', async () => {
      if (!createdRateId) {
        console.warn('Skipping get rate test - no rate created');
        return;
      }

      const rate = await client.rates.get(createdRateId);

      expect(rate).toBeDefined();
      expect(rate.id).toBe(createdRateId);
      expect(rate.title).toBeDefined();
      expect(typeof rate.factor).toBe('number');
      expect(typeof rate.extra).toBe('number');
    });

    test('should update a rate', async () => {
      if (!createdRateId) {
        console.warn('Skipping update rate test - no rate created');
        return;
      }

      const updateData = {
        title: 'Updated Rate',
        factor: 2.0,
        extra: 15,
        enabled: false,
      };

      const updatedRate = await client.rates.update(createdRateId, updateData);

      expect(updatedRate).toBeDefined();
      expect(updatedRate.id).toBe(createdRateId);
      expect(updatedRate.title).toBe(updateData.title);
      expect(updatedRate.factor).toBe(updateData.factor);
      expect(updatedRate.extra).toBe(updateData.extra);
      expect(updatedRate.enabled).toBe(false);
    });

    test('should search rates', async () => {
      const searchParams = {
        search: 'test',
        count: 0,
        limit: 20,
        page: 1,
        teamId: testConfig.teamId,
      };

      const response = await client.rates.search(searchParams);

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
    });
  });

  describe('Rate Status Operations', () => {
    test('should archive and unarchive a rate', async () => {
      if (!createdRateId) {
        console.warn('Skipping archive/unarchive test - no rate created');
        return;
      }

      // Archive rate
      const archivedRate = await client.rates.update(createdRateId, { archived: true });
      expect(archivedRate).toBeDefined();
      expect(archivedRate.id).toBe(createdRateId);
      expect(archivedRate.archived).toBe(true);

      // Unarchive rate
      const unarchivedRate = await client.rates.update(createdRateId, { archived: false });
      expect(unarchivedRate).toBeDefined();
      expect(unarchivedRate.id).toBe(createdRateId);
      expect(unarchivedRate.archived).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle getting non-existent rate', async () => {
      await expect(client.rates.get('non-existent-rate-id')).rejects.toThrow();
    });

    test('should handle creating rate with invalid data', async () => {
      await expect(
        client.rates.create({
          title: '', // Empty title should fail validation
          factor: -1, // Negative factor should fail validation
        }),
      ).rejects.toThrow();
    });

    test('should handle updating non-existent rate', async () => {
      await expect(
        client.rates.update('non-existent-rate-id', {
          title: 'This should fail',
        }),
      ).rejects.toThrow();
    });
  });
});
