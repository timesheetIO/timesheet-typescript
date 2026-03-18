import type { ApiClient } from '../http';
import type {
  Absence,
  AbsenceCreateRequest,
  AbsenceListParams,
  AbsenceReasonRequest,
  AbsenceUpdateRequest,
  Page,
} from '../models';
import { NavigablePage } from '../models';
import { Resource } from './Resource';

/**
 * Resource for managing absences within an organization.
 *
 * All methods require an organizationId since absences are scoped to organizations.
 */
export class AbsenceResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/organizations');
  }

  private orgPath(organizationId: string): string {
    return `${this.basePath}/${encodeURIComponent(organizationId)}/absences`;
  }

  async list(
    organizationId: string,
    params?: AbsenceListParams,
  ): Promise<NavigablePage<Absence>> {
    const response = await this.http.get<Page<Absence>, AbsenceListParams>(
      this.orgPath(organizationId),
      params,
    );
    return this.createNavigablePage(response, (page) =>
      this.list(organizationId, { ...params, page }),
    );
  }

  async search(
    organizationId: string,
    params: AbsenceListParams,
  ): Promise<NavigablePage<Absence>> {
    const response = await this.http.post<Page<Absence>>(
      `${this.orgPath(organizationId)}/search`,
      params,
    );
    return this.createNavigablePage(response, (page) =>
      this.search(organizationId, { ...params, page }),
    );
  }

  async create(organizationId: string, data: AbsenceCreateRequest): Promise<Absence> {
    return this.http.post<Absence>(this.orgPath(organizationId), data);
  }

  async get(organizationId: string, id: string): Promise<Absence> {
    return this.http.get<Absence>(
      `${this.orgPath(organizationId)}/${encodeURIComponent(id)}`,
    );
  }

  async update(
    organizationId: string,
    id: string,
    data: AbsenceUpdateRequest,
  ): Promise<Absence> {
    return this.http.put<Absence>(
      `${this.orgPath(organizationId)}/${encodeURIComponent(id)}`,
      data,
    );
  }

  async delete(organizationId: string, id: string): Promise<void> {
    return this.http.delete(
      `${this.orgPath(organizationId)}/${encodeURIComponent(id)}`,
    );
  }

  async approve(organizationId: string, id: string): Promise<Absence> {
    return this.http.post<Absence>(
      `${this.orgPath(organizationId)}/${encodeURIComponent(id)}/approve`,
    );
  }

  async reject(
    organizationId: string,
    id: string,
    data: AbsenceReasonRequest,
  ): Promise<Absence> {
    return this.http.post<Absence>(
      `${this.orgPath(organizationId)}/${encodeURIComponent(id)}/reject`,
      data,
    );
  }

  async cancel(
    organizationId: string,
    id: string,
    data: AbsenceReasonRequest,
  ): Promise<Absence> {
    return this.http.post<Absence>(
      `${this.orgPath(organizationId)}/${encodeURIComponent(id)}/cancel`,
      data,
    );
  }
}
