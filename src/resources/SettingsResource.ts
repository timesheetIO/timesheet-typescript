import { ApiClient } from '../http';
import {
  Settings,
  SettingsUpdateRequest
} from '../models/Settings';

export class SettingsResource {
  constructor(private readonly client: ApiClient) {}
  
  async get(): Promise<Settings> {
    return this.client.get<Settings>('/v1/settings');
  }
  
  async update(data: SettingsUpdateRequest): Promise<Settings> {
    return this.client.put<Settings>('/v1/settings', data);
  }
}
