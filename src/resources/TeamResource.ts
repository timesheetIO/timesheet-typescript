import { ApiClient } from '../http';
import { Page, NavigablePage } from '../models';
import {
  Team,
  TeamMember,
  TeamCreateRequest,
  TeamUpdateRequest,
  TeamMemberCreateRequest,
  TeamMemberUpdateRequest,
  TeamListParams,
  TeamSearchParams,
  TeamActivateRequest
} from '../models/Team';

export class TeamResource {
  constructor(private readonly client: ApiClient) {}
  
  async list(params?: TeamListParams): Promise<NavigablePage<Team>> {
    const response = await this.client.get<Page<Team>>('/v1/teams', params);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }
  
  async create(data: TeamCreateRequest): Promise<Team> {
    return this.client.post<Team>('/v1/teams', data);
  }
  
  async get(id: string): Promise<Team> {
    return this.client.get<Team>(`/v1/teams/${id}`);
  }
  
  async update(id: string, data: TeamUpdateRequest): Promise<Team> {
    return this.client.put<Team>(`/v1/teams/${id}`, data);
  }
  
  async delete(id: string): Promise<void> {
    return this.client.delete(`/v1/teams/${id}`);
  }
  
  async search(params: TeamSearchParams): Promise<NavigablePage<Team>> {
    const response = await this.client.post<Page<Team>>('/v1/teams/search', params);
    return new NavigablePage(response, (page) => this.search({ ...params, page }));
  }
  
  async listMembers(teamId: string, params?: TeamListParams): Promise<NavigablePage<TeamMember>> {
    const response = await this.client.get<Page<TeamMember>>(`/v1/teams/${teamId}/members`, params);
    return new NavigablePage(response, (page) => this.listMembers(teamId, { ...params, page }));
  }
  
  async addMember(teamId: string, data: TeamMemberCreateRequest): Promise<TeamMember> {
    return this.client.post<TeamMember>(`/v1/teams/${teamId}/members`, data);
  }
  
  async updateMember(teamId: string, memberId: string, data: TeamMemberUpdateRequest): Promise<TeamMember> {
    return this.client.put<TeamMember>(`/v1/teams/${teamId}/members/${memberId}`, data);
  }
  
  async removeMember(teamId: string, memberId: string): Promise<void> {
    return this.client.delete(`/v1/teams/${teamId}/members/${memberId}`);
  }
  
  async activate(data: TeamActivateRequest): Promise<Team> {
    return this.client.post<Team>(`/v1/teams/activate/${data.teamName}`, {});
  }
  
  async getColleagues(): Promise<NavigablePage<TeamMember>> {
    const response = await this.client.get<Page<TeamMember>>('/v1/teams/getColleagues');
    return new NavigablePage(response);
  }
}
