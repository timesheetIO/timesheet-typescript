import { ProjectResource } from '../../../resources/ProjectResource';
import { ApiClient } from '../../../http/ApiClient';
import { NavigablePage } from '../../../models/Page';
import { Project, ProjectStatus } from '../../../models/Project';

// Mock ApiClient
jest.mock('../../../http/ApiClient');

describe('ProjectResource', () => {
  let projectResource: ProjectResource;
  let mockClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ApiClient>;

    projectResource = new ProjectResource(mockClient);
  });

  describe('list', () => {
    it('should list projects', async () => {
      const mockProjects: Project[] = [
        {
          id: 1,
          name: 'Project Alpha',
          description: 'First project',
          status: ProjectStatus.ACTIVE,
          color: '#FF5733',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
      ];

      const mockResponse = {
        items: mockProjects,
        params: { page: 1, limit: 25, count: 1 },
      };

      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await projectResource.list();

      expect(mockClient.get).toHaveBeenCalledWith('/projects', undefined);
      expect(result).toBeInstanceOf(NavigablePage);
      expect(result.items).toEqual(mockProjects);
    });
  });

  describe('get', () => {
    it('should get a project by id', async () => {
      const mockProject: Project = {
        id: 1,
        name: 'Project Alpha',
        description: 'Detailed project description',
        status: ProjectStatus.ACTIVE,
        color: '#FF5733',
        budget: 50000,
        hourlyRate: 150,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        clientId: 10,
        managerId: 5,
        tags: ['web', 'frontend'],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-15T00:00:00Z',
      };

      mockClient.get.mockResolvedValueOnce(mockProject);

      const result = await projectResource.get(1);

      expect(mockClient.get).toHaveBeenCalledWith('/projects/1');
      expect(result).toEqual(mockProject);
    });
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const newProjectData = {
        name: 'New Project',
        description: 'A brand new project',
        status: ProjectStatus.ACTIVE,
        color: '#00FF00',
      };

      const mockCreatedProject: Project = {
        id: 2,
        ...newProjectData,
        createdAt: '2023-01-20T00:00:00Z',
        updatedAt: '2023-01-20T00:00:00Z',
      };

      mockClient.post.mockResolvedValueOnce(mockCreatedProject);

      const result = await projectResource.create(newProjectData);

      expect(mockClient.post).toHaveBeenCalledWith('/projects', newProjectData);
      expect(result).toEqual(mockCreatedProject);
    });
  });

  describe('update', () => {
    it('should update an existing project', async () => {
      const projectId = 1;
      const updateData = {
        name: 'Updated Project Name',
        status: ProjectStatus.COMPLETED,
        endDate: '2023-06-30',
      };

      const mockUpdatedProject: Project = {
        id: projectId,
        name: 'Updated Project Name',
        description: 'Original description',
        status: ProjectStatus.COMPLETED,
        color: '#FF5733',
        endDate: '2023-06-30',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-20T00:00:00Z',
      };

      mockClient.put.mockResolvedValueOnce(mockUpdatedProject);

      const result = await projectResource.update(projectId, updateData);

      expect(mockClient.put).toHaveBeenCalledWith('/projects/1', updateData);
      expect(result).toEqual(mockUpdatedProject);
    });
  });

  describe('delete', () => {
    it('should delete a project', async () => {
      const projectId = 1;
      mockClient.delete.mockResolvedValueOnce(undefined);

      await projectResource.delete(projectId);

      expect(mockClient.delete).toHaveBeenCalledWith('/projects/1');
    });
  });

  describe('archive', () => {
    it('should archive a project', async () => {
      const projectId = 1;
      const mockArchivedProject: Project = {
        id: projectId,
        name: 'Project Alpha',
        description: 'Archived project',
        status: ProjectStatus.ARCHIVED,
        color: '#FF5733',
        archivedAt: '2023-01-20T00:00:00Z',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-20T00:00:00Z',
      };

      mockClient.put.mockResolvedValueOnce(mockArchivedProject);

      const result = await projectResource.archive(projectId);

      expect(mockClient.put).toHaveBeenCalledWith('/projects/1/archive', {});
      expect(result).toEqual(mockArchivedProject);
      expect(result.status).toBe(ProjectStatus.ARCHIVED);
    });
  });

  describe('unarchive', () => {
    it('should unarchive a project', async () => {
      const projectId = 1;
      const mockUnarchivedProject: Project = {
        id: projectId,
        name: 'Project Alpha',
        description: 'Active project again',
        status: ProjectStatus.ACTIVE,
        color: '#FF5733',
        archivedAt: undefined,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-20T00:00:00Z',
      };

      mockClient.put.mockResolvedValueOnce(mockUnarchivedProject);

      const result = await projectResource.unarchive(projectId);

      expect(mockClient.put).toHaveBeenCalledWith('/projects/1/unarchive', {});
      expect(result).toEqual(mockUnarchivedProject);
      expect(result.status).toBe(ProjectStatus.ACTIVE);
      expect(result.archivedAt).toBeUndefined();
    });
  });
});