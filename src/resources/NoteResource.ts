import type { ApiClient } from '../http';
import type { Note, NoteCreateRequest, NoteListParams, NoteUpdateRequest, Page } from '../models';
import { NavigablePage } from '../models';
import { DateUtils } from '../utils/date';
import { Resource } from './Resource';

export class NoteResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/notes');
  }

  async list(params?: NoteListParams): Promise<NavigablePage<Note>> {
    const response = await this.http.get<Page<Note>>(this.basePath, params);
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
}
