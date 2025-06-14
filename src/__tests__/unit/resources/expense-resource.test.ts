import { ExpenseResource } from '../../../resources/ExpenseResource';
import { ApiClient } from '../../../http/ApiClient';
import { NavigablePage } from '../../../models/Page';
import { Expense } from '../../../models/Expense';

// Mock ApiClient
jest.mock('../../../http/ApiClient');

describe('ExpenseResource', () => {
  let expenseResource: ExpenseResource;
  let mockClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ApiClient>;

    expenseResource = new ExpenseResource(mockClient);
  });

  describe('list', () => {
    it('should list expenses', async () => {
      const mockExpenses: Expense[] = [
        {
          id: '1',
          description: 'Office supplies',
          amount: 150.50,
          dateTime: '2023-01-15T00:00:00Z',
          refunded: false,
          created: 1673740800000,
          lastUpdate: 1673740800000,
        },
      ];

      const mockResponse = {
        items: mockExpenses,
        params: { page: 1, limit: 25, count: 1 },
      };

      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await expenseResource.list();

      expect(mockClient.get).toHaveBeenCalledWith('/expenses', undefined);
      expect(result).toBeInstanceOf(NavigablePage);
      expect(result.items).toEqual(mockExpenses);
    });

    it('should list expenses with filters', async () => {
      const params = {
        taskId: 'task-100',
        startDate: '2023-01-01',
        endDate: '2023-01-31',
        filter: 'approved',
      };

      const mockResponse = {
        items: [],
        params: { ...params, page: 1, limit: 25, count: 0 },
      };

      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await expenseResource.list(params);

      expect(mockClient.get).toHaveBeenCalledWith('/expenses', params);
    });
  });

  describe('get', () => {
    it('should get an expense by id', async () => {
      const mockExpense: Expense = {
        id: '1',
        description: 'Client dinner',
        amount: 250.00,
        dateTime: '2023-01-20T00:00:00Z',
        refunded: false,
        fileUri: 'https://example.com/receipts/1.pdf',
        fileName: 'receipt-1.pdf',
        created: 1674172800000,
        lastUpdate: 1674302400000,
      };

      mockClient.get.mockResolvedValueOnce(mockExpense);

      const result = await expenseResource.get('1');

      expect(mockClient.get).toHaveBeenCalledWith('/expenses/1');
      expect(result).toEqual(mockExpense);
    });
  });

  describe('create', () => {
    it('should create a new expense', async () => {
      const newExpenseData = {
        taskId: 'task-100',
        description: 'Software license',
        amount: 99.99,
        dateTime: '2023-01-25T00:00:00Z',
        refunded: false,
      };

      const mockCreatedExpense: Expense = {
        id: '2',
        description: 'Software license',
        amount: 99.99,
        dateTime: '2023-01-25T00:00:00Z',
        refunded: false,
        created: 1674604800000,
        lastUpdate: 1674604800000,
      };

      mockClient.post.mockResolvedValueOnce(mockCreatedExpense);

      const result = await expenseResource.create(newExpenseData);

      expect(mockClient.post).toHaveBeenCalledWith('/expenses', newExpenseData);
      expect(result).toEqual(mockCreatedExpense);
    });
  });

  describe('update', () => {
    it('should update an existing expense', async () => {
      const expenseId = '1';
      const updateData = {
        description: 'Updated office supplies',
        amount: 175.00,
      };

      const mockUpdatedExpense: Expense = {
        id: expenseId,
        description: 'Updated office supplies',
        amount: 175.00,
        dateTime: '2023-01-15T00:00:00Z',
        refunded: false,
        created: 1673740800000,
        lastUpdate: 1674604800000,
      };

      mockClient.put.mockResolvedValueOnce(mockUpdatedExpense);

      const result = await expenseResource.update(expenseId, updateData);

      expect(mockClient.put).toHaveBeenCalledWith('/expenses/1', updateData);
      expect(result).toEqual(mockUpdatedExpense);
    });
  });

  describe('delete', () => {
    it('should delete an expense', async () => {
      const expenseId = '1';
      mockClient.delete.mockResolvedValueOnce(undefined);

      await expenseResource.delete(expenseId);

      expect(mockClient.delete).toHaveBeenCalledWith('/expenses/1');
    });
  });

  describe('approve', () => {
    it('should approve an expense', async () => {
      const expenseId = '1';
      const mockApprovedExpense: Expense = {
        id: expenseId,
        description: 'Office supplies',
        amount: 150.50,
        dateTime: '2023-01-15T00:00:00Z',
        refunded: false,
        created: 1673740800000,
        lastUpdate: 1674734400000,
      };

      mockClient.put.mockResolvedValueOnce(mockApprovedExpense);

      const result = await expenseResource.approve(expenseId);

      expect(mockClient.put).toHaveBeenCalledWith('/expenses/1/approve', {});
      expect(result).toEqual(mockApprovedExpense);
    });
  });

  describe('reject', () => {
    it('should reject an expense', async () => {
      const expenseId = '1';
      const reason = 'Missing receipt';
      const mockRejectedExpense: Expense = {
        id: expenseId,
        description: 'Office supplies',
        amount: 150.50,
        dateTime: '2023-01-15T00:00:00Z',
        refunded: false,
        created: 1673740800000,
        lastUpdate: 1674734400000,
      };

      mockClient.put.mockResolvedValueOnce(mockRejectedExpense);

      const result = await expenseResource.reject(expenseId, reason);

      expect(mockClient.put).toHaveBeenCalledWith('/expenses/1/reject', { reason });
      expect(result).toEqual(mockRejectedExpense);
    });
  });

  describe('getByProject', () => {
    it('should get expenses by project id', async () => {
      const projectId = '100';
      const mockExpenses: Expense[] = [
        {
          id: '1',
          description: 'Project expense 1',
          amount: 100.00,
          dateTime: '2023-01-10T00:00:00Z',
          refunded: false,
          created: 1673308800000,
          lastUpdate: 1673308800000,
        },
      ];

      const mockResponse = {
        items: mockExpenses,
        params: { page: 1, limit: 25, count: 1 },
      };

      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await expenseResource.getByProject(projectId);

      expect(mockClient.get).toHaveBeenCalledWith('/projects/100/expenses', undefined);
      expect(result).toBeInstanceOf(NavigablePage);
      expect(result.items).toEqual(mockExpenses);
    });

    it('should get expenses by project id with params', async () => {
      const projectId = '100';
      const params = { filter: 'pending' };

      const mockResponse = {
        items: [],
        params: { ...params, page: 1, limit: 25, count: 0 },
      };

      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await expenseResource.getByProject(projectId, params);

      expect(mockClient.get).toHaveBeenCalledWith('/projects/100/expenses', params);
    });
  });
});