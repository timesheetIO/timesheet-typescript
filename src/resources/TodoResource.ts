import type { ApiClient } from '../http';
import type { Page, Todo, TodoCreateRequest, TodoListParams, TodoUpdateRequest } from '../models';
import { NavigablePage } from '../models';
import { DateUtils } from '../utils/date';
import { Resource } from './Resource';

export class TodoResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/todos');
  }

  async list(params?: TodoListParams): Promise<NavigablePage<Todo>> {
    const response = await this.http.get<Page<Todo>, TodoListParams>(this.basePath, params);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }

  async create(data: TodoCreateRequest): Promise<Todo> {
    const formattedData = {
      ...data,
      dueDate: data.dueDate ? DateUtils.formatTimestamp(data.dueDate) : undefined,
    };
    return this.http.post<Todo>(this.basePath, formattedData);
  }

  async update(id: string, data: TodoUpdateRequest): Promise<Todo> {
    const formattedData = {
      ...data,
      dueDate: data.dueDate ? DateUtils.formatTimestamp(data.dueDate) : undefined,
    };
    return this.http.put<Todo>(`${this.basePath}/${encodeURIComponent(id)}`, formattedData);
  }

  async get(id: string): Promise<Todo> {
    return this.http.get<Todo>(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  async delete(id: string): Promise<void> {
    return this.http.delete(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  /**
   * Search todos with parameters using POST
   * @param params Search parameters
   */
  async search(params: TodoListParams): Promise<NavigablePage<Todo>> {
    const response = await this.http.post<Page<Todo>>(`${this.basePath}/search`, params);
    return this.createNavigablePage(response, (page) => this.search({ ...params, page }));
  }
}
