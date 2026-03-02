/**
 * SSE connection status response
 */
export interface SseStatus {
  /** Whether the user has an active SSE connection */
  connected: boolean;
  /** Number of active connections for the user */
  connectionCount: number;
  /** The user ID */
  userId: string;
}

/**
 * Event data received via SSE
 */
export interface EventData<T = unknown> {
  /** Event type (e.g., 'task.create', 'task.update') */
  event: string;
  /** The entity that triggered the event */
  item: T;
}

/**
 * SSE connection event with metadata
 */
export interface SseConnectionEvent {
  /** Unique connection ID */
  connectionId: string;
  /** Connection message */
  message: string;
}

/**
 * Event types supported by the SSE stream
 */
export type EventType =
  | 'connected'
  | 'team.create'
  | 'team.update'
  | 'project.create'
  | 'project.update'
  | 'todo.create'
  | 'todo.update'
  | 'task.create'
  | 'task.update'
  | 'tag.create'
  | 'tag.update'
  | 'rate.create'
  | 'rate.update'
  | 'timer.start'
  | 'timer.stop'
  | 'timer.pause'
  | 'timer.resume';

/**
 * Event handler callback type
 */
export type EventHandler<T = unknown> = (data: EventData<T>) => void;

/**
 * SSE subscription interface for managing event stream connections
 */
export interface SseSubscription {
  /** Close the SSE connection */
  close(): void;
  /** Whether the connection is open */
  readonly isConnected: boolean;
  /** Add an event listener */
  on(event: EventType | 'error', handler: (data: unknown) => void): void;
  /** Remove an event listener */
  off(event: EventType | 'error', handler: (data: unknown) => void): void;
}
