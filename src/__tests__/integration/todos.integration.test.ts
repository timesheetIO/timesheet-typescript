import { createTestClient, describeIntegration, testConfig, testData } from '../setup';
import type { TimesheetClient } from '../../index';

describeIntegration('Todos Resource Integration Tests', () => {
  let client: TimesheetClient;
  let createdTodoId: string | undefined;
  let createdProjectId: string | undefined;

  beforeAll(async () => {
    
    client = createTestClient();

    // Create a test project for todos
    const projectData = {
      title: testData.generateProjectTitle(),
      description: 'Test project for todos',
      teamId: testConfig.teamId,
    };
    const project = await client.projects.create(projectData);
    createdProjectId = project.id;
  });

  afterAll(async () => {
    // Clean up created todo and project
    if (createdTodoId) {
      try {
        await client.todos.delete(createdTodoId);
      } catch (error) {
        console.error('Failed to clean up todo:', error);
      }
    }
    if (createdProjectId) {
      try {
        await client.projects.delete(createdProjectId);
      } catch (error) {
        console.error('Failed to clean up project:', error);
      }
    }
  });

  describe('Todos CRUD Operations', () => {
    test('should create a new todo', async () => {
      if (!createdProjectId) {
        console.warn('Skipping create todo test - no project created');
        return;
      }

      const todoData = {
        name: 'Test Todo',
        description: 'Integration test todo',
        projectId: createdProjectId,
        dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        estimatedHours: 2,
      };

      const todo = await client.todos.create(todoData);

      expect(todo).toBeDefined();
      expect(todo.id).toBeDefined();
      expect(todo.name).toBe(todoData.name);
      expect(todo.description).toBe(todoData.description);

      createdTodoId = todo.id;
    });

    test('should list todos', async () => {
      const response = await client.todos.list({
        limit: 10,
        page: 1,
        sort: 'created',
        order: 'desc',
      });

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
      expect(response.params.count).toBeGreaterThanOrEqual(0);

      if (response.items.length > 0) {
        const todo = response.items[0];
        expect(todo?.id).toBeDefined();
        expect(todo?.name).toBeDefined();
      }
    });

    test('should get a specific todo', async () => {
      if (!createdTodoId) {
        console.warn('Skipping get todo test - no todo created');
        return;
      }

      const todo = await client.todos.get(createdTodoId);

      expect(todo).toBeDefined();
      expect(todo.id).toBe(createdTodoId);
      expect(todo.name).toBeDefined();
      expect(todo.description).toBeDefined();
    });

    test('should update a todo', async () => {
      if (!createdTodoId) {
        console.warn('Skipping update todo test - no todo created');
        return;
      }

      const updateData = {
        name: 'Updated Test Todo',
        description: 'Updated integration test todo',
        status: 'closed' as const,
      };

      const updatedTodo = await client.todos.update(createdTodoId, updateData);

      expect(updatedTodo).toBeDefined();
      expect(updatedTodo.id).toBe(createdTodoId);
      expect(updatedTodo.name).toBe(updateData.name);
      expect(updatedTodo.description).toBe(updateData.description);
      expect(updatedTodo.status).toBe('closed');
    });

    test('should search todos', async () => {
      const searchParams = {
        search: 'test',
        limit: 20,
        page: 1,
        count: 0,
      };

      const response = await client.todos.search(searchParams);

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle getting non-existent todo', async () => {
      await expect(client.todos.get('non-existent-todo-id')).rejects.toThrow();
    });

    test('should handle creating todo with invalid data', async () => {
      await expect(
        client.todos.create({
          name: '', // Empty name
          projectId: 'non-existent-project-id',
        }),
      ).rejects.toThrow();
    });

    test('should handle updating non-existent todo', async () => {
      await expect(
        client.todos.update('non-existent-todo-id', {
          name: 'This should fail',
        }),
      ).rejects.toThrow();
    });
  });
});
