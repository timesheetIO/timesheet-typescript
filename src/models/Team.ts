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
  /**
   * Also list the teams the user left that still hold their own tasks, after the current ones.
   * They are read-only for the user. `search()` only.
   */
  includeFormer?: boolean;
  /** Only these teams. `search()` only. */
  teamIds?: string[];
  /** Only the teams the user manages (manager or owner). `search()` only. */
  managed?: boolean;
  /**
   * The teams the user may create items in: the ones they manage plus every team of the
   * organizations they administer. `search()` only.
   */
  manageable?: boolean;
  /** Only the teams this user is an active member of. `search()` only. */
  memberUserId?: string;
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
  /** Only members who join new projects automatically (true) or only the others (false); all when left out. */
  autoJoinProjects?: boolean;
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
