import type { ListParams } from './common';

/**
 * Organization details
 */
export interface Organization {
  id: string;
  name: string;
  description?: string;
  image?: string;
  color?: number;
  created?: number;
  lastUpdate?: number;
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
}

/**
 * Update organization request
 */
export interface OrganizationUpdateRequest {
  name?: string;
  description?: string;
  image?: string;
  color?: number;
}

export interface OrganizationListParams extends ListParams {
  status?: string;
  deleted?: boolean;
}
