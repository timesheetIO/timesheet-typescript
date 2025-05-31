import { ApiClient } from '../http';
import { Page, NavigablePage } from '../models';
import {
  Todo,
  TodoCreateRequest,
  TodoUpdateRequest,
  TodoListParams,
  TodoSearchParams
} from '../models/Todo';

export class TodoResource {
  constructor(private readonly client: ApiClient) {}
  
  async list(params?: TodoListParams): Promise<NavigablePage<Todo>> {
    const response = await this.client.get<Page<Todo>>('/v1/todos', params);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }
  
  async create(data: TodoCreateRequest): Promise<Todo> {
    return this.client.post<Todo>('/v1/todos', data);
  }
  
  async get(id: string): Promise<Todo> {
    return this.client.get<Todo>(`/v1/todos/${id}`);
  }
  
  async update(id: string, data: TodoUpdateRequest): Promise<Todo> {
    return this.client.put<Todo>(`/v1/todos/${id}`, data);
  }
  
  async delete(id: string): Promise<void> {
    return this.client.delete(`/v1/todos/${id}`);
  }
  
  async search(params: TodoSearchParams): Promise<NavigablePage<Todo>> {
    const response = await this.client.post<Page<Todo>>('/v1/todos/search', params);
    return new NavigablePage(response, (page) => this.search({ ...params, page }));
  }
}
