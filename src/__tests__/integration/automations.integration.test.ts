import { createTestClient, describeIntegration, testConfig, testData } from '../setup';
import type { TimesheetClient } from '../../index';

describeIntegration('Automations Resource Integration Tests', () => {
  let client: TimesheetClient;
  let createdAutomationId: string | undefined;
  let createdProjectId: string | undefined;

  beforeAll(async () => {
    client = createTestClient();

    // Create a test project for automations
    const projectData = {
      title: testData.generateProjectTitle(),
      description: 'Test project for automations',
      teamId: testConfig.teamId,
    };
    const project = await client.projects.create(projectData);
    createdProjectId = project.id;
  });

  afterAll(async () => {
    // Clean up created automation and project
    if (createdAutomationId) {
      try {
        await client.automations.delete(createdAutomationId);
      } catch (error) {
        console.error('Failed to clean up automation:', error);
      }
    }
    if (createdProjectId) {
      try {
        await client.projects.delete(createdProjectId);
      } catch (error) {
        console.error('Failed to clean up project:', error);
      }
    }
  });

  describe('Automations CRUD Operations', () => {
    test('should create a new automation', async () => {
      if (!createdProjectId) {
        console.warn('Skipping create automation test - no project created');
        return;
      }

      const automationData = {
        projectId: createdProjectId,
        typeId: 0 as const, // 0 = WLAN
        action: 0 as const, // 0 = start
        enabled: true,
        shared: false,
        ssid: 'TestWiFi', // WLAN specific field
      };

      const automation = await client.automations.create(automationData);

      expect(automation).toBeDefined();
      expect(automation.id).toBeDefined();
      expect(automation.project.id).toBe(automationData.projectId);
      expect(automation.typeId).toBe(automationData.typeId);
      expect(automation.action).toBe(automationData.action);
      expect(automation.enabled).toBe(true);

      createdAutomationId = automation.id;
    });

    test('should list automations', async () => {
      const response = await client.automations.list({
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
        const automation = response.items[0];
        expect(automation?.id).toBeDefined();
        expect(automation?.project.id).toBeDefined();
      }
    });

    test('should get a specific automation', async () => {
      if (!createdAutomationId) {
        console.warn('Skipping get automation test - no automation created');
        return;
      }

      const automation = await client.automations.get(createdAutomationId);

      expect(automation).toBeDefined();
      expect(automation.id).toBe(createdAutomationId);
      expect(automation.project.id).toBeDefined();
      expect(automation.typeId).toBeDefined();
    });

    test('should update an automation', async () => {
      if (!createdAutomationId) {
        console.warn('Skipping update automation test - no automation created');
        return;
      }

      const updateData = {
        enabled: false,
        shared: true,
        action: 1 as const, // 1 = stop
      };

      const updatedAutomation = await client.automations.update(createdAutomationId, updateData);

      expect(updatedAutomation).toBeDefined();
      expect(updatedAutomation.id).toBe(createdAutomationId);
      expect(updatedAutomation.enabled).toBe(false);
      expect(updatedAutomation.shared).toBe(true);
      expect(updatedAutomation.action).toBe(1);
    });

    test('should search automations', async () => {
      const searchParams = {
        limit: 20,
        page: 1,
        count: 0,
        projectId: createdProjectId,
      };

      const response = await client.automations.search(searchParams);

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle getting non-existent automation', async () => {
      await expect(client.automations.get('non-existent-automation-id')).rejects.toThrow();
    });

    test('should handle creating automation with invalid data', async () => {
      await expect(
        client.automations.create({
          projectId: 'non-existent-project-id',
          typeId: 5 as 0, // Invalid typeId (using valid type but invalid value)
          action: 0,
        }),
      ).rejects.toThrow();
    });

    test('should handle updating non-existent automation', async () => {
      await expect(
        client.automations.update('non-existent-automation-id', {
          enabled: false,
        }),
      ).rejects.toThrow();
    });
  });
});
