import type { ApiClient } from '../http';
import type {
  Page,
  Webhook,
  WebhookCreateRequest,
  WebhookListParams,
  WebhookUpdateRequest,
} from '../models';
import { NavigablePage } from '../models';
import { Resource } from './Resource';

export class WebhookResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/webhooks');
  }

  async list(params?: WebhookListParams): Promise<NavigablePage<Webhook>> {
    const response = await this.http.get<Page<Webhook>>(this.basePath, params);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }

  async create(data: WebhookCreateRequest): Promise<Webhook> {
    return this.http.post<Webhook>(this.basePath, data);
  }

  async update(id: string, data: WebhookUpdateRequest): Promise<Webhook> {
    return this.http.put<Webhook>(`${this.basePath}/${encodeURIComponent(id)}`, data);
  }

  async get(id: string): Promise<Webhook> {
    return this.http.get<Webhook>(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  async delete(id: string): Promise<void> {
    return this.http.delete(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  /**
   * Search webhooks with parameters using POST
   * @param params Search parameters
   */
  async search(params: WebhookListParams): Promise<NavigablePage<Webhook>> {
    const response = await this.http.post<Page<Webhook>>(`${this.basePath}/search`, params);
    return this.createNavigablePage(response, (page) => this.search({ ...params, page }));
  }
}
