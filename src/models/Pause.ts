import type { ListParams, Member } from './common';
import type { Task } from './Task';

export interface Pause {
  id: string;
  user?: string;
  deleted?: boolean;
  running?: boolean;
  lastUpdate?: number;
  created?: number;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  task?: Task;
  member?: Member;
}

export interface PauseList {
  items: Pause[];
  params: PauseListParams;
}

export interface PauseCreateRequest {
  description?: string;
  startDateTime: string;
  endDateTime: string;
  taskId: string;
}

export interface PauseUpdateRequest {
  description?: string;
  startDateTime: string;
  endDateTime: string;
  deleted?: boolean;
}

export interface PauseListParams extends ListParams {
  taskId?: string;
}
