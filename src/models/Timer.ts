export interface Timer {
  status: 'running' | 'paused' | 'stopped';
  projectId?: string;
  description?: string;
  startTime?: string;
  pausedTime?: number;
  totalPausedTime?: number;
}

export interface TimerStartRequest {
  projectId: string;
  description?: string;
  startTime?: string;
}

export interface TimerStopRequest {
  endTime?: string;
}

export interface TimerUpdateRequest {
  projectId?: string;
  description?: string;
}
