import { PageParams, SortablePageParams, DateRangeParams } from './common';

export interface Pause {
  id: string;
  taskId: string;
  startTime: string;
  endTime?: string;
  description?: string;
  created?: number;
  lastUpdate?: number;
}

export interface PauseCreateRequest {
  taskId: string;
  startTime: string;
  description?: string;
}

export interface PauseUpdateRequest {
  startTime?: string;
  endTime?: string;
  description?: string;
}

export interface PauseListParams extends SortablePageParams, DateRangeParams {
  taskId?: string;
}

export interface PauseSearchParams extends PauseListParams {
  description?: string;
}
