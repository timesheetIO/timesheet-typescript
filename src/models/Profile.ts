export interface Profile {
  uid: string;
  firstname: string;
  lastname: string;
  email: string;
  image?: string;
  timezone?: string;
  language?: string;
  currency?: string;
  created?: number;
  lastUpdate?: number;
}

export interface ProfileUpdateRequest {
  firstname?: string;
  lastname?: string;
  image?: string;
  timezone?: string;
  language?: string;
  currency?: string;
}

export interface ProfileDeleteRequest {
  password: string;
  reason?: string;
}
