import type { ApiClient } from '../http';
import type {
  ContractTemplate,
  ContractTemplateCreateRequest,
  ContractTemplateListParams,
  ContractTemplateUpdateRequest,
  Page,
} from '../models';
import { NavigablePage } from '../models';
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

  async list(
    organizationId: string,
    params?: ContractTemplateListParams,
  ): Promise<NavigablePage<ContractTemplate>> {
    const response = await this.http.get<
      Page<ContractTemplate>,
      ContractTemplateListParams
    >(this.orgPath(organizationId), params);
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
    return this.http.delete(
      `${this.orgPath(organizationId)}/${encodeURIComponent(id)}`,
    );
  }
}
