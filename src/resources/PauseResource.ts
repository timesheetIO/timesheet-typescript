import { ApiClient } from '../http';
import { Page, NavigablePage } from '../models';
import {
  Pause,
  PauseCreateRequest,
  PauseUpdateRequest,
  PauseListParams,
  PauseSearchParams
} from '../models/Pause';

export class PauseResource {
  constructor(private readonly client: ApiClient) {}
  
  async list(params?: PauseListParams): Promise<NavigablePage<Pause>> {
    const response = await this.client.get<Page<Pause>>('/v1/pauses', params);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }
  
  async create(data: PauseCreateRequest): Promise<Pause> {
    return this.client.post<Pause>('/v1/pauses', data);
  }
  
  async get(id: string): Promise<Pause> {
    return this.client.get<Pause>(`/v1/pauses/${id}`);
  }
  
  async update(id: string, data: PauseUpdateRequest): Promise<Pause> {
    return this.client.put<Pause>(`/v1/pauses/${id}`, data);
  }
  
  async delete(id: string): Promise<void> {
    return this.client.delete(`/v1/pauses/${id}`);
  }
  
  async search(params: PauseSearchParams): Promise<NavigablePage<Pause>> {
    const response = await this.client.post<Page<Pause>>('/v1/pauses/search', params);
    return new NavigablePage(response, (page) => this.search({ ...params, page }));
  }
}
