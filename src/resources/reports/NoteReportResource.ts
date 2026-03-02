import type { ApiClient } from '../../http';
import type { NoteReportItem } from '../../models';
import { Resource } from '../Resource';

/**
 * Resource for generating note reports and PDFs.
 * Accesses the Reports API at reports.timesheet.io.
 */
export class NoteReportResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/notes');
  }

  /**
   * Generate note report data in JSON format.
   * Returns a NoteReportItem entity containing formatted note information
   * including content, attachments, timestamps, and author details.
   * @param noteId Unique identifier of the note
   */
  async get(noteId: string): Promise<NoteReportItem> {
    return this.http.get<NoteReportItem>(`${this.basePath}/${encodeURIComponent(noteId)}`);
  }

  /**
   * Generate and download a PDF report for a specific note.
   * The PDF includes note content, metadata, attached images,
   * and formatting according to user settings.
   * @param noteId Unique identifier of the note
   * @returns ArrayBuffer containing the PDF file data
   */
  async getPdf(noteId: string): Promise<ArrayBuffer> {
    return this.http.request<ArrayBuffer>({
      method: 'GET',
      url: `${this.basePath}/${encodeURIComponent(noteId)}/pdf`,
      responseType: 'arraybuffer',
    });
  }
}
