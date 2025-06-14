import { TaskResource } from '../../../resources/TaskResource';
import { ApiClient } from '../../../http/ApiClient';
import { NavigablePage } from '../../../models/Page';
import { Task } from '../../../models/Task';

// Mock ApiClient
jest.mock('../../../http/ApiClient');

describe('TaskResource', () => {
  let taskResource: TaskResource;
  let mockClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ApiClient>;

    taskResource = new TaskResource(mockClient);
  });

  describe('list', () => {
    it('should list tasks with default parameters', async () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          projectId: '100',
          description: 'Task 1',
          startDateTime: '2023-01-01T00:00:00Z',
          endDateTime: '2023-01-01T01:00:00Z',
        },
      ];

      const mockResponse = {
        items: mockTasks,
        params: { page: 1, limit: 25, count: 1 },
      };

      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await taskResource.list();

      expect(mockClient.get).toHaveBeenCalledWith('/tasks', undefined);
      expect(result).toBeInstanceOf(NavigablePage);
      expect(result.items).toEqual(mockTasks);
    });

    it('should list tasks with custom parameters', async () => {
      const params = {
        page: 2,
        limit: 10,
        projectId: '100',
      };

      const mockResponse = {
        items: [],
        params: { ...params, count: 0 },
      };

      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await taskResource.list(params);

      expect(mockClient.get).toHaveBeenCalledWith('/tasks', params);
      expect(result.items).toEqual([]);
    });
  });

  describe('get', () => {
    it('should get a task by id', async () => {
      const mockTask: Task = {
        id: '1',
        projectId: '100',
        description: 'Test Task',
        startDateTime: '2023-01-01T00:00:00Z',
        endDateTime: '2023-01-01T08:00:00Z',
        location: 'Office',
        billable: true,
        paid: false,
        feeling: 4,
      };

      mockClient.get.mockResolvedValueOnce(mockTask);

      const result = await taskResource.get('1');

      expect(mockClient.get).toHaveBeenCalledWith('/tasks/1');
      expect(result).toEqual(mockTask);
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const newTaskData = {
        projectId: '100',
        description: 'New task description',
        location: 'Remote',
      };

      const mockCreatedTask: Task = {
        id: '2',
        projectId: '100',
        description: 'New task description',
        location: 'Remote',
        startDateTime: '2023-01-20T00:00:00Z',
      };

      mockClient.post.mockResolvedValueOnce(mockCreatedTask);

      const result = await taskResource.create(newTaskData);

      expect(mockClient.post).toHaveBeenCalledWith('/tasks', newTaskData);
      expect(result).toEqual(mockCreatedTask);
    });
  });

  describe('update', () => {
    it('should update an existing task', async () => {
      const taskId = '1';
      const updateData = {
        description: 'Updated Task Description',
        endDateTime: '2023-01-20T15:00:00Z',
      };

      const mockUpdatedTask: Task = {
        id: taskId,
        projectId: '100',
        description: 'Updated Task Description',
        startDateTime: '2023-01-01T00:00:00Z',
        endDateTime: '2023-01-20T15:00:00Z',
      };

      mockClient.put.mockResolvedValueOnce(mockUpdatedTask);

      const result = await taskResource.update(taskId, updateData);

      expect(mockClient.put).toHaveBeenCalledWith('/tasks/1', updateData);
      expect(result).toEqual(mockUpdatedTask);
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      const taskId = '1';
      mockClient.delete.mockResolvedValueOnce(undefined);

      await taskResource.delete(taskId);

      expect(mockClient.delete).toHaveBeenCalledWith('/tasks/1');
    });
  });

  describe('getByProject', () => {
    it('should get tasks by project id', async () => {
      const projectId = '100';
      const mockTasks: Task[] = [
        {
          id: '1',
          projectId,
          description: 'Project Task 1',
          startDateTime: '2023-01-01T00:00:00Z',
        },
        {
          id: '2',
          projectId,
          description: 'Project Task 2',
          startDateTime: '2023-01-02T00:00:00Z',
        },
      ];

      const mockResponse = {
        items: mockTasks,
        params: { page: 1, limit: 25, count: 2 },
      };

      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await taskResource.getByProject(projectId);

      expect(mockClient.get).toHaveBeenCalledWith('/projects/100/tasks', undefined);
      expect(result).toBeInstanceOf(NavigablePage);
      expect(result.items).toEqual(mockTasks);
    });

    it('should get tasks by project id with params', async () => {
      const projectId = '100';
      const params = { limit: 5 };

      const mockResponse = {
        items: [],
        params: { ...params, page: 1, count: 0 },
      };

      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await taskResource.getByProject(projectId, params);

      expect(mockClient.get).toHaveBeenCalledWith('/projects/100/tasks', params);
      expect(result.items).toEqual([]);
    });
  });

  describe('updateStatus', () => {
    it('should update task status', async () => {
      const taskId = '1';
      const newStatus = 'completed';

      const mockUpdatedTask: Task = {
        id: taskId,
        projectId: '100',
        description: 'Task',
        startDateTime: '2023-01-01T00:00:00Z',
        endDateTime: '2023-01-20T15:00:00Z',
      };

      mockClient.put.mockResolvedValueOnce(mockUpdatedTask);

      const result = await taskResource.updateStatus(taskId, newStatus);

      expect(mockClient.put).toHaveBeenCalledWith('/tasks/1/status', { status: newStatus });
      expect(result).toEqual(mockUpdatedTask);
    });
  });

  describe('assign', () => {
    it('should assign task to user', async () => {
      const taskId = '1';
      const userId = '5';

      const mockUpdatedTask: Task = {
        id: taskId,
        projectId: '100',
        description: 'Task',
        startDateTime: '2023-01-01T00:00:00Z',
        member: {
          id: userId,
          user: userId,
        },
      };

      mockClient.put.mockResolvedValueOnce(mockUpdatedTask);

      const result = await taskResource.assign(taskId, userId);

      expect(mockClient.put).toHaveBeenCalledWith('/tasks/1/assign', { userId });
      expect(result).toEqual(mockUpdatedTask);
      expect(result.member?.id).toBe(userId);
    });

    it('should unassign task when userId is null', async () => {
      const taskId = '1';

      const mockUpdatedTask: Task = {
        id: taskId,
        projectId: '100',
        description: 'Task',
        startDateTime: '2023-01-01T00:00:00Z',
        member: undefined,
      };

      mockClient.put.mockResolvedValueOnce(mockUpdatedTask);

      const result = await taskResource.assign(taskId, null);

      expect(mockClient.put).toHaveBeenCalledWith('/tasks/1/assign', { userId: null });
      expect(result).toEqual(mockUpdatedTask);
      expect(result.member).toBeUndefined();
    });
  });
});