import type { ApiClient } from '../http';
import type {
  Page,
  Pause,
  PauseCreateRequest,
  PauseListParams,
  PauseUpdateRequest,
} from '../models';
import { NavigablePage } from '../models';
import { DateUtils } from '../utils/date';
import { Resource } from './Resource';

export class PauseResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/pauses');
  }

  async list(params?: PauseListParams): Promise<NavigablePage<Pause>> {
    const response = await this.http.get<Page<Pause>>(this.basePath, params);
    return new NavigablePage(response, (page) => this.list({ ...params, page }));
  }

  async create(data: PauseCreateRequest): Promise<Pause> {
    const formattedData = {
      ...data,
      startDateTime: DateUtils.formatTimestamp(data.startDateTime),
      endDateTime: DateUtils.formatTimestamp(data.endDateTime),
    };
    return this.http.post<Pause>(this.basePath, formattedData);
  }

  async update(id: string, data: PauseUpdateRequest): Promise<Pause> {
    const formattedData = {
      ...data,
      startDateTime: DateUtils.formatTimestamp(data.startDateTime),
      endDateTime: DateUtils.formatTimestamp(data.endDateTime),
    };
    return this.http.put<Pause>(`${this.basePath}/${encodeURIComponent(id)}`, formattedData);
  }

  async get(id: string): Promise<Pause> {
    return this.http.get<Pause>(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  async delete(id: string): Promise<void> {
    return this.http.delete(`${this.basePath}/${encodeURIComponent(id)}`);
  }

  /**
   * Search pauses with parameters using POST
   * @param params Search parameters
   */
  async search(params: PauseListParams): Promise<NavigablePage<Pause>> {
    const response = await this.http.post<Page<Pause>>(`${this.basePath}/search`, params);
    return this.createNavigablePage(response, (page) => this.search({ ...params, page }));
  }
}
