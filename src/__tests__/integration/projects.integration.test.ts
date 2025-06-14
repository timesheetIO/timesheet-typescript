import { createTestClient, describeIntegration, testConfig, testData } from '../setup';
import type { TimesheetClient } from '../../index';

describeIntegration('Projects Resource Integration Tests', () => {
  let client: TimesheetClient;
  let createdProjectId: string | undefined;

  beforeAll(() => {
    
    client = createTestClient();
  });

  afterAll(async () => {
    // Clean up created project
    if (createdProjectId && client) {
      try {
        await client.projects.delete(createdProjectId);
      } catch (error) {
        console.error('Failed to clean up project:', error);
      }
    }
  });

  describe('Projects CRUD Operations', () => {
    test('should create a new project', async () => {
      const projectData = {
        title: testData.generateProjectTitle(),
        description: 'Integration test project',
        employer: 'Test Company',
        color: 16737131, // Integer representation of color (was '#FF6B6B')
        taskDefaultBillable: true,
        teamId: testConfig.teamId,
      };

      const project = await client.projects.create(projectData);

      expect(project).toBeDefined();
      expect(project.id).toBeDefined();
      expect(project.title).toBe(projectData.title);
      expect(project.description).toBe(projectData.description);
      expect(project.employer).toBe(projectData.employer);
      expect(project.taskDefaultBillable).toBe(true);

      createdProjectId = project.id;
    });

    test('should list projects', async () => {
      const response = await client.projects.list({
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
        const project = response.items[0];
        expect(project?.id).toBeDefined();
        expect(project?.title).toBeDefined();
      }
    });

    test('should get a specific project', async () => {
      if (!createdProjectId) {
        console.warn('Skipping get project test - no project created');
        return;
      }

      const project = await client.projects.get(createdProjectId);

      expect(project).toBeDefined();
      expect(project.id).toBe(createdProjectId);
      expect(project.title).toBeDefined();
      expect(project.description).toBeDefined();
    });

    test('should update a project', async () => {
      if (!createdProjectId) {
        console.warn('Skipping update project test - no project created');
        return;
      }

      const updateData = {
        description: 'Updated integration test project',
        employer: 'Updated Test Company',
        defaultBillable: false,
      };

      const updatedProject = await client.projects.update(createdProjectId, updateData);

      expect(updatedProject).toBeDefined();
      expect(updatedProject.id).toBe(createdProjectId);
      expect(updatedProject.description).toBe(updateData.description);
      expect(updatedProject.employer).toBe(updateData.employer);
      expect(updatedProject.taskDefaultBillable).toBe(false);
    });

    test('should search projects', async () => {
      const searchParams = {
        search: 'test',
        limit: 20,
        page: 1,
        teamId: testConfig.teamId,
        count: 0,
      };

      const response = await client.projects.search(searchParams);

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
    });
  });

  describe('Projects with Team Association', () => {
    test('should filter projects by team', async () => {
      if (!testConfig.teamId) {
        console.warn('Skipping team filter test - TEST_TEAM_ID not set');
        return;
      }

      const response = await client.projects.list({
        teamId: testConfig.teamId,
        limit: 10,
      });

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();

      // All projects should belong to the specified team
      response.items.forEach((project) => {
        if (project?.team?.id) {
          expect(project.team?.id).toBe(testConfig.teamId);
        }
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle getting non-existent project', async () => {
      await expect(client.projects.get('non-existent-project-id')).rejects.toThrow();
    });

    test('should handle creating project with invalid data', async () => {
      await expect(
        client.projects.create({
          title: '', // Empty title should fail validation
          description: 'Invalid project',
        }),
      ).rejects.toThrow();
    });

    test('should handle updating non-existent project', async () => {
      await expect(
        client.projects.update('non-existent-project-id', {
          description: 'This should fail',
        }),
      ).rejects.toThrow();
    });
  });
});
