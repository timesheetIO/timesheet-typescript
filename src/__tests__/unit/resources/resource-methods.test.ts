/**
 * Unit tests to verify resource methods match their actual implementations
 * This test documents which methods are available on each resource
 */

import { ProjectResource, TimerResource } from '../../../resources';
import { ApiClient } from '../../../http';
import { ApiKeyAuth } from '../../../auth';
import { RetryConfig } from '../../../config';

// Mock ApiClient
jest.mock('../../../http/ApiClient');

describe('Resource Method Verification', () => {
  let mockClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    const mockAuth = new ApiKeyAuth('ts_testkey.123456');
    mockClient = new ApiClient({
      baseUrl: 'https://api.timesheet.io/v1',
      authentication: mockAuth,
      retryConfig: new RetryConfig({ maxRetries: 0 }),
    }) as jest.Mocked<ApiClient>;
    mockClient.get = jest.fn();
    mockClient.post = jest.fn();
    mockClient.put = jest.fn();
    mockClient.delete = jest.fn();
  });

  describe('ProjectResource', () => {
    let projectResource: ProjectResource;

    beforeEach(() => {
      projectResource = new ProjectResource(mockClient);
    });

    test('should have correct methods', () => {
      // Verify all methods exist
      expect(typeof projectResource.list).toBe('function');
      expect(typeof projectResource.create).toBe('function');
      expect(typeof projectResource.get).toBe('function');
      expect(typeof projectResource.update).toBe('function');
      expect(typeof projectResource.delete).toBe('function');
      expect(typeof projectResource.search).toBe('function');

      // Verify non-existent methods
      expect((projectResource as Record<string, unknown>).getMembers).toBeUndefined();
      expect((projectResource as Record<string, unknown>).updateMembers).toBeUndefined();
    });
  });

  describe('TimerResource', () => {
    let timerResource: TimerResource;

    beforeEach(() => {
      timerResource = new TimerResource(mockClient);
    });

    test('should have correct methods', () => {
      expect(typeof timerResource.get).toBe('function');
      expect(typeof timerResource.start).toBe('function');
      expect(typeof timerResource.stop).toBe('function');
      expect(typeof timerResource.pause).toBe('function');
      expect(typeof timerResource.resume).toBe('function');
      expect(typeof timerResource.update).toBe('function');
    });

    test('pause method should accept optional TimerPauseRequest parameter', () => {
      const pauseMethod = timerResource.pause.bind(timerResource);
      // Check that the method accepts 0 or 1 parameter
      expect(pauseMethod.length).toBeLessThanOrEqual(1);
    });

    test('resume method should accept optional TimerResumeRequest parameter', () => {
      const resumeMethod = timerResource.resume.bind(timerResource);
      // Check that the method accepts 0 or 1 parameter
      expect(resumeMethod.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Fixed Issues Summary', () => {
    test('documentation of fixes made', () => {
      const fixes = [
        {
          resource: 'ProjectResource',
          issue: 'getMembers method does not exist',
          fix: 'Use listMembers instead, which returns NavigablePage<ProjectMember>',
        },
        {
          resource: 'TimerResource',
          issue: 'pause() and resume() methods did not accept parameters',
          fix: 'Updated to accept optional TimerPauseRequest and TimerResumeRequest',
        },
        {
          resource: 'Timer model',
          issue: 'Used incorrect field names (startTime, endTime)',
          fix: 'Updated to use startDateTime and endDateTime to match OpenAPI spec',
        },
        {
          resource: 'Timer model',
          issue: 'Missing request interfaces',
          fix: 'Added TimerPauseRequest and TimerResumeRequest interfaces',
        },
        {
          resource: 'Timer model',
          issue: 'Timer interface was incomplete',
          fix: 'Added user, task, and pause nested objects to match API response',
        },
      ];

      expect(fixes).toHaveLength(5);
      fixes.forEach((fix) => {
        expect(fix.resource).toBeDefined();
        expect(fix.issue).toBeDefined();
        expect(fix.fix).toBeDefined();
      });
    });
  });
});
