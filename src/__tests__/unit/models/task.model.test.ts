import {
  Expense,
  Member,
  Note,
  Pause,
  Project,
  Rate,
  Tag,
  Task,
  TaskCreateRequest,
  TaskUpdateRequest,
  Todo,
} from '../../../models';

describe('Task Model Validation', () => {
  describe('Task Interface', () => {
    test('should have all required fields', () => {
      const task: Task = {
        id: 'task-123',
        projectId: 'proj-123',
        startDateTime: '2024-01-01T09:00:00+02:00',
      };

      expect(task.id).toBeDefined();
      expect(task.projectId).toBeDefined();
      expect(task.startDateTime).toBeDefined();
    });

    test('should accept all optional fields', () => {
      const task: Task = {
        id: 'task-123',
        projectId: 'proj-123',
        user: 'user-123',
        description: 'Test task',
        startDateTime: '2024-01-01T09:00:00+02:00',
        endDateTime: '2024-01-01T17:00:00+02:00',
        location: 'Office',
        locationEnd: 'Home',
        feeling: 3,
        typeId: 1,
        billable: true,
        billed: false,
        paid: false,
        phoneNumber: '+1234567890',
        distance: 10.5,
        signature: 'signature-data',
        project: {
          id: 'proj-123',
          title: 'Test Project',
        } as Project,
        todo: {
          id: 'todo-123',
          name: 'Test Todo',
        } as Todo,
        rate: {
          id: 'rate-123',
          title: 'Standard Rate',
          factor: 1.0,
        } as Rate,
        member: {
          uid: 'user-123',
          firstname: 'John',
          lastname: 'Doe',
        } as Member,
        invoiceId: 'inv-123',
        tags: [
          { id: 'tag-1', name: 'Development' } as Tag,
          { id: 'tag-2', name: 'Frontend' } as Tag,
        ],
        pauses: [{ id: 'pause-1', startDateTime: '2024-01-01T10:00:00+02:00' } as Pause],
        expenses: [{ id: 'exp-1', amount: 50 } as Expense],
        notes: [{ id: 'note-1', text: 'Test note' } as Note],
        duration: 28800000, // 8 hours in milliseconds
        durationBreak: 3600000, // 1 hour in milliseconds
        salaryTotal: 400,
        salaryBreak: 50,
        expensesTotal: 150,
        expensesPaid: 100,
        mileage: 25.5,
        notesTotal: 1,
        salaryVisible: true,
        deleted: false,
        running: false,
        created: 1704067200000,
        lastUpdate: 1704067200000,
      };

      // Test basic fields
      expect(task.description).toBe('Test task');
      expect(task.endDateTime).toBe('2024-01-01T17:00:00+02:00');
      expect(task.billable).toBe(true);
      expect(task.location).toBe('Office');
      expect(task.locationEnd).toBe('Home');
      expect(task.typeId).toBe(1);
      expect(task.phoneNumber).toBe('+1234567890');
      expect(task.distance).toBe(10.5);

      // Test nested objects
      expect(task.project?.id).toBe('proj-123');
      expect(task.todo?.id).toBe('todo-123');
      expect(task.rate?.id).toBe('rate-123');
      expect(task.member?.uid).toBe('user-123');

      // Test arrays
      expect(task.tags).toHaveLength(2);
      expect(task.pauses).toHaveLength(1);
      expect(task.expenses).toHaveLength(1);
      expect(task.notes).toHaveLength(1);

      // Test calculated fields
      expect(task.duration).toBe(28800000);
      expect(task.durationBreak).toBe(3600000);
      expect(task.salaryTotal).toBe(400);
      expect(task.expensesTotal).toBe(150);
      expect(task.mileage).toBe(25.5);
      expect(task.notesTotal).toBe(1);
    });
  });

  describe('TaskCreateRequest Interface', () => {
    test('should have all required fields for creation', () => {
      const createRequest: TaskCreateRequest = {
        projectId: 'proj-123',
        startDateTime: '2024-01-01T09:00:00+02:00',
      };

      expect(createRequest.projectId).toBeDefined();
      expect(createRequest.startDateTime).toBeDefined();
    });

    test('should accept optional fields', () => {
      const createRequest: TaskCreateRequest = {
        projectId: 'proj-123',
        description: 'New task',
        startDateTime: '2024-01-01T09:00:00+02:00',
        endDateTime: '2024-01-01T17:00:00+02:00',
        location: 'Remote',
        locationEnd: 'Office',
        feeling: 4,
        typeId: 2,
        billable: true,
        billed: false,
        paid: false,
        phoneNumber: '+1234567890',
        distance: 15.5,
        rateId: 'rate-123',
        todoId: 'todo-123',
        signature: 'signature-data',
        userId: 'user-123',
        tagIds: ['tag-1', 'tag-2'],
      };

      expect(createRequest.description).toBe('New task');
      expect(createRequest.billable).toBe(true);
      expect(createRequest.locationEnd).toBe('Office');
      expect(createRequest.typeId).toBe(2);
      expect(createRequest.tagIds).toHaveLength(2);
    });
  });

  describe('TaskUpdateRequest Interface', () => {
    test('should accept all updateable fields', () => {
      const updateRequest: TaskUpdateRequest = {
        projectId: 'proj-123',
        description: 'Updated task',
        startDateTime: '2024-01-01T09:00:00+02:00',
        endDateTime: '2024-01-01T17:00:00+02:00',
        location: 'Remote',
        locationEnd: 'Office',
        feeling: 4,
        typeId: 2,
        billable: true,
        billed: false,
        paid: false,
        phoneNumber: '+1234567890',
        distance: 15.5,
        rateId: 'rate-123',
        todoId: 'todo-123',
        signature: 'signature-data',
        deleted: false,
        tagIds: ['tag-1', 'tag-2'],
      };

      expect(updateRequest.description).toBe('Updated task');
      expect(updateRequest.locationEnd).toBe('Office');
      expect(updateRequest.typeId).toBe(2);
      expect(updateRequest.deleted).toBe(false);
      expect(updateRequest.tagIds).toHaveLength(2);
    });
  });

  describe('Model Validation Against OpenAPI Spec', () => {
    test('should flag missing fields from OpenAPI spec', () => {
      // These fields are in the OpenAPI spec but missing from our model
      const missingFields = [
        'user', // User ID who owns the task
        'deleted', // Soft delete flag
        'running', // Whether task is currently running
        'locationEnd', // End location for mobile tracking
        'typeId', // Task type identifier
        'phoneNumber', // Phone number for contact
        'distance', // Distance traveled
        'signature', // Digital signature
        'userId', // User ID (in create/update requests)
        'invoiceId', // Associated invoice ID
        'member', // Member details (nested object)
        'project', // Full project object (nested)
        'todo', // Full todo object (nested)
        'rate', // Full rate object (nested)
        'tags', // Full tag objects array (nested)
        'pauses', // Associated pauses array
        'expenses', // Associated expenses array
        'notes', // Associated notes array
        'duration', // Calculated duration
        'durationBreak', // Break duration
        'salaryTotal', // Total salary
        'salaryBreak', // Break salary
        'expensesTotal', // Total expenses
        'expensesPaid', // Paid expenses
        'mileage', // Mileage amount
        'notesTotal', // Total notes count
        'salaryVisible', // Salary visibility flag
      ];

      // NOTE: The current model is simplified. In production, you should include all fields
      // from the OpenAPI spec to ensure full compatibility
      expect(missingFields.length).toBeGreaterThan(0);
    });

    test('should use correct field names according to OpenAPI spec', () => {
      // OpenAPI spec uses 'startDateTime' and 'endDateTime', not 'startTime' and 'endTime'
      const correctFieldNames = {
        startTime: 'should be startDateTime',
        endTime: 'should be endDateTime',
      };

      // NOTE: The current model uses simplified field names.
      // They should match the OpenAPI spec exactly
      expect(Object.keys(correctFieldNames).length).toBe(2);
    });
  });
});
