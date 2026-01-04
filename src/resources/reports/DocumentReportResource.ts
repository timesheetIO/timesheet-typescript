import type { ApiClient } from '../../http';
import type { DocumentReport } from '../../models';
import { Resource } from '../Resource';

/**
 * Resource for generating document reports and PDFs.
 * Accesses the Reports API at reports.timesheet.io.
 */
export class DocumentReportResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/documents');
  }

  /**
   * Generate document report data in JSON format.
   * Returns a DocumentReport entity containing all document data.
   * @param documentId Unique identifier of the document
   */
  async get(documentId: string): Promise<DocumentReport> {
    return this.http.get<DocumentReport>(`${this.basePath}/${encodeURIComponent(documentId)}`);
  }

  /**
   * Generate and download a PDF report for a specific document.
   * The PDF includes all document data (tasks, expenses, notes) formatted
   * according to user settings and document template.
   * @param documentId Unique identifier of the document
   * @returns ArrayBuffer containing the PDF file data
   */
  async getPdf(documentId: string): Promise<ArrayBuffer> {
    return this.http.request<ArrayBuffer>({
      method: 'GET',
      url: `${this.basePath}/${encodeURIComponent(documentId)}/pdf`,
      responseType: 'arraybuffer',
    });
  }

  /**
   * Generate XML representation of the document.
   * Returns Zugferd/XRechnung, ebInterface, or plain DocumentReport XML
   * based on the document's eInvoiceType configuration.
   * @param documentId Unique identifier of the document
   * @returns String containing the XML data
   */
  async getXml(documentId: string): Promise<string> {
    return this.http.request<string>({
      method: 'GET',
      url: `${this.basePath}/${encodeURIComponent(documentId)}/xml`,
      headers: {
        Accept: 'application/xml',
      },
    });
  }
}
