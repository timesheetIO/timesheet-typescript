import { SortablePageParams, DateRangeParams } from './common';

export interface Task {
  id: string;
  projectId: string;
  description?: string;
  startTime: string;
  endTime?: string;
  billable?: boolean;
  billed?: boolean;
  paid?: boolean;
  location?: string;
  latitude?: number;
  longitude?: number;
  feeling?: number;
  tagIds?: string[];
  rateId?: string;
  todoId?: string;
  created?: number;
  lastUpdate?: number;
}

export interface TaskCreateRequest {
  projectId: string;
  description?: string;
  startTime: string;
  endTime?: string;
  billable?: boolean;
  location?: string;
  latitude?: number;
  longitude?: number;
  feeling?: number;
  tagIds?: string[];
  rateId?: string;
  todoId?: string;
}

export interface TaskUpdateRequest {
  description?: string;
  startTime?: string;
  endTime?: string;
  billable?: boolean;
  location?: string;
  latitude?: number;
  longitude?: number;
  feeling?: number;
  tagIds?: string[];
  rateId?: string;
  todoId?: string;
}

export interface TaskStatusUpdateRequest {
  taskIds: string[];
  status: 'pending' | 'billed' | 'paid';
}

export interface TaskTimesUpdateRequest {
  taskId: string;
  startTime: string;
  endTime: string;
}

export interface TaskListParams extends SortablePageParams, DateRangeParams {
  projectId?: string;
  status?: 'pending' | 'billed' | 'paid';
  billable?: boolean;
}

export interface TaskSearchParams extends TaskListParams {
  description?: string;
  tagIds?: string[];
}
