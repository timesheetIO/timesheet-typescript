import type { ApiClient } from '../http';
import type {
  Expense,
  ExpenseCreateRequest,
  ExpenseCreateWithFileRequest,
  ExpenseFileUpload,
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
    const response = await this.http.get<Page<Expense>, ExpenseListParams>(this.basePath, params);
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
   * @param data Status update data (must include the expense id)
   * @returns Updated expense
   */
  async updateStatus(data: ExpenseStatus): Promise<Expense> {
    return this.http.put<Expense>(`${this.basePath}/updateStatus`, data);
  }

  /**
   * Upload a file to an existing expense
   * @param id Expense ID
   * @param file File to upload
   * @returns Updated expense with file attachment
   */
  async uploadFile(id: string, file: ExpenseFileUpload): Promise<Expense> {
    const formData = new FormData();
    formData.append('file', file.file, file.fileName);
    return this.http.postMultipart<Expense>(
      `${this.basePath}/${encodeURIComponent(id)}/file`,
      formData,
    );
  }

  /**
   * Create an expense with a file attachment in a single request
   * @param data Expense data including optional file
   * @returns Created expense
   */
  async createWithFile(data: ExpenseCreateWithFileRequest): Promise<Expense> {
    const { file, ...expenseData } = data;
    const formattedData = {
      ...expenseData,
      dateTime: DateUtils.formatTimestamp(expenseData.dateTime),
    };

    const formData = new FormData();
    formData.append(
      'data',
      new Blob([JSON.stringify(formattedData)], { type: 'application/json' }),
    );

    if (file) {
      formData.append('file', file.file, file.fileName);
    }

    return this.http.postMultipart<Expense>(`${this.basePath}/with-file`, formData);
  }

  /**
   * Get the signed URL for an expense file attachment
   * @param id Expense ID
   * @returns File URL response
   */
  async getFileUrl(id: string): Promise<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.basePath}/getFileUrl/${encodeURIComponent(id)}`);
  }
}
