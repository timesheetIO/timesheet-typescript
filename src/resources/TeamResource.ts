import type { ApiClient } from '../http';
import type {
  Page,
  Team,
  TeamCreateRequest,
  TeamListParams,
  TeamMember,
  TeamMemberListParams,
  TeamUpdateRequest,
} from '../models';
import { NavigablePage } from '../models';
import { Resource } from './Resource';

export class TeamResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/teams');
  }

  async list(params?: TeamListParams): Promise<NavigablePage<Team>> {
    const response = await this.http.get<Page<Team>>(this.basePath, params);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }

  async create(data: TeamCreateRequest): Promise<Team> {
    return this.http.post<Team>(this.basePath, data);
  }

  async update(id: string, data: TeamUpdateRequest): Promise<Team> {
    return this.http.put<Team>(`${this.basePath}/${encodeURIComponent(id)}`, data);
  }

  async get(id: string): Promise<Team> {
    return this.http.get<Team>(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  async delete(id: string): Promise<void> {
    return this.http.delete(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  /**
   * Search teams with parameters using POST
   * @param params Search parameters
   */
  async search(params: TeamListParams): Promise<NavigablePage<Team>> {
    const response = await this.http.post<Page<Team>>(`${this.basePath}/search`, params);
    return this.createNavigablePage(response, (page) => this.search({ ...params, page }));
  }

  /**
   * List team members
   * @param teamId Team identifier
   * @param params List parameters
   */
  async listMembers(
    teamId: string,
    params: TeamMemberListParams,
  ): Promise<NavigablePage<TeamMember>> {
    const response = await this.http.post<Page<TeamMember>>(
      `${this.basePath}/${teamId}/members/list`,
      params,
    );
    return this.createNavigablePage(response, (page) =>
      this.listMembers(teamId, { ...params, page }),
    );
  }

  /**
   * Get team member
   * @param teamId Team identifier
   * @param memberId Member identifier
   */
  async getMember(teamId: string, memberId: string): Promise<TeamMember> {
    return this.http.get<TeamMember>(`${this.basePath}/${teamId}/members/${memberId}`);
  }

  /**
   * Get colleagues
   * @param params Parameters for filtering colleagues
   */
  async getColleagues(params?: TeamMemberListParams): Promise<NavigablePage<TeamMember>> {
    const response = await this.http.post<Page<TeamMember>>(
      `${this.basePath}/getColleagues`,
      params,
    );
    return this.createNavigablePage(response, (page) => this.getColleagues({ ...params, page }));
  }
}
