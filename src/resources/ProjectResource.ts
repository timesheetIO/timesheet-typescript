import type { ApiClient } from '../http';
import type {
  Page,
  Project,
  ProjectCreateRequest,
  ProjectListParams,
  ProjectMember,
  ProjectMemberCreateRequest,
  ProjectMemberListParams,
  ProjectMemberUpdateRequest,
  ProjectRegistration,
  ProjectUpdateRequest,
} from '../models';
import { NavigablePage } from '../models';
import { Resource } from './Resource';

export class ProjectResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/projects');
  }

  async list(params?: ProjectListParams): Promise<NavigablePage<Project>> {
    const response = await this.http.get<Page<Project>, ProjectListParams>(this.basePath, params);
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

  /**
   * List members of a project.
   * @param projectId Project identifier
   * @param params Filter, pagination, and sorting parameters
   */
  async listMembers(
    projectId: string,
    params: ProjectMemberListParams,
  ): Promise<NavigablePage<ProjectMember>> {
    const response = await this.http.post<Page<ProjectMember>>(
      `${this.basePath}/${encodeURIComponent(projectId)}/members/list`,
      params,
    );
    return this.createNavigablePage(response, (page) =>
      this.listMembers(projectId, { ...params, page }),
    );
  }

  /**
   * Add a member to a project. The user must already belong to the
   * associated team if the project belongs to a team.
   * @param projectId Project identifier
   * @param data Member details including user identifier and permission level
   */
  async addMember(projectId: string, data: ProjectMemberCreateRequest): Promise<ProjectMember> {
    return this.http.post<ProjectMember>(
      `${this.basePath}/${encodeURIComponent(projectId)}/members`,
      data,
    );
  }

  /**
   * Get a single project member.
   * @param projectId Project identifier
   * @param memberId Project member identifier
   */
  async getMember(projectId: string, memberId: string): Promise<ProjectMember> {
    return this.http.get<ProjectMember>(
      `${this.basePath}/${encodeURIComponent(projectId)}/members/${encodeURIComponent(memberId)}`,
    );
  }

  /**
   * Update a project member's permission level.
   * @param projectId Project identifier
   * @param memberId Project member identifier
   * @param data Updated member details
   */
  async updateMember(
    projectId: string,
    memberId: string,
    data: ProjectMemberUpdateRequest,
  ): Promise<ProjectMember> {
    return this.http.put<ProjectMember>(
      `${this.basePath}/${encodeURIComponent(projectId)}/members/${encodeURIComponent(memberId)}`,
      data,
    );
  }

  /**
   * Replace the full member list of a project. Members not included in the
   * registration list are removed. The project owner cannot be removed or
   * downgraded through this endpoint.
   * @param projectId Project identifier
   * @param registrations Full set of project member registrations
   */
  async updateMembers(projectId: string, registrations: ProjectRegistration[]): Promise<void> {
    return this.http.put<void>(
      `${this.basePath}/${encodeURIComponent(projectId)}/members`,
      registrations,
    );
  }

  /**
   * Remove a member from a project.
   * @param projectId Project identifier
   * @param memberId Project member identifier
   */
  async removeMember(projectId: string, memberId: string): Promise<void> {
    return this.http.delete<void>(
      `${this.basePath}/${encodeURIComponent(projectId)}/members/${encodeURIComponent(memberId)}`,
    );
  }

  /**
   * Add multiple members to a project in a single operation.
   * @param projectId Project identifier
   * @param members Member creation objects
   */
  async batchAddMembers(projectId: string, members: ProjectMemberCreateRequest[]): Promise<void> {
    return this.http.post<void>(
      `${this.basePath}/${encodeURIComponent(projectId)}/members/batch`,
      members,
    );
  }

  /**
   * Remove multiple members from a project in a single operation.
   * @param projectId Project identifier
   * @param memberIds Identifiers of the project members to remove
   */
  async batchRemoveMembers(projectId: string, memberIds: string[]): Promise<void> {
    return this.http.delete<void>(
      `${this.basePath}/${encodeURIComponent(projectId)}/members/batch`,
      undefined,
      memberIds,
    );
  }
}
