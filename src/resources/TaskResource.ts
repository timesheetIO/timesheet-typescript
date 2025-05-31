import { ApiClient } from '../http';
import { Page, NavigablePage } from '../models';
import {
  Task,
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskStatusUpdateRequest,
  TaskTimesUpdateRequest,
  TaskListParams,
  TaskSearchParams
} from '../models/Task';

export class TaskResource {
  constructor(private readonly client: ApiClient) {}
  
  async list(params?: TaskListParams): Promise<NavigablePage<Task>> {
    const response = await this.client.get<Page<Task>>('/v1/tasks', params);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }
  
  async create(data: TaskCreateRequest): Promise<Task> {
    return this.client.post<Task>('/v1/tasks', data);
  }
  
  async get(id: string): Promise<Task> {
    return this.client.get<Task>(`/v1/tasks/${id}`);
  }
  
  async update(id: string, data: TaskUpdateRequest): Promise<Task> {
    return this.client.put<Task>(`/v1/tasks/${id}`, data);
  }
  
  async delete(id: string): Promise<void> {
    return this.client.delete(`/v1/tasks/${id}`);
  }
  
  async search(params: TaskSearchParams): Promise<NavigablePage<Task>> {
    const response = await this.client.post<Page<Task>>('/v1/tasks/search', params);
    return new NavigablePage(response, (page) => this.search({ ...params, page }));
  }
  
  async updateStatus(data: TaskStatusUpdateRequest): Promise<void> {
    return this.client.put('/v1/tasks/updateStatus', data);
  }
  
  async updateTimes(data: TaskTimesUpdateRequest): Promise<void> {
    return this.client.put('/v1/tasks/updateTimes', data);
  }
  
  async print(id: string): Promise<Blob> {
    const response = await this.client.get(`/v1/tasks/print/${id}`, undefined, {
      responseType: 'blob'
    });
    return response as Blob;
  }
}
