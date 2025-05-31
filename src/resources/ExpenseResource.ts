import { ApiClient } from '../http';
import { Page, NavigablePage } from '../models';
import {
  Expense,
  ExpenseCreateRequest,
  ExpenseUpdateRequest,
  ExpenseStatusUpdateRequest,
  ExpenseListParams,
  ExpenseSearchParams
} from '../models/Expense';

export class ExpenseResource {
  constructor(private readonly client: ApiClient) {}
  
  async list(params?: ExpenseListParams): Promise<NavigablePage<Expense>> {
    const response = await this.client.get<Page<Expense>>('/v1/expenses', params);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }
  
  async create(data: ExpenseCreateRequest): Promise<Expense> {
    return this.client.post<Expense>('/v1/expenses', data);
  }
  
  async get(id: string): Promise<Expense> {
    return this.client.get<Expense>(`/v1/expenses/${id}`);
  }
  
  async update(id: string, data: ExpenseUpdateRequest): Promise<Expense> {
    return this.client.put<Expense>(`/v1/expenses/${id}`, data);
  }
  
  async delete(id: string): Promise<void> {
    return this.client.delete(`/v1/expenses/${id}`);
  }
  
  async search(params: ExpenseSearchParams): Promise<NavigablePage<Expense>> {
    const response = await this.client.post<Page<Expense>>('/v1/expenses/search', params);
    return new NavigablePage(response, (page) => this.search({ ...params, page }));
  }
  
  async getFileUrl(id: string): Promise<{ url: string }> {
    return this.client.get<{ url: string }>(`/v1/expenses/getFileUrl/${id}`);
  }
  
  async updateStatus(data: ExpenseStatusUpdateRequest): Promise<void> {
    return this.client.put('/v1/expenses/updateStatus', data);
  }
}
