import type { ApiClient } from '../http';
import type { Page, Rate, RateCreateRequest, RateListParams, RateUpdateRequest } from '../models';
import { NavigablePage } from '../models';
import { Resource } from './Resource';

export class RateResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/rates');
  }

  async list(params?: RateListParams): Promise<NavigablePage<Rate>> {
    const response = await this.http.get<Page<Rate>>(this.basePath, params);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }

  async create(data: RateCreateRequest): Promise<Rate> {
    return this.http.post<Rate>(this.basePath, data);
  }

  async update(id: string, data: RateUpdateRequest): Promise<Rate> {
    return this.http.put<Rate>(`${this.basePath}/${encodeURIComponent(id)}`, data);
  }

  async get(id: string): Promise<Rate> {
    return this.http.get<Rate>(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  async delete(id: string): Promise<void> {
    return this.http.delete(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  /**
   * Search rates with parameters using POST
   * @param params Search parameters
   */
  async search(params: RateListParams): Promise<NavigablePage<Rate>> {
    const response = await this.http.post<Page<Rate>>(`${this.basePath}/search`, params);
    return this.createNavigablePage(response, (page) => this.search({ ...params, page }));
  }
}
