import type { ApiClient } from '../http';
import type {
  Page,
  Project,
  ProjectCreateRequest,
  ProjectListParams,
  ProjectUpdateRequest,
} from '../models';
import { NavigablePage } from '../models';
import { Resource } from './Resource';

export class ProjectResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/projects');
  }

  async list(params?: ProjectListParams): Promise<NavigablePage<Project>> {
    const response = await this.http.get<Page<Project>>(this.basePath, params);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }

  async create(data: ProjectCreateRequest): Promise<Project> {
    return this.http.post<Project>(this.basePath, data);
  }

  async update(id: string, data: ProjectUpdateRequest): Promise<Project> {
    return this.http.put<Project>(`${this.basePath}/${encodeURIComponent(id)}`, data);
  }

  async get(id: string): Promise<Project> {
    return this.http.get<Project>(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  async delete(id: string): Promise<void> {
    return this.http.delete(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  /**
   * Search projects with parameters using POST
   * @param params Search parameters
   */
  async search(params: ProjectListParams): Promise<NavigablePage<Project>> {
    const response = await this.http.post<Page<Project>>(`${this.basePath}/search`, params);
    return this.createNavigablePage(response, (page) => this.search({ ...params, page }));
  }
}
