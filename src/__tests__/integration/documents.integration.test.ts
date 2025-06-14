import { createTestClient, skipIfNoApiKey, testConfig } from '../setup';
import type { TimesheetClient } from '../../index';

describe('Documents Resource Integration Tests', () => {
  let client: TimesheetClient;
  let createdDocumentId: string | undefined;

  beforeAll(() => {
    if (skipIfNoApiKey()) return;
    client = createTestClient();
  });

  afterAll(async () => {
    // Clean up created document
    if (createdDocumentId) {
      try {
        await client.documents.delete(createdDocumentId);
      } catch (error) {
        console.error('Failed to clean up document:', error);
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

  describe('Documents CRUD Operations', () => {
    test('should create a new document', async () => {
      const documentData = {
        name: 'Test Document',
        description: 'Integration test document',
        templateId: '1',
        category: 1,
        headline: 'Test Document Headline',
      };

      const document = await client.documents.create(documentData);

      expect(document).toBeDefined();
      expect(document.id).toBeDefined();
      expect(document.name).toBe(documentData.name);
      expect(document.description).toBe(documentData.description);

      createdDocumentId = document.id;
    });

    test('should list documents', async () => {
      const response = await client.documents.list({
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
        const document = response.items[0];
        expect(document?.id).toBeDefined();
        expect(document?.name).toBeDefined();
      }
    });

    test('should get a specific document', async () => {
      if (!createdDocumentId) {
        console.warn('Skipping get document test - no document created');
        return;
      }

      const document = await client.documents.get(createdDocumentId);

      expect(document).toBeDefined();
      expect(document.id).toBe(createdDocumentId);
      expect(document.name).toBeDefined();
      expect(document.description).toBeDefined();
    });

    test('should update a document', async () => {
      if (!createdDocumentId) {
        console.warn('Skipping update document test - no document created');
        return;
      }

      const updateData = {
        name: 'Updated Test Document',
        description: 'Updated integration test document',
        headline: 'Updated Headline',
      };

      const updatedDocument = await client.documents.update(createdDocumentId, updateData);

      expect(updatedDocument).toBeDefined();
      expect(updatedDocument.id).toBe(createdDocumentId);
      expect(updatedDocument.name).toBe(updateData.name);
      expect(updatedDocument.description).toBe(updateData.description);
    });

    test('should search documents', async () => {
      const searchParams = {
        search: 'test',
        limit: 20,
        page: 1,
        count: 0,
      };

      const response = await client.documents.search(searchParams);

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle getting non-existent document', async () => {
      await expect(client.documents.get('non-existent-document-id')).rejects.toThrow();
    });

    test('should handle creating document with invalid data', async () => {
      await expect(
        client.documents.create({
          name: '', // Empty name
          category: -1, // Invalid category
        }),
      ).rejects.toThrow();
    });

    test('should handle updating non-existent document', async () => {
      await expect(
        client.documents.update('non-existent-document-id', {
          name: 'This should fail',
        }),
      ).rejects.toThrow();
    });
  });
});
