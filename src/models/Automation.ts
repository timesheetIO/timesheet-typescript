import type { ListParams } from './common';
import type { Project } from './Project';

export interface Automation {
  id: string;
  project: Project;
  typeId: 0 | 1 | 2; // 0=geofence, 1=wlan, 2=beacon
  action: 0 | 1 | 2; // 0=start, 1=stop, 2=pause
  enabled: boolean;
  shared: boolean;
  // Geofence fields
  address?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  // WLAN fields
  ssid?: string;
  // Beacon fields
  beaconUUID?: string;
  name?: string;
  created?: number;
  lastUpdate?: number;
}

export interface AutomationList {
  items: Automation[];
  params: AutomationListParams;
}

export interface AutomationCreateRequest {
  projectId: string;
  typeId: 0 | 1 | 2;
  action: 0 | 1 | 2;
  enabled?: boolean;
  shared?: boolean;
  // Geofence fields
  address?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  // WLAN fields
  ssid?: string;
  // Beacon fields
  beaconUUID?: string;
}

export interface AutomationUpdateRequest {
  enabled?: boolean;
  shared?: boolean;
  action?: 0 | 1 | 2;
  // Location can be updated for geofence
  address?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface AutomationListParams extends ListParams {
  projectId?: string;
  status?: 'enabled' | 'disabled';
  typeId?: 0 | 1 | 2;
}
