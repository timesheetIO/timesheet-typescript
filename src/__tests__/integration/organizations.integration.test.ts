import { createTestClient, describeIntegration, testConfig } from '../setup';
import type { TimesheetClient } from '../../index';

describeIntegration('Organizations Resource Integration Tests', () => {
  let client: TimesheetClient;
  let createdOrganizationId: string | undefined;

  beforeAll(() => {
    
    client = createTestClient();
  });

  afterAll(async () => {
    // Clean up created organization
    if (createdOrganizationId) {
      try {
        await client.organizations.delete(createdOrganizationId);
      } catch (error) {
        console.error('Failed to clean up organization:', error);
      }
    }
  });

  describe('Organizations CRUD Operations', () => {
    test('should create a new organization', async () => {
      const organizationData = {
        name: 'Test Organization',
        description: 'Integration test organization',
        website: 'https://test-org.example.com',
        industry: 'Software',
      };

      const organization = await client.organizations.create(organizationData);

      expect(organization).toBeDefined();
      expect(organization.id).toBeDefined();
      expect(organization.name).toBe(organizationData.name);

      createdOrganizationId = organization.id;
    });

    test('should list organizations', async () => {
      const response = await client.organizations.list({
        limit: 10,
        page: 1,
        sort: 'created',
        order: 'desc',
      });

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
      expect(response.params.count).toBeGreaterThanOrEqual(0);

      if (response.items.length > 0) {
        const organization = response.items[0];
        expect(organization?.id).toBeDefined();
        expect(organization?.name).toBeDefined();
      }
    });

    test('should get a specific organization', async () => {
      if (!createdOrganizationId) {
        console.warn('Skipping get organization test - no organization created');
        return;
      }

      const organization = await client.organizations.get(createdOrganizationId);

      expect(organization).toBeDefined();
      expect(organization.id).toBe(createdOrganizationId);
      expect(organization.name).toBeDefined();
    });

    test('should update an organization', async () => {
      if (!createdOrganizationId) {
        console.warn('Skipping update organization test - no organization created');
        return;
      }

      const updateData = {
        name: 'Updated Test Organization',
        website: 'https://updated-test-org.example.com',
      };

      const updatedOrganization = await client.organizations.update(
        createdOrganizationId,
        updateData,
      );

      expect(updatedOrganization).toBeDefined();
      expect(updatedOrganization.id).toBe(createdOrganizationId);
      expect(updatedOrganization.name).toBe(updateData.name);
    });

    test('should search organizations', async () => {
      const searchParams = {
        search: 'test',
        limit: 20,
        page: 1,
        count: 0,
      };

      const response = await client.organizations.search(searchParams);

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle getting non-existent organization', async () => {
      await expect(client.organizations.get('non-existent-organization-id')).rejects.toThrow();
    });

    test('should handle creating organization with invalid data', async () => {
      await expect(
        client.organizations.create({
          name: '', // Empty name
        }),
      ).rejects.toThrow();
    });

    test('should handle updating non-existent organization', async () => {
      await expect(
        client.organizations.update('non-existent-organization-id', {
          name: 'This should fail',
        }),
      ).rejects.toThrow();
    });
  });
});
