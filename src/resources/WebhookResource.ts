import { ApiClient } from '../http';
import { Page, NavigablePage } from '../models';
import {
  Webhook,
  WebhookCreateRequest,
  WebhookUpdateRequest,
  WebhookListParams,
  WebhookSearchParams
} from '../models/Webhook';

export class WebhookResource {
  constructor(private readonly client: ApiClient) {}
  
  async list(params?: WebhookListParams): Promise<NavigablePage<Webhook>> {
    const response = await this.client.get<Page<Webhook>>('/v1/webhooks', params);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }
  
  async create(data: WebhookCreateRequest): Promise<Webhook> {
    return this.client.post<Webhook>('/v1/webhooks', data);
  }
  
  async get(id: string): Promise<Webhook> {
    return this.client.get<Webhook>(`/v1/webhooks/${id}`);
  }
  
  async update(id: string, data: WebhookUpdateRequest): Promise<Webhook> {
    return this.client.put<Webhook>(`/v1/webhooks/${id}`, data);
  }
  
  async delete(id: string): Promise<void> {
    return this.client.delete(`/v1/webhooks/${id}`);
  }
  
  async search(params: WebhookSearchParams): Promise<NavigablePage<Webhook>> {
    const response = await this.client.post<Page<Webhook>>('/v1/webhooks/search', params);
    return new NavigablePage(response, (page) => this.search({ ...params, page }));
  }
}
