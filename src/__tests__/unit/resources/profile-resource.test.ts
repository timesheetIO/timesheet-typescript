import { ProfileResource } from '../../../resources/ProfileResource';
import { ApiClient } from '../../../http/ApiClient';
import { Profile } from '../../../models/Profile';

// Mock ApiClient
jest.mock('../../../http/ApiClient');

describe('ProfileResource', () => {
  let profileResource: ProfileResource;
  let mockClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      put: jest.fn(),
    } as unknown as jest.Mocked<ApiClient>;

    profileResource = new ProfileResource(mockClient);
  });

  describe('getProfile', () => {
    it('should get current user profile', async () => {
      const mockProfile: Profile = {
        id: '1',
        email: 'test@example.com',
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        avatarUri: 'https://example.com/avatar.jpg',
      };

      mockClient.get.mockResolvedValueOnce(mockProfile);

      const result = await profileResource.getProfile();

      expect(mockClient.get).toHaveBeenCalledWith('/v1/profiles/me');
      expect(result).toEqual(mockProfile);
    });

    it('should handle errors when getting profile', async () => {
      const error = new Error('Network error');
      mockClient.get.mockRejectedValueOnce(error);

      await expect(profileResource.getProfile()).rejects.toThrow('Network error');
      expect(mockClient.get).toHaveBeenCalledWith('/v1/profiles/me');
    });
  });

  describe('updateProfile', () => {
    it('should update current user profile', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const mockUpdatedProfile: Profile = {
        id: '1',
        email: 'test@example.com',
        name: 'Jane Smith',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      mockClient.put.mockResolvedValueOnce(mockUpdatedProfile);

      const result = await profileResource.updateProfile(updateData);

      expect(mockClient.put).toHaveBeenCalledWith('/v1/profiles/me', updateData);
      expect(result).toEqual(mockUpdatedProfile);
    });

    it('should handle partial updates', async () => {
      const updateData = {
        name: 'John Updated',
      };

      const mockUpdatedProfile: Profile = {
        id: '1',
        email: 'test@example.com',
        name: 'John Updated',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockClient.put.mockResolvedValueOnce(mockUpdatedProfile);

      const result = await profileResource.updateProfile(updateData);

      expect(mockClient.put).toHaveBeenCalledWith('/v1/profiles/me', updateData);
      expect(result.name).toBe('John Updated');
    });

    it('should handle errors when updating profile', async () => {
      const updateData = { firstName: 'Test' };
      const error = new Error('Validation error');
      mockClient.put.mockRejectedValueOnce(error);

      await expect(profileResource.updateProfile(updateData)).rejects.toThrow('Validation error');
      expect(mockClient.put).toHaveBeenCalledWith('/v1/profiles/me', updateData);
    });
  });
});