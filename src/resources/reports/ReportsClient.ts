import type { ApiClient } from '../../http';
import { DocumentReportResource } from './DocumentReportResource';
import { TaskReportResource } from './TaskReportResource';
import { ExpenseReportResource } from './ExpenseReportResource';
import { NoteReportResource } from './NoteReportResource';
import { ExportResource } from './ExportResource';

/**
 * Reports API client providing access to PDF generation, exports, and report data.
 *
 * This client accesses the Reports API (reports.timesheet.io) which provides:
 * - Document, task, expense, and note PDF generation
 * - Timesheet exports in Excel, CSV, and PDF formats
 * - Export templates for saving export configurations
 * - Custom export fields for personalized exports
 *
 * @example
 * ```typescript
 * // Access via main client
 * const client = new TimesheetClient({ apiKey: 'your-api-key' });
 *
 * // Generate a document PDF
 * const pdfData = await client.reports.documents.getPdf('doc_123');
 *
 * // Generate a timesheet export
 * const exportResult = await client.reports.export.generate({
 *   report: 1,
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31',
 *   format: 'xlsx'
 * });
 *
 * // Get task report data
 * const taskReport = await client.reports.tasks.get('task_456');
 * ```
 */
export class ReportsClient {
  /**
   * Document report generation endpoints.
   * Generate document PDFs, XML (e-invoicing), and report data.
   */
  public readonly documents: DocumentReportResource;

  /**
   * Task report generation endpoints.
   * Generate task PDFs and report data.
   */
  public readonly tasks: TaskReportResource;

  /**
   * Expense report generation endpoints.
   * Generate expense PDFs and report data.
   */
  public readonly expenses: ExpenseReportResource;

  /**
   * Note report generation endpoints.
   * Generate note PDFs and report data.
   */
  public readonly notes: NoteReportResource;

  /**
   * Export generation endpoints.
   * Generate timesheet exports, manage templates, and custom fields.
   */
  public readonly export: ExportResource;

  /**
   * Creates a new ReportsClient instance.
   * @param apiClient ApiClient configured for the Reports API
   */
  constructor(apiClient: ApiClient) {
    this.documents = new DocumentReportResource(apiClient);
    this.tasks = new TaskReportResource(apiClient);
    this.expenses = new ExpenseReportResource(apiClient);
    this.notes = new NoteReportResource(apiClient);
    this.export = new ExportResource(apiClient);
  }
}
