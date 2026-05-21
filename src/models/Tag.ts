import type { PageParams } from './common';
import type { Team } from './Team';

export interface Tag {
  id: string;
  name: string;
  color?: number;
  team?: Team;
  archived?: boolean;
  totalTime?: number;
  created?: number;
  lastUpdate?: number;
}

export interface TagList {
  items: Tag[];
  params: TagListParams;
}

export interface TagCreateRequest {
  name: string;
  color?: number;
  teamId?: string;
  archived?: boolean;
}

export interface TagUpdateRequest {
  name?: string;
  color?: number;
  archived?: boolean;
}

export interface TagListParams extends PageParams {
  teamId?: string;
  projectId?: string;
  status?: 'all' | 'active' | 'inactive';
  sort?: 'alpha' | 'status' | 'created';
  order?: 'asc' | 'desc';
  tagIds?: string[];
  empty?: boolean;
}
