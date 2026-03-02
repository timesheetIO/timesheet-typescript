import type { ApiClient } from '../http';
import type { Profile, ProfileUpdateRequest } from '../models';

export class ProfileResource {
  constructor(private readonly http: ApiClient) {}

  async getProfile(): Promise<Profile> {
    return this.http.get<Profile>('/v1/profiles/me');
  }

  async updateProfile(data: ProfileUpdateRequest): Promise<Profile> {
    return this.http.put<Profile>('/v1/profiles/me', data);
  }
}
