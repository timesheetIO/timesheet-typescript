import type { ApiClient } from '../../http';
import type { ExpenseReportItem } from '../../models';
import { Resource } from '../Resource';

/**
 * Resource for generating expense reports and PDFs.
 * Accesses the Reports API at reports.timesheet.io.
 */
export class ExpenseReportResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/expenses');
  }

  /**
   * Generate expense report data in JSON format.
   * Returns an ExpenseReportItem entity containing formatted expense information
   * including amounts, descriptions, receipts, and timestamps.
   * @param expenseId Unique identifier of the expense
   */
  async get(expenseId: string): Promise<ExpenseReportItem> {
    return this.http.get<ExpenseReportItem>(`${this.basePath}/${encodeURIComponent(expenseId)}`);
  }

  /**
   * Generate and download a PDF report for a specific expense.
   * The PDF includes expense details, amounts, receipt images,
   * and formatting according to user settings.
   * @param expenseId Unique identifier of the expense
   * @returns ArrayBuffer containing the PDF file data
   */
  async getPdf(expenseId: string): Promise<ArrayBuffer> {
    return this.http.request<ArrayBuffer>({
      method: 'GET',
      url: `${this.basePath}/${encodeURIComponent(expenseId)}/pdf`,
      responseType: 'arraybuffer',
    });
  }
}
