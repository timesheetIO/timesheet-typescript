import type { ApiClient } from '../http';
import type {
  Automation,
  AutomationCreateRequest,
  AutomationListParams,
  AutomationUpdateRequest,
  Page,
} from '../models';
import { NavigablePage } from '../models';
import { Resource } from './Resource';

export class AutomationResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/automations');
  }

  async list(params?: AutomationListParams): Promise<NavigablePage<Automation>> {
    const response = await this.http.get<Page<Automation>, AutomationListParams>(
      this.basePath,
      params,
    );
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }

  async create(data: AutomationCreateRequest): Promise<Automation> {
    return this.http.post<Automation>(this.basePath, data);
  }

  async update(id: string, data: AutomationUpdateRequest): Promise<Automation> {
    return this.http.put<Automation>(`${this.basePath}/${encodeURIComponent(id)}`, data);
  }

  async get(id: string): Promise<Automation> {
    return this.http.get<Automation>(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  async delete(id: string): Promise<void> {
    return this.http.delete(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  /**
   * Search automations with parameters using POST
   * @param params Search parameters
   */
  async search(params: AutomationListParams): Promise<NavigablePage<Automation>> {
    const response = await this.http.post<Page<Automation>>(`${this.basePath}/search`, params);
    return this.createNavigablePage(response, (page) => this.search({ ...params, page }));
  }
}
