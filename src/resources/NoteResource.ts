import { ApiClient } from '../http';
import { Page, NavigablePage } from '../models';
import {
  Note,
  NoteCreateRequest,
  NoteUpdateRequest,
  NoteListParams
} from '../models/Note';

export class NoteResource {
  constructor(private readonly client: ApiClient) {}
  
  async list(params?: NoteListParams): Promise<NavigablePage<Note>> {
    const response = await this.client.get<Page<Note>>('/v1/notes', params);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }
  
  async create(data: NoteCreateRequest): Promise<Note> {
    return this.client.post<Note>('/v1/notes', data);
  }
  
  async get(id: string): Promise<Note> {
    return this.client.get<Note>(`/v1/notes/${id}`);
  }
  
  async update(id: string, data: NoteUpdateRequest): Promise<Note> {
    return this.client.put<Note>(`/v1/notes/${id}`, data);
  }
  
  async delete(id: string): Promise<void> {
    return this.client.delete(`/v1/notes/${id}`);
  }
}
