import { TaskResource } from '../../../resources/TaskResource';
import { ApiClient } from '../../../http/ApiClient';
import { NavigablePage, Page } from '../../../models/Page';
import { Task, TaskCreateRequest, TaskUpdateRequest, TaskListParams, TaskStatusUpdateRequest, TaskTimesUpdateRequest } from '../../../models/Task';

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

      expect(mockClient.get).toHaveBeenCalledWith('/v1/tasks/1');
      expect(result).toEqual(mockTask);
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const newTaskData: TaskCreateRequest = {
        projectId: '100',
        description: 'New task description',
        location: 'Remote',
        startDateTime: '2023-01-20T00:00:00Z',
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

      expect(mockClient.post).toHaveBeenCalledWith('/v1/tasks', {
        ...newTaskData,
        startDateTime: '2023-01-20T00:00:00Z',
      });
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

      expect(mockClient.put).toHaveBeenCalledWith('/v1/tasks/1', {
        ...updateData,
        startDateTime: undefined,
        endDateTime: '2023-01-20T15:00:00Z',
      });
      expect(result).toEqual(mockUpdatedTask);
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      const taskId = '1';
      mockClient.delete.mockResolvedValueOnce(undefined);

      await taskResource.delete(taskId);

      expect(mockClient.delete).toHaveBeenCalledWith('/v1/tasks/1');
    });
  });

  describe('search', () => {
    it('should search tasks with parameters', async () => {
      const params: TaskListParams = {
        projectId: '100',
        limit: 10,
      };
      const mockTasks: Task[] = [
        {
          id: '1',
          projectId: '100',
          description: 'Project Task 1',
          startDateTime: '2023-01-01T00:00:00Z',
        },
        {
          id: '2',
          projectId: '100',
          description: 'Project Task 2',
          startDateTime: '2023-01-02T00:00:00Z',
        },
      ];

      const mockResponse: Page<Task> = {
        items: mockTasks,
        params: { page: 1, limit: 10, count: 2 },
      };

      mockClient.post.mockResolvedValueOnce(mockResponse);

      const result = await taskResource.search(params);

      expect(mockClient.post).toHaveBeenCalledWith('/v1/tasks/search', params);
      expect(result).toBeInstanceOf(NavigablePage);
      expect(result.items).toEqual(mockTasks);
    });
  });

  describe('updateStatus', () => {
    it('should update task status', async () => {
      const statusData: TaskStatusUpdateRequest = {
        id: '1',
        paid: true,
        billed: true,
      };

      const mockUpdatedTask: Task = {
        id: '1',
        projectId: '100',
        description: 'Task',
        startDateTime: '2023-01-01T00:00:00Z',
        endDateTime: '2023-01-20T15:00:00Z',
        paid: true,
        billed: true,
      };

      mockClient.put.mockResolvedValueOnce(mockUpdatedTask);

      const result = await taskResource.updateStatus(statusData);

      expect(mockClient.put).toHaveBeenCalledWith('/v1/tasks/updateStatus', statusData);
      expect(result).toEqual(mockUpdatedTask);
    });
  });

  describe('updateTimes', () => {
    it('should update task times', async () => {
      const timesData: TaskTimesUpdateRequest = {
        id: '1',
        startDateTime: '2023-01-01T09:00:00Z',
        endDateTime: '2023-01-01T17:00:00Z',
      };

      const mockUpdatedTask: Task = {
        id: '1',
        projectId: '100',
        description: 'Task',
        startDateTime: '2023-01-01T09:00:00Z',
        endDateTime: '2023-01-01T17:00:00Z',
      };

      mockClient.put.mockResolvedValueOnce(mockUpdatedTask);

      const result = await taskResource.updateTimes(timesData);

      expect(mockClient.put).toHaveBeenCalledWith('/v1/tasks/updateTimes', {
        id: '1',
        startDateTime: '2023-01-01T09:00:00Z',
        endDateTime: '2023-01-01T17:00:00Z',
      });
      expect(result).toEqual(mockUpdatedTask);
    });
  });
});