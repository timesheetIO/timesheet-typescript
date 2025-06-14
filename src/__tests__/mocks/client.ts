import type { ApiClient } from '../../http';

export const mockClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  request: jest.fn(),
} as unknown as ApiClient;

// Helper to reset all mocks
export const resetMocks = (): void => {
  (mockClient.get as jest.Mock).mockReset();
  (mockClient.post as jest.Mock).mockReset();
  (mockClient.put as jest.Mock).mockReset();
  (mockClient.delete as jest.Mock).mockReset();
  (mockClient.request as jest.Mock).mockReset();
};

// Helper to create a mock response
export const createMockResponse = <T>(data: T): Promise<T> => {
  return Promise.resolve(data);
};
