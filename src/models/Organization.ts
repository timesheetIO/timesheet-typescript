import type { ListParams } from './common';
import type { TeamPermission, TeamMemberProjectRegistration } from './Team';

/**
 * Organization details
 */
export interface Organization {
  id: string;
  name: string;
  description?: string;
  image?: string;
  color?: number;
  subscription?: Record<string, unknown>;
  user?: string;
  aiChatEnabled?: boolean;
  permission?: OrganizationPermission;
  created?: number;
  lastUpdate?: number;
  deleted?: boolean;
}

/**
 * Organization list response
 */
export interface OrganizationList {
  items: Organization[];
  params: OrganizationListParams;
}

/**
 * Create organization request
 */
export interface OrganizationCreateRequest {
  name: string;
  description?: string;
  image?: string;
  color?: number;
  aiChatEnabled?: boolean;
}

/**
 * Update organization request
 */
export interface OrganizationUpdateRequest {
  name?: string;
  description?: string;
  image?: string;
  color?: number;
  aiChatEnabled?: boolean;
}

export interface OrganizationListParams extends ListParams {
  permission?: string;
}

/**
 * Organization permission details
 */
export interface OrganizationPermission {
  invoicing?: boolean;
  billing?: boolean;
  admin?: boolean;
}

/**
 * Organization member details
 */
export interface OrganizationMember {
  id: string;
  user?: string;
  email: string;
  firstname?: string;
  lastname?: string;
  imageUrl?: string;
  deleted?: boolean;
  invited?: boolean;
  permission?: OrganizationPermission;
  teamAssignments?: OrganizationMemberTeamAssignment[];
  hasActiveContract?: boolean;
  displayName?: string;
  initials?: string;
  lastUpdate?: number;
  created?: number;
}

/**
 * Organization member team assignment
 */
export interface OrganizationMemberTeamAssignment {
  teamMemberId?: string;
  teamId?: string;
  teamName?: string;
  employeeId?: string;
  deleted?: boolean;
  permission?: TeamPermission;
  projectRegistrations?: TeamMemberProjectRegistration[];
  lastUpdate?: number;
  created?: number;
}

/**
 * Create organization member request
 */
export interface OrganizationMemberCreateRequest {
  email: string;
  firstname?: string;
  lastname?: string;
  invoicing?: boolean;
  billing?: boolean;
  admin?: boolean;
  teamAssignments?: OrganizationMemberTeamAssignment[];
}

/**
 * Update organization member request
 */
export interface OrganizationMemberUpdateRequest {
  invoicing?: boolean;
  billing?: boolean;
  admin?: boolean;
  teamAssignments?: OrganizationMemberTeamAssignment[];
}

/**
 * Organization member list parameters
 */
export interface OrganizationMemberListParams extends ListParams {
  deleted?: boolean;
}
