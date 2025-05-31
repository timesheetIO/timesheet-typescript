import { ApiClient } from '../http';
import { Page, NavigablePage } from '../models';
import {
  Project,
  ProjectMember,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectMemberCreateRequest,
  ProjectListParams,
  ProjectSearchParams
} from '../models/Project';

export class ProjectResource {
  constructor(private readonly client: ApiClient) {}
  
  async list(params?: ProjectListParams): Promise<NavigablePage<Project>> {
    const response = await this.client.get<Page<Project>>('/v1/projects', params);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }
  
  async create(data: ProjectCreateRequest): Promise<Project> {
    return this.client.post<Project>('/v1/projects', data);
  }
  
  async get(id: string): Promise<Project> {
    return this.client.get<Project>(`/v1/projects/${id}`);
  }
  
  async update(id: string, data: ProjectUpdateRequest): Promise<Project> {
    return this.client.put<Project>(`/v1/projects/${id}`, data);
  }
  
  async delete(id: string): Promise<void> {
    return this.client.delete(`/v1/projects/${id}`);
  }
  
  async search(params: ProjectSearchParams): Promise<NavigablePage<Project>> {
    const response = await this.client.post<Page<Project>>('/v1/projects/search', params);
    return new NavigablePage(response, (page) => this.search({ ...params, page }));
  }
  
  async listMembers(projectId: string, params?: ProjectListParams): Promise<NavigablePage<ProjectMember>> {
    const response = await this.client.get<Page<ProjectMember>>(`/v1/projects/${projectId}/members`, params);
    return new NavigablePage(response, (page) => this.listMembers(projectId, { ...params, page }));
  }
  
  async addMember(projectId: string, data: ProjectMemberCreateRequest): Promise<ProjectMember> {
    return this.client.post<ProjectMember>(`/v1/projects/${projectId}/members`, data);
  }
}
