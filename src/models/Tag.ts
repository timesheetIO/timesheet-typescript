import type { PageParams } from './common';

export interface Tag {
  id: string;
  name: string;
  color?: number;
  teamId?: string;
  archived?: boolean;
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
  statistics?: boolean;
  sort?: 'alpha' | 'status' | 'created';
  order?: 'asc' | 'desc';
}
