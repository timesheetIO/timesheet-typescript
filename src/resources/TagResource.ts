import { ApiClient } from '../http';
import { Page, NavigablePage } from '../models';
import {
  Tag,
  TagCreateRequest,
  TagUpdateRequest,
  TagListParams,
  TagSearchParams
} from '../models/Tag';

export class TagResource {
  constructor(private readonly client: ApiClient) {}
  
  async list(params?: TagListParams): Promise<NavigablePage<Tag>> {
    const response = await this.client.get<Page<Tag>>('/v1/tags', params);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }
  
  async create(data: TagCreateRequest): Promise<Tag> {
    return this.client.post<Tag>('/v1/tags', data);
  }
  
  async get(id: string): Promise<Tag> {
    return this.client.get<Tag>(`/v1/tags/${id}`);
  }
  
  async update(id: string, data: TagUpdateRequest): Promise<Tag> {
    return this.client.put<Tag>(`/v1/tags/${id}`, data);
  }
  
  async delete(id: string): Promise<void> {
    return this.client.delete(`/v1/tags/${id}`);
  }
  
  async search(params: TagSearchParams): Promise<NavigablePage<Tag>> {
    const response = await this.client.post<Page<Tag>>('/v1/tags/search', params);
    return new NavigablePage(response, (page) => this.search({ ...params, page }));
  }
}
