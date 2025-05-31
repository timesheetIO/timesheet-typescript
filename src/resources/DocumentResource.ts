import { ApiClient } from '../http';
import { Page, NavigablePage } from '../models';
import {
  Document,
  DocumentCreateRequest,
  DocumentUpdateRequest,
  DocumentPrintRequest,
  DocumentListParams,
  DocumentSearchParams
} from '../models/Document';

export class DocumentResource {
  constructor(private readonly client: ApiClient) {}
  
  async list(params?: DocumentListParams): Promise<NavigablePage<Document>> {
    const response = await this.client.get<Page<Document>>('/v1/documents', params);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }
  
  async create(data: DocumentCreateRequest): Promise<Document> {
    return this.client.post<Document>('/v1/documents', data);
  }
  
  async get(id: string): Promise<Document> {
    return this.client.get<Document>(`/v1/documents/${id}`);
  }
  
  async update(id: string, data: DocumentUpdateRequest): Promise<Document> {
    return this.client.put<Document>(`/v1/documents/${id}`, data);
  }
  
  async delete(id: string): Promise<void> {
    return this.client.delete(`/v1/documents/${id}`);
  }
  
  async search(params: DocumentSearchParams): Promise<NavigablePage<Document>> {
    const response = await this.client.post<Page<Document>>('/v1/documents/search', params);
    return new NavigablePage(response, (page) => this.search({ ...params, page }));
  }
  
  async print(data: DocumentPrintRequest): Promise<Blob> {
    const response = await this.client.post('/v1/documents/print', data, {
      responseType: 'blob'
    });
    return response as Blob;
  }
}
