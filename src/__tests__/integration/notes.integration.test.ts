import { createTestClient, skipIfNoApiKey, testConfig, testData } from '../setup';
import type { TimesheetClient } from '../../index';

describe('Notes Resource Integration Tests', () => {
  let client: TimesheetClient;
  let createdNoteId: string | undefined;
  let createdProjectId: string | undefined;
  let createdTaskId: string | undefined;

  beforeAll(async () => {
    if (skipIfNoApiKey()) return;
    client = createTestClient();

    // Create a test project for notes
    const projectData = {
      title: testData.generateProjectTitle(),
      description: 'Test project for notes',
      teamId: testConfig.teamId,
    };
    const project = await client.projects.create(projectData);
    createdProjectId = project.id;

    // Create a test task for notes (required for NoteCreateRequest)
    const taskData = {
      projectId: createdProjectId,
      description: 'Test task for notes',
      startDateTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      endDateTime: new Date().toISOString(),
      billable: true,
      typeId: 1,
    };
    const task = await client.tasks.create(taskData);
    createdTaskId = task.id;
  });

  afterAll(async () => {
    // Clean up created note, task, and project
    if (createdNoteId) {
      try {
        await client.notes.delete(createdNoteId);
      } catch (error) {
        console.error('Failed to clean up note:', error);
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

  describe('Notes CRUD Operations', () => {
    test('should create a new note', async () => {
      if (!createdTaskId) {
        console.warn('Skipping create note test - no task created');
        return;
      }

      const noteData = {
        text: 'Test note content',
        dateTime: new Date().toISOString(),
        taskId: createdTaskId,
      };

      const note = await client.notes.create(noteData);

      expect(note).toBeDefined();
      expect(note.id).toBeDefined();
      expect(note.text).toBe(noteData.text);

      createdNoteId = note.id;
    });

    test('should list notes', async () => {
      const response = await client.notes.list({
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
        const note = response.items[0];
        expect(note?.id).toBeDefined();
        expect(note?.text).toBeDefined();
      }
    });

    test('should get a specific note', async () => {
      if (!createdNoteId) {
        console.warn('Skipping get note test - no note created');
        return;
      }

      const note = await client.notes.get(createdNoteId);

      expect(note).toBeDefined();
      expect(note.id).toBe(createdNoteId);
      expect(note.text).toBeDefined();
    });

    test('should update a note', async () => {
      if (!createdNoteId) {
        console.warn('Skipping update note test - no note created');
        return;
      }

      const updateData = {
        text: 'Updated test note content',
        dateTime: new Date().toISOString(),
      };

      const updatedNote = await client.notes.update(createdNoteId, updateData);

      expect(updatedNote).toBeDefined();
      expect(updatedNote.id).toBe(createdNoteId);
      expect(updatedNote.text).toBe(updateData.text);
    });

    test('should search notes', async () => {
      const searchParams = {
        search: 'test',
        limit: 20,
        page: 1,
        count: 0,
      };

      const response = await client.notes.search(searchParams);

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle getting non-existent note', async () => {
      await expect(client.notes.get('non-existent-note-id')).rejects.toThrow();
    });

    test('should handle creating note with invalid data', async () => {
      if (!createdTaskId) {
        console.warn('Skipping invalid note test - no task created');
        return;
      }

      await expect(
        client.notes.create({
          text: '', // Empty text
          dateTime: 'invalid-date',
          taskId: createdTaskId,
        }),
      ).rejects.toThrow();
    });

    test('should handle updating non-existent note', async () => {
      await expect(
        client.notes.update('non-existent-note-id', {
          text: 'This should fail',
          dateTime: new Date().toISOString(),
        }),
      ).rejects.toThrow();
    });
  });
});
