import { Resource } from '../../../resources/Resource';
import { ApiClient } from '../../../http/ApiClient';
import { NavigablePage } from '../../../models/Page';

// Mock ApiClient
jest.mock('../../../http/ApiClient');

// Create a concrete implementation for testing
class TestResource extends Resource<{ id: number; name: string }> {
  constructor(client: ApiClient) {
    super(client, '/test');
  }
}

describe('Resource base class', () => {
  let resource: TestResource;
  let mockClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ApiClient>;

    resource = new TestResource(mockClient);
  });

  describe('list', () => {
    it('should list resources without params', async () => {
      const mockResponse = {
        items: [{ id: 1, name: 'Test 1' }, { id: 2, name: 'Test 2' }],
        params: { page: 1, limit: 25, count: 2 },
      };
      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await resource.list();

      expect(mockClient.get).toHaveBeenCalledWith('/test', undefined);
      expect(result).toBeInstanceOf(NavigablePage);
      expect(result.items).toEqual(mockResponse.items);
      expect(result.params).toEqual(mockResponse.params);
    });

    it('should list resources with params', async () => {
      const params = { page: 2, limit: 10, sort: 'name' };
      const mockResponse = {
        items: [{ id: 3, name: 'Test 3' }],
        params: { ...params, count: 50 },
      };
      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await resource.list(params);

      expect(mockClient.get).toHaveBeenCalledWith('/test', params);
      expect(result.items).toEqual(mockResponse.items);
    });

    it('should provide nextPageLoader for pagination', async () => {
      const mockResponse = {
        items: [{ id: 1, name: 'Test 1' }],
        params: { page: 1, limit: 1, count: 3 },
      };
      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await resource.list({ limit: 1 });

      expect(result.hasNextPage).toBe(true);

      // Mock response for next page
      const nextPageResponse = {
        items: [{ id: 2, name: 'Test 2' }],
        params: { page: 2, limit: 1, count: 3 },
      };
      mockClient.get.mockResolvedValueOnce(nextPageResponse);

      const nextPage = await result.nextPage();
      expect(mockClient.get).toHaveBeenCalledWith('/test', { limit: 1, page: 2 });
      expect(nextPage.items).toEqual(nextPageResponse.items);
    });
  });

  describe('get', () => {
    it('should get a resource by id', async () => {
      const mockResponse = { id: 1, name: 'Test Item' };
      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await resource.get(1);

      expect(mockClient.get).toHaveBeenCalledWith('/test/1');
      expect(result).toEqual(mockResponse);
    });

    it('should get a resource by string id', async () => {
      const mockResponse = { id: 1, name: 'Test Item' };
      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await resource.get('custom-id');

      expect(mockClient.get).toHaveBeenCalledWith('/test/custom-id');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('should create a resource', async () => {
      const data = { name: 'New Item' };
      const mockResponse = { id: 1, ...data };
      mockClient.post.mockResolvedValueOnce(mockResponse);

      const result = await resource.create(data);

      expect(mockClient.post).toHaveBeenCalledWith('/test', data);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should update a resource', async () => {
      const id = 1;
      const data = { name: 'Updated Item' };
      const mockResponse = { id, ...data };
      mockClient.put.mockResolvedValueOnce(mockResponse);

      const result = await resource.update(id, data);

      expect(mockClient.put).toHaveBeenCalledWith('/test/1', data);
      expect(result).toEqual(mockResponse);
    });

    it('should update a resource with string id', async () => {
      const id = 'custom-id';
      const data = { name: 'Updated Item' };
      const mockResponse = { id, ...data };
      mockClient.put.mockResolvedValueOnce(mockResponse);

      const result = await resource.update(id, data);

      expect(mockClient.put).toHaveBeenCalledWith('/test/custom-id', data);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a resource', async () => {
      const id = 1;
      mockClient.delete.mockResolvedValueOnce(undefined);

      await resource.delete(id);

      expect(mockClient.delete).toHaveBeenCalledWith('/test/1');
    });

    it('should delete a resource with string id', async () => {
      const id = 'custom-id';
      mockClient.delete.mockResolvedValueOnce(undefined);

      await resource.delete(id);

      expect(mockClient.delete).toHaveBeenCalledWith('/test/custom-id');
    });
  });

  describe('buildPath', () => {
    it('should build path without id', () => {
      const path = (resource as any).buildPath();
      expect(path).toBe('/test');
    });

    it('should build path with numeric id', () => {
      const path = (resource as any).buildPath(123);
      expect(path).toBe('/test/123');
    });

    it('should build path with string id', () => {
      const path = (resource as any).buildPath('abc-123');
      expect(path).toBe('/test/abc-123');
    });
  });
});