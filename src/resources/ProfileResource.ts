import { ApiClient } from '../http';
import {
  Profile,
  ProfileUpdateRequest,
  ProfileDeleteRequest
} from '../models/Profile';

export class ProfileResource {
  constructor(private readonly client: ApiClient) {}
  
  async getMe(): Promise<Profile> {
    return this.client.get<Profile>('/v1/profiles/me');
  }
  
  async updateMe(data: ProfileUpdateRequest): Promise<Profile> {
    return this.client.put<Profile>('/v1/profiles/me', data);
  }
  
  async deleteAccount(data: ProfileDeleteRequest): Promise<void> {
    return this.client.post('/v1/profiles/deleteAccount', data);
  }
  
  async deleteData(data: ProfileDeleteRequest): Promise<void> {
    return this.client.post('/v1/profiles/deleteData', data);
  }
}
