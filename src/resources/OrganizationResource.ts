import { ApiClient } from '../http';
import { Page, NavigablePage } from '../models';
import {
  Organization,
  OrganizationMember,
  OrganizationCreateRequest,
  OrganizationUpdateRequest,
  OrganizationMemberCreateRequest,
  OrganizationMemberUpdateRequest,
  OrganizationListParams,
  OrganizationSearchParams
} from '../models/Organization';

/**
 * Resource for managing organizations.
 */
export class OrganizationResource {
  constructor(private readonly client: ApiClient) {}
  
  /**
   * List organizations.
   * 
   * @param params Optional list parameters
   * @returns A page of organizations
   */
  async list(params?: OrganizationListParams): Promise<NavigablePage<Organization>> {
    const response = await this.client.get<Page<Organization>>('/v1/organizations', params);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }
  
  /**
   * Create an organization.
   * 
   * @param data Organization creation data
   * @returns The created organization
   */
  async create(data: OrganizationCreateRequest): Promise<Organization> {
    return this.client.post<Organization>('/v1/organizations', data);
  }
  
  /**
   * Get an organization by ID.
   * 
   * @param id Organization ID
   * @returns The organization
   */
  async get(id: string): Promise<Organization> {
    return this.client.get<Organization>(`/v1/organizations/${id}`);
  }
  
  /**
   * Update an organization.
   * 
   * @param id Organization ID
   * @param data Update data
   * @returns The updated organization
   */
  async update(id: string, data: OrganizationUpdateRequest): Promise<Organization> {
    return this.client.put<Organization>(`/v1/organizations/${id}`, data);
  }
  
  /**
   * Delete an organization.
   * 
   * @param id Organization ID
   */
  async delete(id: string): Promise<void> {
    return this.client.delete(`/v1/organizations/${id}`);
  }
  
  /**
   * Search organizations.
   * 
   * @param params Search parameters
   * @returns A page of organizations
   */
  async search(params: OrganizationSearchParams): Promise<NavigablePage<Organization>> {
    const response = await this.client.post<Page<Organization>>('/v1/organizations/search', params);
    return new NavigablePage(response, (page) => this.search({ ...params, page }));
  }
  
  /**
   * List organization members.
   * 
   * @param organizationId Organization ID
   * @param params Optional list parameters
   * @returns A page of organization members
   */
  async listMembers(organizationId: string, params?: OrganizationListParams): Promise<NavigablePage<OrganizationMember>> {
    const response = await this.client.get<Page<OrganizationMember>>(`/v1/organizations/${organizationId}/members`, params);
    return new NavigablePage(response, (page) => this.listMembers(organizationId, { ...params, page }));
  }
  
  /**
   * Add a member to an organization.
   * 
   * @param organizationId Organization ID
   * @param data Member data
   * @returns The added member
   */
  async addMember(organizationId: string, data: OrganizationMemberCreateRequest): Promise<OrganizationMember> {
    return this.client.post<OrganizationMember>(`/v1/organizations/${organizationId}/members`, data);
  }
  
  /**
   * Update organization member permissions.
   * 
   * @param organizationId Organization ID
   * @param memberId Member ID
   * @param data Update data
   * @returns The updated member
   */
  async updateMember(organizationId: string, memberId: string, data: OrganizationMemberUpdateRequest): Promise<OrganizationMember> {
    return this.client.put<OrganizationMember>(`/v1/organizations/${organizationId}/members/${memberId}`, data);
  }
  
  /**
   * Remove a member from an organization.
   * 
   * @param organizationId Organization ID
   * @param memberId Member ID
   */
  async removeMember(organizationId: string, memberId: string): Promise<void> {
    return this.client.delete(`/v1/organizations/${organizationId}/members/${memberId}`);
  }
} 