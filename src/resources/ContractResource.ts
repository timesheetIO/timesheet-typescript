import type { ApiClient } from '../http';
import type {
  Contract,
  ContractCreateRequest,
  ContractListParams,
  ContractUpdateRequest,
  Page,
} from '../models';
import type { NavigablePage } from '../models';
import { Resource } from './Resource';

/**
 * Resource for managing contracts within an organization.
 */
export class ContractResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/organizations');
  }

  private orgPath(organizationId: string): string {
    return `${this.basePath}/${encodeURIComponent(organizationId)}/contracts`;
  }

  async list(
    organizationId: string,
    params?: ContractListParams,
  ): Promise<NavigablePage<Contract>> {
    const response = await this.http.get<Page<Contract>, ContractListParams>(
      this.orgPath(organizationId),
      params,
    );
    return this.createNavigablePage(response, (page) =>
      this.list(organizationId, { ...params, page }),
    );
  }

  async create(organizationId: string, data: ContractCreateRequest): Promise<Contract> {
    return this.http.post<Contract>(this.orgPath(organizationId), data);
  }

  async get(organizationId: string, id: string): Promise<Contract> {
    return this.http.get<Contract>(`${this.orgPath(organizationId)}/${encodeURIComponent(id)}`);
  }

  async update(organizationId: string, id: string, data: ContractUpdateRequest): Promise<Contract> {
    return this.http.put<Contract>(
      `${this.orgPath(organizationId)}/${encodeURIComponent(id)}`,
      data,
    );
  }

  async delete(organizationId: string, id: string): Promise<void> {
    return this.http.delete(`${this.orgPath(organizationId)}/${encodeURIComponent(id)}`);
  }

  /**
   * Activate a contract
   */
  async activate(organizationId: string, id: string): Promise<Contract> {
    return this.http.put<Contract>(
      `${this.orgPath(organizationId)}/${encodeURIComponent(id)}/activate`,
    );
  }

  /**
   * Suspend a contract
   */
  async suspend(organizationId: string, id: string): Promise<Contract> {
    return this.http.put<Contract>(
      `${this.orgPath(organizationId)}/${encodeURIComponent(id)}/suspend`,
    );
  }

  /**
   * Reactivate a suspended contract
   */
  async reactivate(organizationId: string, id: string): Promise<Contract> {
    return this.http.put<Contract>(
      `${this.orgPath(organizationId)}/${encodeURIComponent(id)}/reactivate`,
    );
  }

  /**
   * Terminate a contract
   */
  async terminate(organizationId: string, id: string): Promise<Contract> {
    return this.http.put<Contract>(
      `${this.orgPath(organizationId)}/${encodeURIComponent(id)}/terminate`,
    );
  }
}
