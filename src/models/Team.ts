import type { ListParams } from './common';

export interface Team {
  id: string;
  organizationId?: string;
  name: string;
  description?: string;
  image?: string;
  color?: number;
  projectSalaryVisibility?: number;
  created?: number;
  lastUpdate?: number;
}

export interface TeamList {
  items: Team[];
  params: TeamListParams;
}

export interface TeamMember {
  uid: string;
  email: string;
  firstname?: string;
  lastname?: string;
  employeeId?: string;
  imageUrl?: string;
  permission?: string;
  created?: number;
  lastUpdate?: number;
}

export interface TeamMemberList {
  items: TeamMember[];
  params: TeamMemberListParams;
}

export interface TeamCreateRequest {
  organizationId?: string;
  name: string;
  description?: string;
  image?: string;
  color?: number;
  projectSalaryVisibility?: number;
}

export interface TeamUpdateRequest {
  organizationId?: string;
  name?: string;
  description?: string;
  image?: string;
  color?: number;
  projectSalaryVisibility?: number;
}

export interface TeamListParams extends ListParams {
  statistics?: boolean;
  sort?: 'alpha' | 'permission' | 'created';
  order?: 'asc' | 'desc';
  organizationId?: string;
}

export interface TeamMemberListParams extends ListParams {
  organizationId?: string;
  status?: string;
  teamId?: string;
  projectId?: string;
  withoutMe?: boolean;
  lastActivity?: boolean;
  deleted?: boolean;
}
