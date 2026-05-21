import type { ListParams } from './common';
import type { Team } from './Team';

export interface ProjectPermission {
  role?: string;
  managerOrOwner?: boolean;
  member?: boolean;
  manager?: boolean;
  owner?: boolean;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  color?: number;
  employer?: string;
  office?: string;
  taskDefaultBillable?: boolean;
  taskDefaultRateId?: string;
  archived?: boolean;
  salaryVisibility?: number;
  salary?: string;
  team?: Team;
  permission?: ProjectPermission;
  duration?: number;
  durationBreak?: number;
  salaryTotal?: string;
  salaryBreak?: string;
  expenses?: string;
  expensesPaid?: string;
  mileage?: string;
  todoEstimatedDuration?: number;
  todoTrackedDuration?: number;
  todoCount?: number;
  titleAndClient?: string;
  salaryVisible?: boolean;
  user?: string;
  created?: number;
  lastUpdate?: number;
  deleted?: boolean;
}

export interface ProjectList {
  items: Project[];
  params: ProjectListParams;
}

export interface ProjectMember {
  id: string;
  user?: string;
  email: string;
  firstname?: string;
  lastname?: string;
  imageUrl?: string;
  deleted?: boolean;
  permission?: ProjectPermission;
  lastUpdate?: number;
  created?: number;
  displayName?: string;
  initials?: string;
}

export interface ProjectMemberList {
  items: ProjectMember[];
  params: ProjectMemberListParams;
}

export interface ProjectMemberCreateRequest {
  projectId?: string;
  email?: string;
  userId?: string;
  permission?: ProjectPermission;
}

export interface ProjectMemberUpdateRequest {
  permission?: ProjectPermission;
}

/**
 * Project member registration used for bulk member replacement via
 * ProjectResource.updateMembers(). `salary` is a decimal serialized as a string.
 */
export interface ProjectRegistration {
  id?: string;
  role?: string;
  user?: string;
  salaryActivated?: boolean;
  salary?: string;
}

export interface ProjectCreateRequest {
  title: string;
  description?: string;
  color?: number;
  employer?: string;
  office?: string;
  taskDefaultBillable?: boolean;
  taskDefaultRateId?: string;
  archived?: boolean;
  salaryVisibility?: number;
  salary?: string;
  teamId?: string;
}

export interface ProjectUpdateRequest {
  title?: string;
  description?: string;
  color?: number;
  employer?: string;
  office?: string;
  taskDefaultBillable?: boolean;
  taskDefaultRateId?: string;
  archived?: boolean;
  salaryVisibility?: number;
  salary?: string;
  deleted?: boolean;
}

export interface ProjectListParams extends ListParams {
  teamId?: string;
  status?: 'all' | 'active' | 'inactive';
  sort?: 'alpha' | 'alphaNum' | 'client' | 'duration' | 'created' | 'status';
  order?: 'asc' | 'desc';
  teamIds?: string[];
  projectIds?: string[];
  taskStartDate?: string;
  taskEndDate?: string;
  taskRateId?: string;
  taskType?: string;
  taskFilter?: string;
  taskUserIds?: string[];
  empty?: boolean;
}

export interface ProjectMemberListParams extends ListParams {
  projectId?: string;
  status?: string;
  withoutMe?: boolean;
  userIds?: string[];
  withDeleted?: boolean;
}
