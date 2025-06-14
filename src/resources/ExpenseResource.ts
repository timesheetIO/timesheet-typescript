import type { ApiClient } from '../http';
import type {
  Expense,
  ExpenseCreateRequest,
  ExpenseListParams,
  ExpenseStatus,
  ExpenseUpdateRequest,
  Page,
} from '../models';
import { NavigablePage } from '../models';
import { DateUtils } from '../utils/date';
import { Resource } from './Resource';

export class ExpenseResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/expenses');
  }

  async list(params?: ExpenseListParams): Promise<NavigablePage<Expense>> {
    const response = await this.http.get<Page<Expense>>(this.basePath, params);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }

  async create(data: ExpenseCreateRequest): Promise<Expense> {
    const formattedData = {
      ...data,
      dateTime: DateUtils.formatTimestamp(data.dateTime),
    };
    return this.http.post<Expense>(this.basePath, formattedData);
  }

  async update(id: string, data: ExpenseUpdateRequest): Promise<Expense> {
    const formattedData = {
      ...data,
      dateTime: data.dateTime ? DateUtils.formatTimestamp(data.dateTime) : undefined,
    };
    return this.http.put<Expense>(`${this.basePath}/${encodeURIComponent(id)}`, formattedData);
  }

  async get(id: string): Promise<Expense> {
    return this.http.get<Expense>(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  async delete(id: string): Promise<void> {
    return this.http.delete(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  /**
   * Search expenses with parameters using POST
   * @param params Search parameters
   */
  async search(params: ExpenseListParams): Promise<NavigablePage<Expense>> {
    const response = await this.http.post<Page<Expense>>(`${this.basePath}/search`, params);
    return this.createNavigablePage(response, (page) => this.search({ ...params, page }));
  }

  /**
   * Update expense status
   * @param id Expense ID
   * @param data Status update data
   * @returns Updated expense
   */
  async updateStatus(id: string, data: ExpenseStatus): Promise<Expense> {
    return this.http.put<Expense>(`${this.basePath}/${id}/status`, data);
  }
}
