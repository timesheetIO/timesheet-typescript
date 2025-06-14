import { createTestClient, describeIntegration, testConfig, testData } from '../setup';
import type { TimesheetClient } from '../../index';

describeIntegration('Tasks Resource Integration Tests', () => {
  let client: TimesheetClient;
  let createdTaskId: string | undefined;
  let createdProjectId: string | undefined;

  beforeAll(async () => {
    
    client = createTestClient();

    // Create a test project for tasks
    const projectData = {
      title: testData.generateProjectTitle(),
      description: 'Test project for tasks',
      teamId: testConfig.teamId,
    };
    const project = await client.projects.create(projectData);
    createdProjectId = project.id;
  });

  afterAll(async () => {
    // Clean up created task and project
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

  describe('Tasks CRUD Operations', () => {
    test('should create a new task', async () => {
      if (!createdProjectId) {
        console.warn('Skipping create task test - no project created');
        return;
      }

      const taskData = {
        projectId: createdProjectId,
        description: 'Integration test task',
        startDateTime: new Date().toISOString(),
        billable: true,
        typeId: 1,
      };

      const task = await client.tasks.create(taskData);

      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.projectId).toBe(createdProjectId);
      expect(task.description).toBe(taskData.description);
      expect(task.billable).toBe(true);

      createdTaskId = task.id;
    });

    test('should get a specific task', async () => {
      if (!createdTaskId) {
        console.warn('Skipping get task test - no task created');
        return;
      }

      const task = await client.tasks.get(createdTaskId);

      expect(task).toBeDefined();
      expect(task.id).toBe(createdTaskId);
      expect(task.projectId).toBe(createdProjectId);
      expect(task.description).toBeDefined();
    });

    test('should update a task', async () => {
      if (!createdTaskId) {
        console.warn('Skipping update task test - no task created');
        return;
      }

      const updateData = {
        description: 'Updated integration test task',
        billable: false,
      };

      const updatedTask = await client.tasks.update(createdTaskId, updateData);

      expect(updatedTask).toBeDefined();
      expect(updatedTask.id).toBe(createdTaskId);
      expect(updatedTask.description).toBe(updateData.description);
      expect(updatedTask.billable).toBe(false);
    });

    test('should search tasks', async () => {
      const searchParams = {
        search: 'test',
        count: 0,
        limit: 20,
        page: 1,
        projectId: createdProjectId,
      };

      const response = await client.tasks.search(searchParams);

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
    });
  });

  describe('Task Status Operations', () => {
    test('should update task status', async () => {
      if (!createdTaskId) {
        console.warn('Skipping update status test - no task created');
        return;
      }

      const statusUpdateData = {
        id: createdTaskId,
        paid: false,
        billed: false,
      };

      const updatedTask = await client.tasks.updateStatus(statusUpdateData);

      expect(updatedTask).toBeDefined();
      expect(updatedTask.id).toBe(createdTaskId);
    });

    test('should update task times', async () => {
      if (!createdTaskId) {
        console.warn('Skipping update times test - no task created');
        return;
      }

      const timesUpdateData = {
        id: createdTaskId,
        startDateTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        endDateTime: new Date().toISOString(),
      };

      const updatedTask = await client.tasks.updateTimes(timesUpdateData);

      expect(updatedTask).toBeDefined();
      expect(updatedTask.id).toBe(createdTaskId);
      expect(updatedTask.startDateTime).toBeDefined();
      expect(updatedTask.endDateTime).toBeDefined();
    });

    test('should start and stop a task using update', async () => {
      if (!createdTaskId) {
        console.warn('Skipping start/stop task test - no task created');
        return;
      }

      // Start task by updating start time
      const startUpdate = {
        startDateTime: new Date().toISOString(),
      };
      const startedTask = await client.tasks.update(createdTaskId, startUpdate);
      expect(startedTask).toBeDefined();
      expect(startedTask.id).toBe(createdTaskId);
      expect(startedTask.startDateTime).toBe(startUpdate.startDateTime);

      // Stop task by updating end time
      const stopUpdate = {
        endDateTime: new Date().toISOString(),
      };
      const stoppedTask = await client.tasks.update(createdTaskId, stopUpdate);
      expect(stoppedTask).toBeDefined();
      expect(stoppedTask.id).toBe(createdTaskId);
      expect(stoppedTask.endDateTime).toBe(stopUpdate.endDateTime);
    });

    test('should handle updating status with invalid task IDs', async () => {
      await expect(
        client.tasks.updateStatus({
          id: 'non-existent-task-id',
          paid: true,
        }),
      ).rejects.toThrow();
    });

    test('should handle updating times with invalid data', async () => {
      await expect(
        client.tasks.updateTimes({
          id: 'non-existent-task-id',
          startDateTime: 'invalid-date',
          endDateTime: 'invalid-date',
        }),
      ).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle getting non-existent task', async () => {
      await expect(client.tasks.get('non-existent-task-id')).rejects.toThrow();
    });

    test('should handle creating task with invalid data', async () => {
      await expect(
        client.tasks.create({
          projectId: 'non-existent-project-id',
          startDateTime: 'invalid-date',
        }),
      ).rejects.toThrow();
    });

    test('should handle updating non-existent task', async () => {
      await expect(
        client.tasks.update('non-existent-task-id', {
          description: 'This should fail',
        }),
      ).rejects.toThrow();
    });
  });
});
