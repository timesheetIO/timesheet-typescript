import type { Task } from './Task';
import type { Pause } from './Pause';

export interface Timer {
  status: 'running' | 'paused' | 'stopped';
  user?: string;
  task?: Task;
  pause?: Pause;
  lastUpdate?: number;
  created?: number;
}

export interface TimerStartRequest {
  projectId: string;
  /**
   * ISO 8601 date-time with timezone offset (e.g. 2025-05-31T16:45:51+02:00)
   */
  startDateTime?: string;
}

export interface TimerStopRequest {
  /**
   * ISO 8601 date-time with timezone offset (e.g. 2025-05-31T16:45:51+02:00)
   */
  endDateTime?: string;
}

export interface TimerPauseRequest {
  /**
   * ISO 8601 date-time with timezone offset (e.g. 2025-05-31T16:45:51+02:00)
   */
  startDateTime?: string;
}

export interface TimerResumeRequest {
  /**
   * ISO 8601 date-time with timezone offset (e.g. 2025-05-31T16:45:51+02:00)
   */
  endDateTime?: string;
}

export interface TimerUpdateRequest {
  /**
   * ISO 8601 date-time with timezone offset (e.g. 2025-05-31T16:45:51+02:00)
   */
  startDateTime?: string;
  description?: string;
  location?: string;
  locationEnd?: string;
  feeling?: number;
  typeId?: number;
  paid?: boolean;
  billed?: boolean;
  billable?: boolean;
  phoneNumber?: string;
  distance?: number;
}
