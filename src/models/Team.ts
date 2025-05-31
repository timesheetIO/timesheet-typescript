import { PageParams, SearchParams, SortablePageParams } from './common';

export interface Team {
  id: string;
  name: string;
  description?: string;
  organizationId?: string;
  created?: number;
  lastUpdate?: number;
}

export interface TeamMember {
  uid: string;
  firstname: string;
  lastname: string;
  email: string;
  permission: 'manager' | 'member';
  created?: number;
  lastUpdate?: number;
}

export interface TeamCreateRequest {
  name: string;
  description?: string;
  organizationId?: string;
}

export interface TeamUpdateRequest {
  name?: string;
  description?: string;
}

export interface TeamMemberCreateRequest {
  email: string;
  permission: 'manager' | 'member';
}

export interface TeamMemberUpdateRequest {
  permission: 'manager' | 'member';
}

export interface TeamListParams extends SortablePageParams {
  organizationId?: string;
}

export interface TeamSearchParams extends SearchParams {
  name?: string;
  organizationId?: string;
}

export interface TeamActivateRequest {
  teamName: string;
}
