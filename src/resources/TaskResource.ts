import type { ApiClient } from '../http';
import type {
  NavigablePage,
  Page,
  Task,
  TaskCreateRequest,
  TaskListParams,
  TaskStatusUpdateRequest,
  TaskTimesUpdateRequest,
  TaskUpdateRequest,
} from '../models';
import { DateUtils } from '../utils/date';
import { Resource } from './Resource';

export class TaskResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/tasks');
  }

  async create(data: TaskCreateRequest): Promise<Task> {
    const formattedData = {
      ...data,
      startDateTime: DateUtils.formatTimestamp(data.startDateTime),
      endDateTime: data.endDateTime ? DateUtils.formatTimestamp(data.endDateTime) : undefined,
    };
    return this.http.post<Task>(this.basePath, formattedData);
  }

  async update(id: string, data: TaskUpdateRequest): Promise<Task> {
    const formattedData = {
      ...data,
      startDateTime: data.startDateTime ? DateUtils.formatTimestamp(data.startDateTime) : undefined,
      endDateTime: data.endDateTime ? DateUtils.formatTimestamp(data.endDateTime) : undefined,
    };
    return this.http.put<Task>(`${this.basePath}/${encodeURIComponent(id)}`, formattedData);
  }

  async get(id: string): Promise<Task> {
    return this.http.get<Task>(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  async delete(id: string): Promise<void> {
    return this.http.delete(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  /**
   * Search tasks with parameters using POST
   * @param params Search parameters
   */
  async search(params: TaskListParams): Promise<NavigablePage<Task>> {
    const response = await this.http.post<Page<Task>>(`${this.basePath}/search`, params);
    return this.createNavigablePage(response, (page) => this.search({ ...params, page }));
  }

  /**
   * Update task status (billable, paid, billed)
   * @param data Status update data
   */
  async updateStatus(data: TaskStatusUpdateRequest): Promise<Task> {
    return this.http.put<Task>(`${this.basePath}/updateStatus`, data);
  }

  /**
   * Update task times
   * @param data Times update data
   */
  async updateTimes(data: TaskTimesUpdateRequest): Promise<Task> {
    const formattedData = {
      ...data,
      startDateTime: DateUtils.formatTimestamp(data.startDateTime),
      endDateTime: DateUtils.formatTimestamp(data.endDateTime),
    };
    return this.http.put<Task>(`${this.basePath}/updateTimes`, formattedData);
  }
}
