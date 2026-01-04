import { ApiClient } from '../../../http/ApiClient';
import {
  DocumentReportResource,
  TaskReportResource,
  ExpenseReportResource,
  NoteReportResource,
  ExportResource,
  ReportsClient,
} from '../../../resources/reports';
import type {
  DocumentReport,
  TaskReportItem,
  ExpenseReportItem,
  NoteReportItem,
  ExportParams,
  FileResponse,
  ExportTemplate,
  ExportFieldsResponse,
  ExportReportsResponse,
  CustomExportField,
  Page,
} from '../../../models';

// Mock ApiClient
jest.mock('../../../http/ApiClient');

describe('Reports Resources', () => {
  let mockClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
    } as unknown as jest.Mocked<ApiClient>;
  });

  describe('DocumentReportResource', () => {
    let resource: DocumentReportResource;

    beforeEach(() => {
      resource = new DocumentReportResource(mockClient);
    });

    describe('get', () => {
      it('should get document report data', async () => {
        const mockReport: DocumentReport = {
          documentTitle: 'Invoice #001',
          documentDate: '2024-01-15',
          companyName: 'Acme Corp',
          customerName: 'John Doe',
          totalAmount: '€ 1,234.56',
          tasks: [],
        };

        mockClient.get.mockResolvedValueOnce(mockReport);

        const result = await resource.get('doc_123');

        expect(mockClient.get).toHaveBeenCalledWith('/v1/documents/doc_123');
        expect(result).toEqual(mockReport);
      });

      it('should handle special characters in document ID', async () => {
        const mockReport: DocumentReport = { documentTitle: 'Test' };
        mockClient.get.mockResolvedValueOnce(mockReport);

        await resource.get('doc/with/slashes');

        expect(mockClient.get).toHaveBeenCalledWith('/v1/documents/doc%2Fwith%2Fslashes');
      });
    });

    describe('getPdf', () => {
      it('should get document PDF', async () => {
        const mockPdfData = new ArrayBuffer(100);
        mockClient.request.mockResolvedValueOnce(mockPdfData);

        const result = await resource.getPdf('doc_123');

        expect(mockClient.request).toHaveBeenCalledWith({
          method: 'GET',
          url: '/v1/documents/doc_123/pdf',
          responseType: 'arraybuffer',
        });
        expect(result).toBe(mockPdfData);
      });
    });

    describe('getXml', () => {
      it('should get document XML', async () => {
        const mockXml = '<?xml version="1.0"?><DocumentReport></DocumentReport>';
        mockClient.request.mockResolvedValueOnce(mockXml);

        const result = await resource.getXml('doc_123');

        expect(mockClient.request).toHaveBeenCalledWith({
          method: 'GET',
          url: '/v1/documents/doc_123/xml',
          headers: { Accept: 'application/xml' },
        });
        expect(result).toBe(mockXml);
      });
    });
  });

  describe('TaskReportResource', () => {
    let resource: TaskReportResource;

    beforeEach(() => {
      resource = new TaskReportResource(mockClient);
    });

    describe('get', () => {
      it('should get task report data', async () => {
        const mockReport: TaskReportItem = {
          taskId: 'task_123',
          taskDescription: 'Implement feature',
          taskDate: '2024-01-15',
          taskDuration: '8:00 h',
          taskTotal: '€ 600.00',
          projectName: 'Project X',
        };

        mockClient.get.mockResolvedValueOnce(mockReport);

        const result = await resource.get('task_123');

        expect(mockClient.get).toHaveBeenCalledWith('/v1/tasks/task_123');
        expect(result).toEqual(mockReport);
      });
    });

    describe('getPdf', () => {
      it('should get task PDF', async () => {
        const mockPdfData = new ArrayBuffer(50);
        mockClient.request.mockResolvedValueOnce(mockPdfData);

        const result = await resource.getPdf('task_123');

        expect(mockClient.request).toHaveBeenCalledWith({
          method: 'GET',
          url: '/v1/tasks/task_123/pdf',
          responseType: 'arraybuffer',
        });
        expect(result).toBe(mockPdfData);
      });
    });
  });

  describe('ExpenseReportResource', () => {
    let resource: ExpenseReportResource;

    beforeEach(() => {
      resource = new ExpenseReportResource(mockClient);
    });

    describe('get', () => {
      it('should get expense report data', async () => {
        const mockReport: ExpenseReportItem = {
          expenseId: 'exp_123',
          expenseDate: '2024-01-15 12:30',
          expenseAmount: '€ 149.99',
          expenseDescription: 'Software license',
        };

        mockClient.get.mockResolvedValueOnce(mockReport);

        const result = await resource.get('exp_123');

        expect(mockClient.get).toHaveBeenCalledWith('/v1/expenses/exp_123');
        expect(result).toEqual(mockReport);
      });
    });

    describe('getPdf', () => {
      it('should get expense PDF', async () => {
        const mockPdfData = new ArrayBuffer(30);
        mockClient.request.mockResolvedValueOnce(mockPdfData);

        const result = await resource.getPdf('exp_123');

        expect(mockClient.request).toHaveBeenCalledWith({
          method: 'GET',
          url: '/v1/expenses/exp_123/pdf',
          responseType: 'arraybuffer',
        });
        expect(result).toBe(mockPdfData);
      });
    });
  });

  describe('NoteReportResource', () => {
    let resource: NoteReportResource;

    beforeEach(() => {
      resource = new NoteReportResource(mockClient);
    });

    describe('get', () => {
      it('should get note report data', async () => {
        const mockReport: NoteReportItem = {
          noteDate: '2024-01-15 14:30',
          noteContent: 'Meeting notes',
          noteType: 'Meeting',
          noteAuthor: 'John Doe',
        };

        mockClient.get.mockResolvedValueOnce(mockReport);

        const result = await resource.get('note_123');

        expect(mockClient.get).toHaveBeenCalledWith('/v1/notes/note_123');
        expect(result).toEqual(mockReport);
      });
    });

    describe('getPdf', () => {
      it('should get note PDF', async () => {
        const mockPdfData = new ArrayBuffer(25);
        mockClient.request.mockResolvedValueOnce(mockPdfData);

        const result = await resource.getPdf('note_123');

        expect(mockClient.request).toHaveBeenCalledWith({
          method: 'GET',
          url: '/v1/notes/note_123/pdf',
          responseType: 'arraybuffer',
        });
        expect(result).toBe(mockPdfData);
      });
    });
  });

  describe('ExportResource', () => {
    let resource: ExportResource;

    beforeEach(() => {
      resource = new ExportResource(mockClient);
    });

    describe('generate', () => {
      it('should generate export and return file response', async () => {
        const params: ExportParams = {
          report: 1,
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          format: 'xlsx',
        };

        const mockResponse: FileResponse = {
          url: 'https://storage.example.com/export.xlsx',
          filename: 'timesheet_2024-01-31.xlsx',
        };

        mockClient.post.mockResolvedValueOnce(mockResponse);

        const result = await resource.generate(params);

        expect(mockClient.post).toHaveBeenCalledWith('/v1/export/data', params);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('send', () => {
      it('should send export via email', async () => {
        const params: ExportParams = {
          report: 1,
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          format: 'pdf',
          email: 'user@example.com',
        };

        mockClient.post.mockResolvedValueOnce(undefined);

        await resource.send(params);

        expect(mockClient.post).toHaveBeenCalledWith('/v1/export/send', params);
      });
    });

    describe('generateFromTemplate', () => {
      it('should generate export from template', async () => {
        const params = {
          templateId: 'tmpl_123',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        };

        const mockExportData = new ArrayBuffer(200);
        mockClient.request.mockResolvedValueOnce(mockExportData);

        const result = await resource.generateFromTemplate(params);

        expect(mockClient.request).toHaveBeenCalledWith({
          method: 'POST',
          url: '/v1/export/from-template',
          data: params,
          responseType: 'arraybuffer',
        });
        expect(result).toBe(mockExportData);
      });
    });

    describe('getFields', () => {
      it('should get export fields without scope', async () => {
        const mockResponse: ExportFieldsResponse = {
          fields: [
            { fieldId: 'date', name: 'Date' },
            { fieldId: 'duration', name: 'Duration' },
          ],
        };

        mockClient.get.mockResolvedValueOnce(mockResponse);

        const result = await resource.getFields();

        expect(mockClient.get).toHaveBeenCalledWith('/v1/export/fields', undefined);
        expect(result).toEqual(mockResponse);
      });

      it('should get export fields with scope', async () => {
        const mockResponse: ExportFieldsResponse = {
          fields: [{ fieldId: 'projectName', name: 'Project' }],
        };

        mockClient.get.mockResolvedValueOnce(mockResponse);

        const result = await resource.getFields('project');

        expect(mockClient.get).toHaveBeenCalledWith('/v1/export/fields', { scope: 'project' });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getReportTypes', () => {
      it('should get available report types', async () => {
        const mockResponse: ExportReportsResponse = {
          reports: [
            { id: 1, name: 'Task Report' },
            { id: 2, name: 'Project Summary' },
          ],
        };

        mockClient.get.mockResolvedValueOnce(mockResponse);

        const result = await resource.getReportTypes();

        expect(mockClient.get).toHaveBeenCalledWith('/v1/export/report-types');
        expect(result).toEqual(mockResponse);
      });
    });

    describe('listTemplates', () => {
      it('should list export templates', async () => {
        const mockPage: Page<ExportTemplate> = {
          items: [
            { id: 'tmpl_1', name: 'Monthly Report', report: 1 },
            { id: 'tmpl_2', name: 'Weekly Summary', report: 2 },
          ],
          params: {
            page: 1,
            limit: 20,
            count: 2,
          },
        };

        mockClient.get.mockResolvedValueOnce(mockPage);

        const result = await resource.listTemplates({ page: 1, limit: 20 });

        expect(mockClient.get).toHaveBeenCalledWith('/v1/export/templates', {
          page: 1,
          limit: 20,
        } as Record<string, unknown>);
        expect(result.items).toHaveLength(2);
        expect(result.params.page).toBe(1);
        expect(result.params.count).toBe(2);
      });
    });

    describe('searchTemplates', () => {
      it('should search export templates', async () => {
        const mockPage: Page<ExportTemplate> = {
          items: [{ id: 'tmpl_1', name: 'Monthly Report', report: 1 }],
          params: { page: 1, limit: 10, count: 1 },
        };

        mockClient.post.mockResolvedValueOnce(mockPage);

        const result = await resource.searchTemplates({ page: 1, limit: 10 });

        expect(mockClient.post).toHaveBeenCalledWith('/v1/export/templates/search', {
          page: 1,
          limit: 10,
        });
        expect(result.items).toHaveLength(1);
      });
    });

    describe('createTemplate', () => {
      it('should create export template', async () => {
        const createData = {
          name: 'New Template',
          report: 1,
          format: 'xlsx',
        };

        const mockTemplate: ExportTemplate = {
          id: 'tmpl_new',
          name: 'New Template',
          report: 1,
        };

        mockClient.post.mockResolvedValueOnce(mockTemplate);

        const result = await resource.createTemplate(createData);

        expect(mockClient.post).toHaveBeenCalledWith('/v1/export/templates', createData);
        expect(result).toEqual(mockTemplate);
      });
    });

    describe('getTemplate', () => {
      it('should get single template', async () => {
        const mockTemplate: ExportTemplate = {
          id: 'tmpl_123',
          name: 'Test Template',
          report: 1,
        };

        mockClient.get.mockResolvedValueOnce(mockTemplate);

        const result = await resource.getTemplate('tmpl_123');

        expect(mockClient.get).toHaveBeenCalledWith('/v1/export/templates/tmpl_123');
        expect(result).toEqual(mockTemplate);
      });
    });

    describe('updateTemplate', () => {
      it('should update export template', async () => {
        const updateData = { name: 'Updated Name' };
        const mockTemplate: ExportTemplate = {
          id: 'tmpl_123',
          name: 'Updated Name',
          report: 1,
        };

        mockClient.put.mockResolvedValueOnce(mockTemplate);

        const result = await resource.updateTemplate('tmpl_123', updateData);

        expect(mockClient.put).toHaveBeenCalledWith('/v1/export/templates/tmpl_123', updateData);
        expect(result).toEqual(mockTemplate);
      });
    });

    describe('deleteTemplate', () => {
      it('should delete export template', async () => {
        mockClient.delete.mockResolvedValueOnce(undefined);

        await resource.deleteTemplate('tmpl_123');

        expect(mockClient.delete).toHaveBeenCalledWith('/v1/export/templates/tmpl_123');
      });
    });

    describe('listCustomFields', () => {
      it('should list custom fields without scope', async () => {
        const mockResponse = {
          fields: [{ id: 'cf_1', name: 'Custom Field 1', scope: 'TASK', type: 'TEXT' }],
        };

        mockClient.get.mockResolvedValueOnce(mockResponse);

        const result = await resource.listCustomFields();

        expect(mockClient.get).toHaveBeenCalledWith('/v1/export/custom-fields', undefined);
        expect(result).toEqual(mockResponse);
      });

      it('should list custom fields with scope', async () => {
        const mockResponse = {
          fields: [{ id: 'cf_1', name: 'Project Field', scope: 'PROJECT', type: 'FORMULA' }],
        };

        mockClient.get.mockResolvedValueOnce(mockResponse);

        const result = await resource.listCustomFields('PROJECT');

        expect(mockClient.get).toHaveBeenCalledWith('/v1/export/custom-fields', {
          scope: 'PROJECT',
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getCustomField', () => {
      it('should get single custom field', async () => {
        const mockField: CustomExportField = {
          id: 'cf_123',
          name: 'My Field',
          scope: 'TASK',
          type: 'TEXT',
        };

        mockClient.get.mockResolvedValueOnce(mockField);

        const result = await resource.getCustomField('cf_123');

        expect(mockClient.get).toHaveBeenCalledWith('/v1/export/custom-fields/cf_123');
        expect(result).toEqual(mockField);
      });
    });

    describe('createCustomField', () => {
      it('should create custom field', async () => {
        const createData = {
          name: 'My Field',
          scope: 'TASK',
          type: 'TEXT',
          value: 'Static Value',
        };

        const mockField: CustomExportField = {
          id: 'cf_new',
          name: 'My Field',
          scope: 'TASK',
          type: 'TEXT',
          value: 'Static Value',
        };

        mockClient.post.mockResolvedValueOnce(mockField);

        const result = await resource.createCustomField(createData);

        expect(mockClient.post).toHaveBeenCalledWith('/v1/export/custom-fields', createData);
        expect(result).toEqual(mockField);
      });
    });

    describe('updateCustomField', () => {
      it('should update custom field', async () => {
        const updateData = { name: 'Updated Field' };
        const mockField: CustomExportField = {
          id: 'cf_123',
          name: 'Updated Field',
          scope: 'TASK',
          type: 'TEXT',
        };

        mockClient.put.mockResolvedValueOnce(mockField);

        const result = await resource.updateCustomField('cf_123', updateData);

        expect(mockClient.put).toHaveBeenCalledWith('/v1/export/custom-fields/cf_123', updateData);
        expect(result).toEqual(mockField);
      });
    });

    describe('deleteCustomField', () => {
      it('should delete custom field', async () => {
        mockClient.delete.mockResolvedValueOnce(undefined);

        await resource.deleteCustomField('cf_123');

        expect(mockClient.delete).toHaveBeenCalledWith('/v1/export/custom-fields/cf_123');
      });
    });
  });

  describe('ReportsClient', () => {
    it('should initialize all resources', () => {
      const client = new ReportsClient(mockClient);

      expect(client.documents).toBeInstanceOf(DocumentReportResource);
      expect(client.tasks).toBeInstanceOf(TaskReportResource);
      expect(client.expenses).toBeInstanceOf(ExpenseReportResource);
      expect(client.notes).toBeInstanceOf(NoteReportResource);
      expect(client.export).toBeInstanceOf(ExportResource);
    });
  });
});
