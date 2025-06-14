import { SettingsResource } from '../../../resources/SettingsResource';
import { ApiClient } from '../../../http/ApiClient';
import { Settings } from '../../../models/Settings';

// Mock ApiClient
jest.mock('../../../http/ApiClient');

describe('SettingsResource', () => {
  let settingsResource: SettingsResource;
  let mockClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      put: jest.fn(),
    } as unknown as jest.Mocked<ApiClient>;

    settingsResource = new SettingsResource(mockClient);
  });

  describe('get', () => {
    it('should get user settings', async () => {
      const mockSettings: Settings = {
        theme: 'dark',
        timezone: 'America/New_York',
        language: 'en',
        currency: 'USD',
        timeFormat: '24h',
        dateFormat: 'YYYY-MM-DD',
        firstDay: 1,
        timerRounding: 15,
        timerRoundingType: 'nearest',
        pauseRounding: 5,
      };

      mockClient.get.mockResolvedValueOnce(mockSettings);

      const result = await settingsResource.get();

      expect(mockClient.get).toHaveBeenCalledWith('/v1/settings');
      expect(result).toEqual(mockSettings);
    });

    it('should handle errors when getting settings', async () => {
      const error = new Error('Unauthorized');
      mockClient.get.mockRejectedValueOnce(error);

      await expect(settingsResource.get()).rejects.toThrow('Unauthorized');
      expect(mockClient.get).toHaveBeenCalledWith('/v1/settings');
    });
  });

  describe('update', () => {
    it('should update user settings', async () => {
      const updateData = {
        theme: 'light' as const,
        timeFormat: '12h' as const,
      };

      const mockUpdatedSettings: Settings = {
        theme: 'light',
        timezone: 'America/New_York',
        language: 'en',
        currency: 'USD',
        timeFormat: '12h',
        dateFormat: 'YYYY-MM-DD',
        firstDay: 1,
      };

      mockClient.put.mockResolvedValueOnce(mockUpdatedSettings);

      const result = await settingsResource.update(updateData);

      expect(mockClient.put).toHaveBeenCalledWith('/v1/settings', updateData);
      expect(result).toEqual(mockUpdatedSettings);
    });

    it('should handle partial updates', async () => {
      const updateData = {
        timerRounding: 5,
        timerRoundingType: 'up' as const,
      };

      const mockUpdatedSettings: Settings = {
        theme: 'dark',
        timezone: 'America/New_York',
        language: 'en',
        currency: 'USD',
        timeFormat: '24h',
        dateFormat: 'YYYY-MM-DD',
        firstDay: 1,
        timerRounding: 5,
        timerRoundingType: 'up',
      };

      mockClient.put.mockResolvedValueOnce(mockUpdatedSettings);

      const result = await settingsResource.update(updateData);

      expect(mockClient.put).toHaveBeenCalledWith('/v1/settings', updateData);
      expect(result.timerRounding).toBe(5);
      expect(result.timerRoundingType).toBe('up');
    });

    it('should handle errors when updating settings', async () => {
      const updateData = { theme: 'invalid-theme' as any };
      const error = new Error('Invalid theme value');
      mockClient.put.mockRejectedValueOnce(error);

      await expect(settingsResource.update(updateData)).rejects.toThrow('Invalid theme value');
      expect(mockClient.put).toHaveBeenCalledWith('/v1/settings', updateData);
    });
  });
});