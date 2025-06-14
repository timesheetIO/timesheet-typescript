import type { ApiClient } from '../http';
import type {
  Organization,
  OrganizationCreateRequest,
  OrganizationListParams,
  OrganizationUpdateRequest,
  Page,
} from '../models';
import { NavigablePage } from '../models';
import { Resource } from './Resource';

/**
 * Resource for managing organizations.
 */
export class OrganizationResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/organizations');
  }

  async list(params?: OrganizationListParams): Promise<NavigablePage<Organization>> {
    const response = await this.http.get<Page<Organization>, OrganizationListParams>(
      this.basePath,
      params,
    );
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
}
