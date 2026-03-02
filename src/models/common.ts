/**
 * Common parameter interfaces
 */

/**
 * Common member interface used across multiple models
 */
export interface Member {
  uid: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  employeeId?: string;
  imageUrl?: string;
  deleted?: boolean;
  activity?: Activity;
  displayName?: string;
  initials?: string;
}

/**
 * Activity information for a member
 */
export interface Activity {
  projectId?: string;
  projectTitle?: string;
  projectColor?: number;
  taskId?: string;
  startDateTime?: string;
  endDateTime?: string;
  location?: string;
  running?: boolean;
}

export interface ListParams {
  /**
   * Total count of items across all pages.
   */
  count?: number;

  /**
   * Current page number (1-based).
   */
  page?: number;

  /**
   * Page size limit.
   */
  limit?: number;

  /**
   * Sort field.
   */
  sort?: string;

  /**
   * Sort order.
   */
  order?: 'asc' | 'desc';
}

export interface PageParams {
  page?: number;
  limit?: number;
}

export interface SortablePageParams extends PageParams {
  sort?: string;
  order?: 'asc' | 'desc';
}
