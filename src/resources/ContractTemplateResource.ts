import type { ApiClient } from '../http';
import type {
  ContractTemplate,
  ContractTemplateCreateRequest,
  ContractTemplateListParams,
  ContractTemplateUpdateRequest,
  Page,
} from '../models';
import type { NavigablePage } from '../models';
import { Resource } from './Resource';

/**
 * Resource for managing contract templates within an organization.
 */
export class ContractTemplateResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/organizations');
  }

  private orgPath(organizationId: string): string {
    return `${this.basePath}/${encodeURIComponent(organizationId)}/contract-templates`;
  }

  /**
   * These are the only filters this endpoint supports.
   */
  async list(
    organizationId: string,
    params?: ContractTemplateListParams,
  ): Promise<NavigablePage<ContractTemplate>> {
    const query = params
      ? {
          sort: params.sort,
          order: params.order,
          page: params.page,
          limit: params.limit,
        }
      : undefined;
    const response = await this.http.get<Page<ContractTemplate>>(
      this.orgPath(organizationId),
      query,
    );
    return this.createNavigablePage(response, (page) =>
      this.list(organizationId, { ...params, page }),
    );
  }

  async create(
    organizationId: string,
    data: ContractTemplateCreateRequest,
  ): Promise<ContractTemplate> {
    return this.http.post<ContractTemplate>(this.orgPath(organizationId), data);
  }

  async get(organizationId: string, id: string): Promise<ContractTemplate> {
    return this.http.get<ContractTemplate>(
      `${this.orgPath(organizationId)}/${encodeURIComponent(id)}`,
    );
  }

  async update(
    organizationId: string,
    id: string,
    data: ContractTemplateUpdateRequest,
  ): Promise<ContractTemplate> {
    return this.http.put<ContractTemplate>(
      `${this.orgPath(organizationId)}/${encodeURIComponent(id)}`,
      data,
    );
  }

  async delete(organizationId: string, id: string): Promise<void> {
    return this.http.delete(`${this.orgPath(organizationId)}/${encodeURIComponent(id)}`);
  }
}
