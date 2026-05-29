import type { ApiClient } from '../http';
import type {
  Member,
  MemberStatusParams,
  Page,
  Team,
  TeamCreateRequest,
  TeamListParams,
  TeamMember,
  TeamMemberCreateRequest,
  TeamMemberListParams,
  TeamMemberUpdateRequest,
  TeamUpdateRequest,
} from '../models';
import { NavigablePage } from '../models';
import { Resource } from './Resource';

export class TeamResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/teams');
  }

  /**
   * Sends only basic filters supported by the GET endpoint; use search() for advanced filtering.
   */
  async list(params?: TeamListParams): Promise<NavigablePage<Team>> {
    const query = params
      ? {
          sort: params.sort,
          order: params.order,
          page: params.page,
          limit: params.limit,
        }
      : undefined;
    const response = await this.http.get<Page<Team>>(this.basePath, query);
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
  async getColleagues(params?: TeamMemberListParams): Promise<NavigablePage<Member>> {
    const response = await this.http.post<Page<Member>>(`${this.basePath}/getColleagues`, params);
    return this.createNavigablePage(response, (page) => this.getColleagues({ ...params, page }));
  }

  /**
   * Add (register) a member to a team.
   * @param teamId Team identifier
   * @param data Member details including email and permission level
   */
  async addMember(teamId: string, data: TeamMemberCreateRequest): Promise<TeamMember> {
    return this.http.post<TeamMember>(`${this.basePath}/${teamId}/members`, data);
  }

  /**
   * Update a team member, including permission level and project registrations.
   * @param teamId Team identifier
   * @param memberId Team member identifier
   * @param data Updated member details
   */
  async updateMember(
    teamId: string,
    memberId: string,
    data: TeamMemberUpdateRequest,
  ): Promise<TeamMember> {
    return this.http.put<TeamMember>(`${this.basePath}/${teamId}/members/${memberId}`, data);
  }

  /**
   * Remove a member from a team.
   * @param teamId Team identifier
   * @param memberId Team member identifier
   */
  async removeMember(teamId: string, memberId: string): Promise<void> {
    return this.http.delete<void>(`${this.basePath}/${teamId}/members/${memberId}`);
  }

  /**
   * Permanently delete an invited team member and their profile. The member
   * must still be in invited status (account not yet activated).
   * @param teamId Team identifier
   * @param memberId Team member identifier
   */
  async removeInvitedMember(teamId: string, memberId: string): Promise<void> {
    return this.http.delete<void>(`${this.basePath}/${teamId}/members/${memberId}/invited`);
  }

  /**
   * Get team members with their current activity status. Results are sorted
   * with currently-working members first.
   * @param params Filter parameters (organization, team, project, users, status)
   */
  async getMemberStatus(params: MemberStatusParams): Promise<NavigablePage<Member>> {
    const response = await this.http.post<Page<Member>>(`${this.basePath}/getMemberStatus`, params);
    return this.createNavigablePage(response, (page) => this.getMemberStatus({ ...params, page }));
  }
}
