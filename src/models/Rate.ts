import { PageParams, SearchParams, SortablePageParams } from './common';

export interface Rate {
  id: string;
  title: string;
  multiplier: number;
  extraCharge?: number;
  teamId?: string;
  created?: number;
  lastUpdate?: number;
}

export interface RateCreateRequest {
  title: string;
  multiplier: number;
  extraCharge?: number;
  teamId?: string;
}

export interface RateUpdateRequest {
  title?: string;
  multiplier?: number;
  extraCharge?: number;
}

export interface RateListParams extends SortablePageParams {
  teamId?: string;
}

export interface RateSearchParams extends SearchParams {
  title?: string;
  teamId?: string;
}
