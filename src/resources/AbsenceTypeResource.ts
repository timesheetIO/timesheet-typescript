import type { ApiClient } from '../http';
import type {
  AbsenceType,
  AbsenceTypeCreateRequest,
  AbsenceTypeListParams,
  AbsenceTypeUpdateRequest,
  Page,
} from '../models';
import type { NavigablePage } from '../models';
import { Resource } from './Resource';

/**
 * Resource for managing absence types within an organization.
 */
export class AbsenceTypeResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/organizations');
  }

  private orgPath(organizationId: string): string {
    return `${this.basePath}/${encodeURIComponent(organizationId)}/absence-types`;
  }

  async list(
    organizationId: string,
    params?: AbsenceTypeListParams,
  ): Promise<NavigablePage<AbsenceType>> {
    const response = await this.http.get<Page<AbsenceType>, AbsenceTypeListParams>(
      this.orgPath(organizationId),
      params,
    );
    return this.createNavigablePage(response, (page) =>
      this.list(organizationId, { ...params, page }),
    );
  }

  async create(organizationId: string, data: AbsenceTypeCreateRequest): Promise<AbsenceType> {
    return this.http.post<AbsenceType>(this.orgPath(organizationId), data);
  }

  async get(organizationId: string, id: string): Promise<AbsenceType> {
    return this.http.get<AbsenceType>(`${this.orgPath(organizationId)}/${encodeURIComponent(id)}`);
  }

  async update(
    organizationId: string,
    id: string,
    data: AbsenceTypeUpdateRequest,
  ): Promise<AbsenceType> {
    return this.http.put<AbsenceType>(
      `${this.orgPath(organizationId)}/${encodeURIComponent(id)}`,
      data,
    );
  }

  async delete(organizationId: string, id: string): Promise<void> {
    return this.http.delete(`${this.orgPath(organizationId)}/${encodeURIComponent(id)}`);
  }
}
