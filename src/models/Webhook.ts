import { PageParams, SortablePageParams } from './common';

export interface Webhook {
  id: string;
  target: string;
  event: string;
  enabled: boolean;
  created?: number;
  lastUpdate?: number;
  lastTriggered?: number;
  triggerCount?: number;
}

export interface WebhookCreateRequest {
  target: string;
  event: string;
  enabled?: boolean;
}

export interface WebhookUpdateRequest {
  target?: string;
  event?: string;
  enabled?: boolean;
}

export interface WebhookListParams extends SortablePageParams {
  event?: string;
  enabled?: boolean;
}

export interface WebhookSearchParams extends WebhookListParams {
  target?: string;
}
