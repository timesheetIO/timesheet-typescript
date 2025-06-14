import { createTestClient, skipIfNoApiKey, testConfig, testData } from '../setup';
import type { TimesheetClient } from '../../index';

describe('Tags Resource Integration Tests', () => {
  let client: TimesheetClient;
  let createdTagId: string | undefined;

  beforeAll(() => {
    if (skipIfNoApiKey()) return;
    client = createTestClient();
  });

  afterAll(async () => {
    // Clean up created tag
    if (createdTagId) {
      try {
        await client.tags.delete(createdTagId);
      } catch (error) {
        console.error('Failed to clean up tag:', error);
      }
    }
  });

  describe('Tags CRUD Operations', () => {
    test('should create a new tag', async () => {
      const tagData = {
        name: testData.generateTagName(),
        color: 16737131, // Integer representation of color
        teamId: testConfig.teamId,
      };

      const tag = await client.tags.create(tagData);

      expect(tag).toBeDefined();
      expect(tag.id).toBeDefined();
      expect(tag.name).toBe(tagData.name);
      expect(tag.color).toBe(tagData.color);

      createdTagId = tag.id;
    });

    test('should list tags', async () => {
      const response = await client.tags.list({
        teamId: testConfig.teamId,
        limit: 10,
        page: 1,
      });

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
      expect(response.params.count).toBeGreaterThanOrEqual(0);

      if (response.items.length > 0) {
        const tag = response.items[0];
        expect(tag?.id).toBeDefined();
        expect(tag?.name).toBeDefined();
        expect(typeof tag?.color).toBe('number');
      }
    });

    test('should get a specific tag', async () => {
      if (!createdTagId) {
        console.warn('Skipping get tag test - no tag created');
        return;
      }

      const tag = await client.tags.get(createdTagId);

      expect(tag).toBeDefined();
      expect(tag.id).toBe(createdTagId);
      expect(tag.name).toBeDefined();
      expect(typeof tag.color).toBe('number');
    });

    test('should update a tag', async () => {
      if (!createdTagId) {
        console.warn('Skipping update tag test - no tag created');
        return;
      }

      const updateData = {
        name: 'Updated Tag Name',
        color: 16711680, // Red color in integer format
      };

      const updatedTag = await client.tags.update(createdTagId, updateData);

      expect(updatedTag).toBeDefined();
      expect(updatedTag.id).toBe(createdTagId);
      expect(updatedTag.name).toBe(updateData.name);
      expect(updatedTag.color).toBe(updateData.color);
    });

    test('should search tags', async () => {
      const searchParams = {
        search: 'test',
        teamId: testConfig.teamId,
        limit: 20,
        page: 1,
      };

      const response = await client.tags.search(searchParams);

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle getting non-existent tag', async () => {
      await expect(client.tags.get('non-existent-tag-id')).rejects.toThrow();
    });

    test('should handle creating tag with invalid data', async () => {
      await expect(
        client.tags.create({
          name: '', // Empty name should fail validation
          color: -1, // Invalid color should fail validation
        }),
      ).rejects.toThrow();
    });

    test('should handle updating non-existent tag', async () => {
      await expect(
        client.tags.update('non-existent-tag-id', {
          name: 'This should fail',
        }),
      ).rejects.toThrow();
    });
  });
});
