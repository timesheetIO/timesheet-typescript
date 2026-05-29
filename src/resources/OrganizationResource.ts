import type { ApiClient } from '../http';
import type {
  Organization,
  OrganizationCreateRequest,
  OrganizationListParams,
  OrganizationMember,
  OrganizationMemberCreateRequest,
  OrganizationMemberListParams,
  OrganizationMemberUpdateRequest,
  OrganizationUpdateRequest,
  Page,
} from '../models';
import { NavigablePage } from '../models';
import { Resource } from './Resource';

/**
 * Resource for managing organizations and their members.
 */
export class OrganizationResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/organizations');
  }

  /**
   * Sends only basic filters supported by the GET endpoint; use search() for advanced filtering.
   */
  async list(params?: OrganizationListParams): Promise<NavigablePage<Organization>> {
    const query = params
      ? {
          sort: params.sort,
          order: params.order,
          page: params.page,
          limit: params.limit,
          permission: params.permission,
        }
      : undefined;
    const response = await this.http.get<Page<Organization>>(this.basePath, query);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }

  async create(data: OrganizationCreateRequest): Promise<Organization> {
    return this.http.post<Organization>(this.basePath, data);
  }

  async update(id: string, data: OrganizationUpdateRequest): Promise<Organization> {
    return this.http.put<Organization>(`${this.basePath}/${encodeURIComponent(id)}`, data);
  }

  async get(id: string): Promise<Organization> {
    return this.http.get<Organization>(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  async delete(id: string): Promise<void> {
    return this.http.delete(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  /**
   * Search organizations with parameters using POST
   * @param params Search parameters
   */
  async search(params: OrganizationListParams): Promise<NavigablePage<Organization>> {
    const response = await this.http.post<Page<Organization>>(`${this.basePath}/search`, params);
    return this.createNavigablePage(response, (page) => this.search({ ...params, page }));
  }

  /**
   * List members of an organization
   */
  async listMembers(
    organizationId: string,
    params?: OrganizationMemberListParams,
  ): Promise<NavigablePage<OrganizationMember>> {
    const response = await this.http.post<Page<OrganizationMember>>(
      `${this.basePath}/${encodeURIComponent(organizationId)}/members/list`,
      params,
    );
    return this.createNavigablePage(response, (page) =>
      this.listMembers(organizationId, { ...params, page }),
    );
  }

  /**
   * Get a specific member of an organization
   */
  async getMember(organizationId: string, permissionId: string): Promise<OrganizationMember> {
    return this.http.get<OrganizationMember>(
      `${this.basePath}/${encodeURIComponent(organizationId)}/members/${encodeURIComponent(permissionId)}`,
    );
  }

  /**
   * Add a member to an organization
   */
  async addMember(
    organizationId: string,
    data: OrganizationMemberCreateRequest,
  ): Promise<OrganizationMember> {
    return this.http.post<OrganizationMember>(
      `${this.basePath}/${encodeURIComponent(organizationId)}/members`,
      data,
    );
  }

  /**
   * Update a member's permissions in an organization
   */
  async updateMember(
    organizationId: string,
    permissionId: string,
    data: OrganizationMemberUpdateRequest,
  ): Promise<OrganizationMember> {
    return this.http.put<OrganizationMember>(
      `${this.basePath}/${encodeURIComponent(organizationId)}/members/${encodeURIComponent(permissionId)}`,
      data,
    );
  }

  /**
   * Remove a member from an organization
   */
  async removeMember(organizationId: string, permissionId: string): Promise<void> {
    return this.http.delete(
      `${this.basePath}/${encodeURIComponent(organizationId)}/members/${encodeURIComponent(permissionId)}`,
    );
  }

  /**
   * Permanently delete an invited organization member and their profile.
   * The member must still be in invited status (account not yet activated).
   */
  async removeInvitedMember(organizationId: string, permissionId: string): Promise<void> {
    return this.http.delete(
      `${this.basePath}/${encodeURIComponent(organizationId)}/members/${encodeURIComponent(permissionId)}/invited`,
    );
  }
}
