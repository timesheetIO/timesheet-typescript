import { PageParams, SearchParams, SortablePageParams } from './common';

export interface Tag {
  id: string;
  name: string;
  color?: string;
  teamId?: string;
  archived?: boolean;
  created?: number;
  lastUpdate?: number;
}

export interface TagCreateRequest {
  name: string;
  color?: string;
  teamId?: string;
}

export interface TagUpdateRequest {
  name?: string;
  color?: string;
  archived?: boolean;
}

export interface TagListParams extends SortablePageParams {
  teamId?: string;
  archived?: boolean;
}

export interface TagSearchParams extends SearchParams {
  name?: string;
  teamId?: string;
  archived?: boolean;
}
