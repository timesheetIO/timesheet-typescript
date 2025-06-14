import type { ListParams } from './common';
import type { Team } from './Team';

export interface Rate {
  id: string;
  user?: string;
  lastUpdate?: number;
  created?: number;
  deleted?: boolean;
  title: string;
  factor: number;
  extra?: number;
  enabled?: boolean;
  archived?: boolean;
  team?: Team;
}

export interface RateList {
  items: Rate[];
  params: RateListParams;
}

export interface RateCreateRequest {
  title: string;
  factor: number;
  extra?: number;
  enabled?: boolean;
  archived?: boolean;
  teamId?: string;
}

export interface RateUpdateRequest {
  title?: string;
  factor?: number;
  extra?: number;
  enabled?: boolean;
  archived?: boolean;
  deleted?: boolean;
}

export interface RateListParams extends ListParams {
  teamId?: string;
  projectId?: string;
  status?: 'all' | 'active' | 'inactive';
  sort?: 'alpha' | 'status' | 'created';
  order?: 'asc' | 'desc';
}
