import { ApiClient } from '../http';
import { Page, NavigablePage } from '../models';
import {
  Automation,
  AutomationCreateRequest,
  AutomationUpdateRequest,
  AutomationListParams,
  AutomationSearchParams
} from '../models/Automation';

export class AutomationResource {
  constructor(private readonly client: ApiClient) {}
  
  async list(params?: AutomationListParams): Promise<NavigablePage<Automation>> {
    const response = await this.client.get<Page<Automation>>('/v1/automations', params);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }
  
  async create(data: AutomationCreateRequest): Promise<Automation> {
    return this.client.post<Automation>('/v1/automations', data);
  }
  
  async get(id: string): Promise<Automation> {
    return this.client.get<Automation>(`/v1/automations/${id}`);
  }
  
  async update(id: string, data: AutomationUpdateRequest): Promise<Automation> {
    return this.client.put<Automation>(`/v1/automations/${id}`, data);
  }
  
  async delete(id: string): Promise<void> {
    return this.client.delete(`/v1/automations/${id}`);
  }
  
  async search(params: AutomationSearchParams): Promise<NavigablePage<Automation>> {
    const response = await this.client.post<Page<Automation>>('/v1/automations/search', params);
    return new NavigablePage(response, (page) => this.search({ ...params, page }));
  }
}
