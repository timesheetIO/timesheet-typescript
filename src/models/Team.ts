import type { ListParams, Member } from './common';

export interface TeamPermission {
  role?: string;
  managerOrOwner?: boolean;
  member?: boolean;
  manager?: boolean;
  owner?: boolean;
}

export interface TeamMemberProjectRegistration {
  projectId?: string;
  permission?: TeamPermission;
}

export interface Team {
  id: string;
  organizationId?: string;
  name: string;
  description?: string;
  image?: string;
  color?: number;
  projectSalaryVisibility?: number;
  permission?: TeamPermission;
  projects: number;
  members: number;
  created?: number;
  lastUpdate?: number;
}

export interface TeamList {
  items: Team[];
  params: TeamListParams;
}

export interface TeamMember {
  id: string;
  user?: string;
  email: string;
  firstname?: string;
  lastname?: string;
  employeeId?: string;
  imageUrl?: string;
  deleted?: boolean;
  invited?: boolean;
  autoJoinProjects?: boolean;
  permission?: TeamPermission;
  projectRegistrations?: TeamMemberProjectRegistration[];
  displayName?: string;
  initials?: string;
  created?: number;
  lastUpdate?: number;
}

export interface TeamMemberList {
  items: TeamMember[];
  params: TeamMemberListParams;
}

export interface TeamMemberCreateRequest {
  teamId?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  employeeId?: string;
  permission?: TeamPermission;
  projectRegistrations?: TeamMemberProjectRegistration[];
}

export interface TeamMemberUpdateRequest {
  firstname?: string;
  lastname?: string;
  employeeId?: string;
  activate?: boolean;
  autoJoinProjects?: boolean;
  permission?: TeamPermission;
  projectRegistrations?: TeamMemberProjectRegistration[];
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
  deleted?: boolean;
}

export interface TeamListParams extends ListParams {
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
  withoutProjectMembers?: boolean;
  lastActivity?: boolean;
  deleted?: boolean;
  userIds?: string[];
  withoutUserIds?: string[];
}

/**
 * Parameters for retrieving member activity status.
 * `status` accepts: all | active | inactive | running | idle
 */
export interface MemberStatusParams extends ListParams {
  organizationId?: string;
  teamId?: string;
  projectId?: string;
  userIds?: string[];
  status?: string;
}

export interface MemberStatusList {
  items: Member[];
  params: MemberStatusParams;
}
