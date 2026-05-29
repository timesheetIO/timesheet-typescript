import type { ApiClient } from '../http';
import type {
  Document,
  DocumentCreateRequest,
  DocumentListParams,
  DocumentUpdateRequest,
  Page,
} from '../models';
import { NavigablePage } from '../models';
import { Resource } from './Resource';

export class DocumentResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/documents');
  }

  /**
   * Sends only basic filters supported by the GET endpoint; use search() for advanced filtering.
   */
  async list(params?: DocumentListParams): Promise<NavigablePage<Document>> {
    const query = params
      ? {
          organizationId: params.organizationId,
          type: params.type,
          status: params.status,
          template: params.template,
          sort: params.sort,
          order: params.order,
          page: params.page,
          limit: params.limit,
        }
      : undefined;
    const response = await this.http.get<Page<Document>>(this.basePath, query);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }

  async create(data: DocumentCreateRequest): Promise<Document> {
    return this.http.post<Document>(this.basePath, data);
  }

  async update(id: string, data: DocumentUpdateRequest): Promise<Document> {
    return this.http.put<Document>(`${this.basePath}/${encodeURIComponent(id)}`, data);
  }

  async get(id: string): Promise<Document> {
    return this.http.get<Document>(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  async delete(id: string): Promise<void> {
    return this.http.delete(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  /**
   * Search documents with parameters using POST
   * @param params Search parameters
   */
  async search(params: DocumentListParams): Promise<NavigablePage<Document>> {
    const response = await this.http.post<Page<Document>>(`${this.basePath}/search`, params);
    return this.createNavigablePage(response, (page) => this.search({ ...params, page }));
  }
}
