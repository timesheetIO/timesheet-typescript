import { PageParams, SearchParams, SortablePageParams } from './common';

/**
 * Organization details
 */
export interface Organization {
  id: string;
  name: string;
  description?: string;
  image?: string;
  color?: string;
  created?: number;
  lastUpdate?: number;
}

/**
 * Organization member
 */
export interface OrganizationMember {
  uid: string;
  firstname: string;
  lastname: string;
  email: string;
  permission: 'admin' | 'billing' | 'member';
  created?: number;
  lastUpdate?: number;
}

/**
 * Create organization request
 */
export interface OrganizationCreateRequest {
  name: string;
  description?: string;
  image?: string;
  color?: string;
}

/**
 * Update organization request
 */
export interface OrganizationUpdateRequest {
  name?: string;
  description?: string;
  image?: string;
  color?: string;
}

/**
 * Add organization member request
 */
export interface OrganizationMemberCreateRequest {
  email: string;
  permission: 'admin' | 'billing' | 'member';
}

/**
 * Update organization member request
 */
export interface OrganizationMemberUpdateRequest {
  permission: 'admin' | 'billing' | 'member';
}

/**
 * Organization list parameters
 */
export interface OrganizationListParams extends SearchParams {
  // Additional filters if needed
}

/**
 * Organization search parameters
 */
export interface OrganizationSearchParams extends SearchParams {
  name?: string;
  // Additional search criteria
} 