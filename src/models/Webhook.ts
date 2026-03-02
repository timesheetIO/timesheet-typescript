import type { ListParams } from './common';

/**
 * Webhook event types
 */
export type WebhookEventType =
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
 * Constants for webhook event types
 */
export const WebhookEvents = {
  TEAM_CREATE: 'team.create' as const,
  TEAM_UPDATE: 'team.update' as const,
  PROJECT_CREATE: 'project.create' as const,
  PROJECT_UPDATE: 'project.update' as const,
  TODO_CREATE: 'todo.create' as const,
  TODO_UPDATE: 'todo.update' as const,
  TASK_CREATE: 'task.create' as const,
  TASK_UPDATE: 'task.update' as const,
  TAG_CREATE: 'tag.create' as const,
  TAG_UPDATE: 'tag.update' as const,
  RATE_CREATE: 'rate.create' as const,
  RATE_UPDATE: 'rate.update' as const,
  TIMER_START: 'timer.start' as const,
  TIMER_STOP: 'timer.stop' as const,
  TIMER_PAUSE: 'timer.pause' as const,
  TIMER_RESUME: 'timer.resume' as const,
} as const;

/**
 * Helper function to combine multiple webhook events into a comma-separated string
 * @param events - One or more webhook event types
 * @returns Comma-separated event string
 *
 * @example
 * ```typescript
 * combineWebhookEvents('timer.start', 'timer.stop') // Returns: 'timer.start,timer.stop'
 * combineWebhookEvents(WebhookEvents.TIMER_START, WebhookEvents.TIMER_STOP)
 * ```
 */
export function combineWebhookEvents(...events: WebhookEventType[]): string {
  return events.join(',');
}

export interface Webhook {
  id: string;
  target: string;
  /**
   * Event type(s) that trigger this webhook.
   * Can be a single event (e.g., 'timer.start') or multiple comma-separated events (e.g., 'timer.start,timer.stop')
   * @see WebhookEventType for valid event types
   */
  event: string;
  created?: number;
  lastUpdate?: number;
}

export interface WebhookList {
  items: Webhook[];
  params: WebhookListParams;
}

export interface WebhookCreateRequest {
  target: string;
  event: string;
}

export interface WebhookUpdateRequest {
  target?: string;
  event?: string;
}

export interface WebhookListParams extends ListParams {
  sort?: 'created' | 'lastUpdate' | 'target' | 'event';
  order?: 'asc' | 'desc';
  event?: string;
}
