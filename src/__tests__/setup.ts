import dotenv from 'dotenv';
import path from 'path';
import { TimesheetClient } from '../index';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Check if we're in CI environment
const isCI = process.env['CI'] === 'true' || process.env['NODE_ENV'] === 'test';

// Export test configuration
export const testConfig = {
  apiKey: process.env['TIMESHEET_API_KEY'],
  baseUrl: process.env['TIMESHEET_API_BASE_URL'] || 'https://api.timesheet.io/v1',
  projectId: process.env['TEST_PROJECT_ID'],
  teamId: process.env['TEST_TEAM_ID'],
  organizationId: process.env['TEST_ORGANIZATION_ID'],
  skipIntegrationTests:
    process.env['SKIP_INTEGRATION_TESTS'] === 'true' || (!process.env['TIMESHEET_API_KEY'] && isCI),
};

// Export configured test client
export function createTestClient(): TimesheetClient {
  if (!testConfig.apiKey) {
    throw new Error(
      'TIMESHEET_API_KEY is required for integration tests. Please set it in your .env file.',
    );
  }

  return new TimesheetClient({
    apiKey: testConfig.apiKey,
    baseUrl: testConfig.baseUrl,
  });
}

// Test data generators
export const testData = {
  generateTaskDescription: (): string => `Test task ${Date.now()}`,
  generateProjectTitle: (): string => `Test project ${Date.now()}`,
  generateTeamName: (): string => `Test team ${Date.now()}`,
  generateTagName: (): string => `Test tag ${Date.now()}`,
  generateRateTitle: (): string => `Test rate ${Date.now()}`,
  generateWebhookUrl: (): string => `https://example.com/webhook/${Date.now()}`,
};

// Utility to skip tests if API key is not available
export const skipIfNoApiKey = (): boolean => {
  if (!testConfig.apiKey) {
    console.log(
      '⚠️  Skipping integration tests: TIMESHEET_API_KEY not set. Create a .env file with your API key to run integration tests.',
    );
    return true;
  }
  return false;
};

// Global test setup
beforeAll(() => {
  if (testConfig.skipIntegrationTests) {
    console.log('🚫 Integration tests are configured to be skipped');
  } else if (testConfig.apiKey) {
    console.log('✅ Integration tests will run with configured API key');
  }
});

// Global test teardown
afterAll(async () => {
  // Add any global cleanup here if needed
  await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay to allow cleanup
});
