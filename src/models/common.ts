/**
 * Common parameter interfaces
 */

export interface PageParams {
  page?: number;
  limit?: number;
}

export interface SortablePageParams extends PageParams {
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface DateRangeParams {
  startDate?: Date;
  endDate?: Date;
}

export interface SearchParams extends SortablePageParams {
  search?: string;
}

/**
 * Common enums
 */

export enum OrganizationPermission {
  ADMIN = 'admin',
  BILLING = 'billing',
  MEMBER = 'member'
}

export enum TeamPermission {
  MANAGER = 'manager',
  MEMBER = 'member'
}

export enum ProjectPermission {
  ADMIN = 'admin',
  MEMBER = 'member'
}

export enum TaskStatus {
  PENDING = 'pending',
  BILLED = 'billed',
  PAID = 'paid'
}

export enum DocumentType {
  INVOICE = 'invoice',
  TIMESHEET = 'timesheet',
  WORKRECORD = 'workrecord'
}

export enum AutomationType {
  GEOFENCE = 'geofence',
  WLAN = 'wlan'
}

export enum AutomationAction {
  START = 'start',
  STOP = 'stop'
} 