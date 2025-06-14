import type { ListParams } from './common';

export interface Webhook {
  id: string;
  target: string;
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
