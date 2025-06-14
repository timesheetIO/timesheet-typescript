import { createTestClient, skipIfNoApiKey, testConfig, testData } from '../setup';
import { TimesheetClient } from '../../index';

describe('Teams Resource Integration Tests', () => {
  let client: TimesheetClient;
  let createdTeamId: string | undefined;

  beforeAll(() => {
    if (skipIfNoApiKey()) return;
    client = createTestClient();
  });

  afterAll(async () => {
    // Clean up created team
    if (createdTeamId) {
      try {
        await client.teams.delete(createdTeamId);
      } catch (error) {
        console.error('Failed to clean up team:', error);
      }
    }
  });

  if (!testConfig.apiKey) {
    test('API key not configured - skipping integration tests', () => {
      console.log('ℹ️  To run integration tests, set TIMESHEET_API_KEY in your .env file');
      expect(true).toBe(true);
    });
    return;
  }

  describe('Teams CRUD Operations', () => {
    test('should create a new team', async () => {
      const teamData = {
        name: testData.generateTeamName(),
        description: 'Integration test team',
        color: 16737131, // Integer representation of color
        projectSalaryVisibility: 1,
        organizationId: testConfig.organizationId,
      };

      const team = await client.teams.create(teamData);

      expect(team).toBeDefined();
      expect(team.id).toBeDefined();
      expect(team.name).toBe(teamData.name);
      expect(team.description).toBe(teamData.description);
      expect(team.color).toBe(teamData.color);

      createdTeamId = team.id;
    });

    test('should list teams', async () => {
      const response = await client.teams.list({
        limit: 10,
        page: 1,
        sort: 'created',
        order: 'desc',
      });

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
      expect(response.params.count).toBeGreaterThanOrEqual(0);
      expect(response.params.page).toBe(1);
      expect(response.params.limit).toBe(10);

      if (response.items.length > 0) {
        const team = response.items[0];
        expect(team?.id).toBeDefined();
        expect(team?.name).toBeDefined();
      }
    });

    test('should get a specific team', async () => {
      if (!createdTeamId) {
        console.warn('Skipping get team test - no team created');
        return;
      }

      const team = await client.teams.get(createdTeamId);

      expect(team).toBeDefined();
      expect(team.id).toBe(createdTeamId);
      expect(team.name).toBeDefined();
      expect(team.description).toBeDefined();
    });

    test('should update a team', async () => {
      if (!createdTeamId) {
        console.warn('Skipping update team test - no team created');
        return;
      }

      const updateData = {
        name: 'Updated Team Name',
        description: 'Updated team description',
        color: 16711680, // Red color
      };

      const updatedTeam = await client.teams.update(createdTeamId, updateData);

      expect(updatedTeam).toBeDefined();
      expect(updatedTeam.id).toBe(createdTeamId);
      expect(updatedTeam.name).toBe(updateData.name);
      expect(updatedTeam.description).toBe(updateData.description);
      expect(updatedTeam.color).toBe(updateData.color);
    });

    test('should search teams', async () => {
      const searchParams = {
        search: 'test',
        limit: 20,
        page: 1,
        count: 0,
      };

      const response = await client.teams.search(searchParams);

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
    });
  });

  describe('Team Member Operations', () => {
    test('should list team members', async () => {
      if (!testConfig.teamId) {
        console.warn('Skipping team members test - TEST_TEAM_ID not set');
        return;
      }

      const response = await client.teams.listMembers(testConfig.teamId, {
        limit: 10,
        page: 1,
        count: 0,
      });

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
    });

    test('should get colleagues', async () => {
      const response = await client.teams.getColleagues({
        limit: 10,
        page: 1,
        count: 0,
      });

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle getting non-existent team', async () => {
      await expect(client.teams.get('non-existent-team-id')).rejects.toThrow();
    });

    test('should handle creating team with invalid data', async () => {
      await expect(
        client.teams.create({
          name: '', // Empty name should fail validation
          color: -1, // Invalid color
        }),
      ).rejects.toThrow();
    });

    test('should handle updating non-existent team', async () => {
      await expect(
        client.teams.update('non-existent-team-id', {
          name: 'This should fail',
        }),
      ).rejects.toThrow();
    });
  });
});
