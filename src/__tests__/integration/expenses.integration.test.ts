import { createTestClient, skipIfNoApiKey, testConfig, testData } from '../setup';
import { TimesheetClient } from '../../index';

describe('Expenses Resource Integration Tests', () => {
  let client: TimesheetClient;
  let createdExpenseId: string | undefined;
  let createdProjectId: string | undefined;
  let createdTaskId: string | undefined;

  beforeAll(async () => {
    if (skipIfNoApiKey()) return;
    client = createTestClient();

    // Create a test project for expenses
    const projectData = {
      title: testData.generateProjectTitle(),
      description: 'Test project for expenses',
      teamId: testConfig.teamId,
    };
    const project = await client.projects.create(projectData);
    createdProjectId = project.id;

    // Create a test task for expenses (required for ExpenseCreateRequest)
    const taskData = {
      projectId: createdProjectId,
      description: 'Test task for expenses',
      startDateTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      endDateTime: new Date().toISOString(),
      billable: true,
      typeId: 1,
    };
    const task = await client.tasks.create(taskData);
    createdTaskId = task.id;
  });

  afterAll(async () => {
    // Clean up created expense, task, and project
    if (createdExpenseId) {
      try {
        await client.expenses.delete(createdExpenseId);
      } catch (error) {
        console.error('Failed to clean up expense:', error);
      }
    }
    if (createdTaskId) {
      try {
        await client.tasks.delete(createdTaskId);
      } catch (error) {
        console.error('Failed to clean up task:', error);
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

  if (!testConfig.apiKey) {
    test('API key not configured - skipping integration tests', () => {
      console.log('ℹ️  To run integration tests, set TIMESHEET_API_KEY in your .env file');
      expect(true).toBe(true);
    });
    return;
  }

  describe('Expenses CRUD Operations', () => {
    test('should create a new expense', async () => {
      if (!createdTaskId) {
        console.warn('Skipping create expense test - no task created');
        return;
      }

      const expenseData = {
        description: 'Test expense',
        amount: 25.5,
        dateTime: new Date().toISOString(),
        refunded: false,
        taskId: createdTaskId,
      };

      const expense = await client.expenses.create(expenseData);

      expect(expense).toBeDefined();
      expect(expense.id).toBeDefined();
      expect(expense.description).toBe(expenseData.description);
      expect(expense.amount).toBe(expenseData.amount);

      createdExpenseId = expense.id;
    });

    test('should list expenses', async () => {
      const response = await client.expenses.list({
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
        const expense = response.items[0];
        expect(expense?.id).toBeDefined();
        expect(expense?.description).toBeDefined();
      }
    });

    test('should get a specific expense', async () => {
      if (!createdExpenseId) {
        console.warn('Skipping get expense test - no expense created');
        return;
      }

      const expense = await client.expenses.get(createdExpenseId);

      expect(expense).toBeDefined();
      expect(expense.id).toBe(createdExpenseId);
      expect(expense.description).toBeDefined();
      expect(expense.amount).toBeDefined();
    });

    test('should update an expense', async () => {
      if (!createdExpenseId) {
        console.warn('Skipping update expense test - no expense created');
        return;
      }

      const updateData = {
        description: 'Updated test expense',
        amount: 35.75,
        refunded: true,
      };

      const updatedExpense = await client.expenses.update(createdExpenseId, updateData);

      expect(updatedExpense).toBeDefined();
      expect(updatedExpense.id).toBe(createdExpenseId);
      expect(updatedExpense.description).toBe(updateData.description);
      expect(updatedExpense.amount).toBe(updateData.amount);
      expect(updatedExpense.refunded).toBe(true);
    });

    test('should search expenses', async () => {
      const searchParams = {
        search: 'test',
        limit: 20,
        page: 1,
        count: 0,
      };

      const response = await client.expenses.search(searchParams);

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle getting non-existent expense', async () => {
      await expect(client.expenses.get('non-existent-expense-id')).rejects.toThrow();
    });

    test('should handle creating expense with invalid data', async () => {
      if (!createdTaskId) {
        console.warn('Skipping invalid expense test - no task created');
        return;
      }

      await expect(
        client.expenses.create({
          description: '',
          amount: -10, // Negative amount
          dateTime: 'invalid-date', // Invalid date format
          taskId: createdTaskId,
        }),
      ).rejects.toThrow();
    });

    test('should handle updating non-existent expense', async () => {
      await expect(
        client.expenses.update('non-existent-expense-id', {
          description: 'This should fail',
        }),
      ).rejects.toThrow();
    });
  });
});
