import type { ApiClient } from '../../http';
import type { TaskReportItem } from '../../models';
import { Resource } from '../Resource';

/**
 * Resource for generating task reports and PDFs.
 * Accesses the Reports API at reports.timesheet.io.
 */
export class TaskReportResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/tasks');
  }

  /**
   * Generate task report data in JSON format.
   * Returns a TaskReportItem entity containing formatted task information
   * including time tracking, rates, project details, and signatures.
   * @param taskId Unique identifier of the task
   */
  async get(taskId: string): Promise<TaskReportItem> {
    return this.http.get<TaskReportItem>(`${this.basePath}/${encodeURIComponent(taskId)}`);
  }

  /**
   * Generate and download a PDF report for a specific task.
   * The PDF includes task details, time tracking information, project context,
   * and any associated signatures formatted according to user settings.
   * @param taskId Unique identifier of the task
   * @returns ArrayBuffer containing the PDF file data
   */
  async getPdf(taskId: string): Promise<ArrayBuffer> {
    return this.http.request<ArrayBuffer>({
      method: 'GET',
      url: `${this.basePath}/${encodeURIComponent(taskId)}/pdf`,
      responseType: 'arraybuffer',
    });
  }
}
