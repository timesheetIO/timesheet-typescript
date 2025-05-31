import { PageParams, SearchParams, SortablePageParams } from './common';

export interface Project {
  id: string;
  title: string;
  description?: string;
  color?: string;
  teamId?: string;
  client?: string;
  employer?: string;
  defaultBillable?: boolean;
  defaultRate?: number;
  created?: number;
  lastUpdate?: number;
}

export interface ProjectMember {
  uid: string;
  firstname: string;
  lastname: string;
  email: string;
  permission: 'admin' | 'member';
  created?: number;
}

export interface ProjectCreateRequest {
  title: string;
  description?: string;
  color?: string;
  teamId?: string;
  client?: string;
  employer?: string;
  defaultBillable?: boolean;
  defaultRate?: number;
}

export interface ProjectUpdateRequest {
  title?: string;
  description?: string;
  color?: string;
  client?: string;
  employer?: string;
  defaultBillable?: boolean;
  defaultRate?: number;
}

export interface ProjectMemberCreateRequest {
  email: string;
  permission: 'admin' | 'member';
}

export interface ProjectListParams extends SortablePageParams {
  teamId?: string;
  search?: string;
}

export interface ProjectSearchParams extends SearchParams {
  title?: string;
  teamId?: string;
  client?: string;
}
