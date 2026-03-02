import type { ApiClient } from '../http';
import type {
  Note,
  NoteCreateRequest,
  NoteCreateWithFileRequest,
  NoteFileUpload,
  NoteListParams,
  NoteUpdateRequest,
  Page,
} from '../models';
import { NavigablePage } from '../models';
import { DateUtils } from '../utils/date';
import { Resource } from './Resource';

export class NoteResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/notes');
  }

  async list(params?: NoteListParams): Promise<NavigablePage<Note>> {
    const response = await this.http.get<Page<Note>, NoteListParams>(this.basePath, params);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }

  async create(data: NoteCreateRequest): Promise<Note> {
    const formattedData = {
      ...data,
      dateTime: DateUtils.formatTimestamp(data.dateTime),
    };
    return this.http.post<Note>(this.basePath, formattedData);
  }

  async update(id: string, data: NoteUpdateRequest): Promise<Note> {
    const formattedData = {
      ...data,
      dateTime: DateUtils.formatTimestamp(data.dateTime),
    };
    return this.http.put<Note>(`${this.basePath}/${encodeURIComponent(id)}`, formattedData);
  }

  async get(id: string): Promise<Note> {
    return this.http.get<Note>(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  async delete(id: string): Promise<void> {
    return this.http.delete(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  /**
   * Search notes with parameters using POST
   * @param params Search parameters
   */
  async search(params: NoteListParams): Promise<NavigablePage<Note>> {
    const response = await this.http.post<Page<Note>>(`${this.basePath}/search`, params);
    return this.createNavigablePage(response, (page) => this.search({ ...params, page }));
  }

  /**
   * Upload a file to an existing note
   * @param id Note ID
   * @param file File to upload
   * @returns Updated note with file attachment
   */
  async uploadFile(id: string, file: NoteFileUpload): Promise<Note> {
    const formData = new FormData();
    formData.append('file', file.file, file.fileName);
    return this.http.postMultipart<Note>(
      `${this.basePath}/${encodeURIComponent(id)}/file`,
      formData,
    );
  }

  /**
   * Create a note with a file attachment in a single request
   * @param data Note data including optional file
   * @returns Created note
   */
  async createWithFile(data: NoteCreateWithFileRequest): Promise<Note> {
    const { file, ...noteData } = data;
    const formattedData = {
      ...noteData,
      dateTime: DateUtils.formatTimestamp(noteData.dateTime),
    };

    const formData = new FormData();
    formData.append(
      'data',
      new Blob([JSON.stringify(formattedData)], { type: 'application/json' }),
    );

    if (file) {
      formData.append('file', file.file, file.fileName);
    }

    return this.http.postMultipart<Note>(`${this.basePath}/with-file`, formData);
  }

  /**
   * Get the signed URL for a note file attachment
   * @param id Note ID
   * @returns File URL response
   */
  async getFileUrl(id: string): Promise<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.basePath}/getFileUrl/${encodeURIComponent(id)}`);
  }
}
