import { ApiClient } from '../http';
import { Page, NavigablePage } from '../models';
import {
  Rate,
  RateCreateRequest,
  RateUpdateRequest,
  RateListParams,
  RateSearchParams
} from '../models/Rate';

export class RateResource {
  constructor(private readonly client: ApiClient) {}
  
  async list(params?: RateListParams): Promise<NavigablePage<Rate>> {
    const response = await this.client.get<Page<Rate>>('/v1/rates', params);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }
  
  async create(data: RateCreateRequest): Promise<Rate> {
    return this.client.post<Rate>('/v1/rates', data);
  }
  
  async get(id: string): Promise<Rate> {
    return this.client.get<Rate>(`/v1/rates/${id}`);
  }
  
  async update(id: string, data: RateUpdateRequest): Promise<Rate> {
    return this.client.put<Rate>(`/v1/rates/${id}`, data);
  }
  
  async delete(id: string): Promise<void> {
    return this.client.delete(`/v1/rates/${id}`);
  }
  
  async search(params: RateSearchParams): Promise<NavigablePage<Rate>> {
    const response = await this.client.post<Page<Rate>>('/v1/rates/search', params);
    return new NavigablePage(response, (page) => this.search({ ...params, page }));
  }
}
