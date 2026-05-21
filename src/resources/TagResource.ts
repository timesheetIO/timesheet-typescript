import type { ApiClient } from '../http';
import type { Page, Tag, TagCreateRequest, TagListParams, TagUpdateRequest } from '../models';
import { NavigablePage } from '../models';
import { Resource } from './Resource';

export class TagResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/tags');
  }

  async list(params?: TagListParams): Promise<NavigablePage<Tag>> {
    // GET /v1/tags returns a bare array, not a paged object.
    const items = await this.http.get<Tag[], TagListParams>(this.basePath, params);
    return new NavigablePage({ items: items ?? [], params: params ?? {} }, (page) =>
      this.list({ ...params, page }),
    );
  }

  async create(data: TagCreateRequest): Promise<Tag> {
    return this.http.post<Tag>(this.basePath, data);
  }

  async update(id: string, data: TagUpdateRequest): Promise<Tag> {
    return this.http.put<Tag>(`${this.basePath}/${encodeURIComponent(id)}`, data);
  }

  async get(id: string): Promise<Tag> {
    return this.http.get<Tag>(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  async delete(id: string): Promise<void> {
    return this.http.delete(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  /**
   * Search tags with parameters using POST
   * @param params Search parameters
   */
  async search(params: TagListParams): Promise<NavigablePage<Tag>> {
    const response = await this.http.post<Page<Tag>>(`${this.basePath}/search`, params);
    return this.createNavigablePage(response, (page) => this.search({ ...params, page }));
  }
}
