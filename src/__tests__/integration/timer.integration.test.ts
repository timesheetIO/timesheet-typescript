import { TimesheetClient } from '../../index';
import type { TimerStartRequest } from '../../models';
import { skipIfNoApiKey, testConfig } from '../setup';

describe('Timer Resource Integration Tests', () => {
  // Skip all tests if no API key is available
  if (skipIfNoApiKey()) {
    return;
  }

  let client: TimesheetClient;

  beforeAll(() => {
    // Use a dummy API key for testing if not provided
    const apiKey = testConfig.apiKey || 'ts_test.dummy123456';
    client = new TimesheetClient({
      apiKey,
      baseUrl: testConfig.baseUrl,
    });
  });

  describe('Timer State Operations', () => {
    it('should get current timer state', async () => {
      if (!testConfig.apiKey) {
        console.log('Skipping test: Real API key not provided');
        return;
      }

      const timer = await client.timer.get();
      expect(timer).toBeDefined();
      expect(timer).toHaveProperty('status');
      expect(['stopped', 'running', 'paused']).toContain(timer.status);
    });

    it('should update timer with new project information', async () => {
      if (!testConfig.apiKey || !testConfig.projectId) {
        console.log('Skipping test: Real API key or project ID not provided');
        return;
      }

      // First ensure we have a running timer
      const currentTimer = await client.timer.get();
      if (currentTimer.status === 'stopped') {
        await client.timer.start({ projectId: testConfig.projectId });
      }

      // Update the timer
      const updateData = {
        startDateTime: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        description: 'Updated timer description',
        billable: true,
      };

      const updatedTimer = await client.timer.update(updateData);
      expect(updatedTimer).toBeDefined();
      expect(updatedTimer.task?.startDateTime).toBe(updateData.startDateTime);
      expect(updatedTimer.task?.description).toBe(updateData.description);

      // Clean up - stop the timer
      await client.timer.stop();
    });
  });

  describe('Timer workflow', () => {
    it('should start, pause, resume, and stop timer', async () => {
      if (!testConfig.apiKey || !testConfig.projectId) {
        console.log('Skipping test: Real API key or project ID not provided');
        return;
      }

      // Start timer
      const startRequest: TimerStartRequest = {
        projectId: testConfig.projectId,
      };
      const startedTimer = await client.timer.start(startRequest);
      expect(startedTimer.status).toBe('running');
      expect(startedTimer.task?.projectId).toBe(testConfig.projectId);

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Pause timer
      const pausedTimer = await client.timer.pause();
      expect(pausedTimer.status).toBe('paused');

      // Resume timer
      const resumedTimer = await client.timer.resume();
      expect(resumedTimer.status).toBe('running');

      // Stop timer
      const stoppedTimer = await client.timer.stop();
      expect(stoppedTimer.status).toBe('stopped');
      expect(stoppedTimer.task).toBeDefined();
      expect(stoppedTimer.task?.endDateTime).toBeDefined();
    });

    it('should handle timer operations with custom timestamps', async () => {
      if (!testConfig.apiKey || !testConfig.projectId) {
        console.log('Skipping test: Real API key or project ID not provided');
        return;
      }

      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);
      const thirtyMinutesAgo = new Date(now.getTime() - 1800000);

      // Start timer with custom timestamp
      const startedTimer = await client.timer.start({
        projectId: testConfig.projectId,
        startDateTime: oneHourAgo.toISOString(),
      });
      expect(startedTimer.status).toBe('running');

      // Pause with custom timestamp
      const pausedTimer = await client.timer.pause({
        startDateTime: thirtyMinutesAgo.toISOString(),
      });
      expect(pausedTimer.status).toBe('paused');

      // Resume with custom timestamp
      const resumedTimer = await client.timer.resume({
        endDateTime: now.toISOString(),
      });
      expect(resumedTimer.status).toBe('running');

      // Stop with custom timestamp
      const stoppedTimer = await client.timer.stop({
        endDateTime: now.toISOString(),
      });
      expect(stoppedTimer.status).toBe('stopped');
    });
  });

  describe('Error handling', () => {
    it('should handle starting timer without project ID', async () => {
      if (!testConfig.apiKey) {
        console.log('Skipping test: Real API key not provided');
        return;
      }

      await expect(client.timer.start({} as TimerStartRequest)).rejects.toThrow();
    });

    it('should handle pausing when timer is not running', async () => {
      if (!testConfig.apiKey) {
        console.log('Skipping test: Real API key not provided');
        return;
      }

      // First ensure timer is stopped
      const currentTimer = await client.timer.get();
      if (currentTimer.status === 'running' || currentTimer.status === 'paused') {
        await client.timer.stop();
      }

      // Now try to pause
      await expect(client.timer.pause()).rejects.toThrow();
    });

    it('should handle resuming when timer is not paused', async () => {
      if (!testConfig.apiKey) {
        console.log('Skipping test: Real API key not provided');
        return;
      }

      // Ensure timer is stopped
      const currentTimer = await client.timer.get();
      if (currentTimer.status !== 'stopped') {
        await client.timer.stop();
      }

      // Try to resume when stopped
      await expect(client.timer.resume()).rejects.toThrow();
    });

    it('should handle updating timer with invalid data', async () => {
      if (!testConfig.apiKey) {
        console.log('Skipping test: Real API key not provided');
        return;
      }

      await expect(
        client.timer.update({
          startDateTime: 'invalid-date',
        }),
      ).rejects.toThrow();
    });
  });
});
