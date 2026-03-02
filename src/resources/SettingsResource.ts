import type { ApiClient } from '../http';
import type { Settings, SettingsUpdateRequest } from '../models';

export class SettingsResource {
  constructor(private readonly http: ApiClient) {}

  async get(): Promise<Settings> {
    return this.http.get<Settings>('/v1/settings');
  }

  async update(data: SettingsUpdateRequest): Promise<Settings> {
    return this.http.put<Settings>('/v1/settings', data);
  }
}
