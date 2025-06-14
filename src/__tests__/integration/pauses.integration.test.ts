import { createTestClient, skipIfNoApiKey, testConfig, testData } from '../setup';
import type { TimesheetClient } from '../../index';

describe('Pauses Resource Integration Tests', () => {
  let client: TimesheetClient;
  let createdPauseId: string | undefined;
  let createdProjectId: string | undefined;
  let createdTaskId: string | undefined;

  beforeAll(async () => {
    if (skipIfNoApiKey()) return;
    client = createTestClient();

    // Create a test project for pauses
    const projectData = {
      title: testData.generateProjectTitle(),
      description: 'Test project for pauses',
      teamId: testConfig.teamId,
    };
    const project = await client.projects.create(projectData);
    createdProjectId = project.id;

    // Create a test task for pauses (required for PauseCreateRequest)
    const taskData = {
      projectId: createdProjectId,
      description: 'Test task for pauses',
      startDateTime: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      endDateTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      billable: true,
      typeId: 1,
    };
    const task = await client.tasks.create(taskData);
    createdTaskId = task.id;
  });

  afterAll(async () => {
    // Clean up created pause, task, and project
    if (createdPauseId) {
      try {
        await client.pauses.delete(createdPauseId);
      } catch (error) {
        console.error('Failed to clean up pause:', error);
      }
    }
    if (createdTaskId) {
      try {
        await client.tasks.delete(createdTaskId);
      } catch (error) {
        console.error('Failed to clean up task:', error);
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

  if (!testConfig.apiKey) {
    test('API key not configured - skipping integration tests', () => {
      console.log('ℹ️  To run integration tests, set TIMESHEET_API_KEY in your .env file');
      expect(true).toBe(true);
    });
    return;
  }

  describe('Pauses CRUD Operations', () => {
    test('should create a new pause', async () => {
      if (!createdTaskId) {
        console.warn('Skipping create pause test - no task created');
        return;
      }

      const pauseData = {
        startDateTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        endDateTime: new Date().toISOString(),
        description: 'Test pause',
        taskId: createdTaskId,
      };

      const pause = await client.pauses.create(pauseData);

      expect(pause).toBeDefined();
      expect(pause.id).toBeDefined();
      expect(pause.description).toBe(pauseData.description);

      createdPauseId = pause.id;
    });

    test('should list pauses', async () => {
      const response = await client.pauses.list({
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
        const pause = response.items[0];
        expect(pause?.id).toBeDefined();
      }
    });

    test('should get a specific pause', async () => {
      if (!createdPauseId) {
        console.warn('Skipping get pause test - no pause created');
        return;
      }

      const pause = await client.pauses.get(createdPauseId);

      expect(pause).toBeDefined();
      expect(pause.id).toBe(createdPauseId);
    });

    test('should update a pause', async () => {
      if (!createdPauseId) {
        console.warn('Skipping update pause test - no pause created');
        return;
      }

      const updateData = {
        description: 'Updated test pause',
        startDateTime: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        endDateTime: new Date().toISOString(),
      };

      const updatedPause = await client.pauses.update(createdPauseId, updateData);

      expect(updatedPause).toBeDefined();
      expect(updatedPause.id).toBe(createdPauseId);
      expect(updatedPause.description).toBe(updateData.description);
    });

    test('should search pauses', async () => {
      const searchParams = {
        search: 'test',
        limit: 20,
        page: 1,
        count: 0,
      };

      const response = await client.pauses.search(searchParams);

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle getting non-existent pause', async () => {
      await expect(client.pauses.get('non-existent-pause-id')).rejects.toThrow();
    });

    test('should handle creating pause with invalid data', async () => {
      if (!createdTaskId) {
        console.warn('Skipping invalid pause test - no task created');
        return;
      }

      await expect(
        client.pauses.create({
          startDateTime: 'invalid-date',
          endDateTime: 'invalid-date',
          taskId: createdTaskId,
        }),
      ).rejects.toThrow();
    });

    test('should handle updating non-existent pause', async () => {
      await expect(
        client.pauses.update('non-existent-pause-id', {
          description: 'This should fail',
          startDateTime: new Date(Date.now() - 3600000).toISOString(),
          endDateTime: new Date().toISOString(),
        }),
      ).rejects.toThrow();
    });
  });
});
