import type { ListParams, Member } from './common';

/**
 * Absence details
 */
export interface Absence {
  id: string;
  contractId: string;
  member?: Member;
  absenceTypeId: string;
  absenceType?: AbsenceType;
  startDateTime: string;
  endDateTime: string;
  fullDay?: boolean;
  totalDays?: string;
  totalHours?: string;
  reason?: string;
  documentationUrl?: string;
  fileName?: string;
  fileUri?: string;
  status?: string;
  requestedAt?: number;
  requestedBy?: string;
  requestedByMember?: Member;
  approvedBy?: string;
  approvedAt?: number;
  rejectionReason?: string;
  cancelledAt?: number;
  cancelledBy?: string;
  cancellationReason?: string;
  canApprove?: boolean;
  canReject?: boolean;
  canCancel?: boolean;
  canEdit?: boolean;
  documentationStatus?: string;
  documentationDueDate?: string;
  lastUpdate?: number;
  created?: number;
}

/**
 * Create absence request
 */
export interface AbsenceCreateRequest {
  contractId: string;
  absenceTypeId: string;
  startDateTime: string;
  endDateTime: string;
  fullDay?: boolean;
  reason?: string;
  documentationUrl?: string;
  fileName?: string;
  fileUri?: string;
}

/**
 * Update absence request
 */
export interface AbsenceUpdateRequest {
  startDateTime?: string;
  endDateTime?: string;
  fullDay?: boolean;
  reason?: string;
  documentationUrl?: string;
  fileName?: string;
  fileUri?: string;
}

/**
 * Absence reason request (for rejection/cancellation)
 */
export interface AbsenceReasonRequest {
  reason: string;
}

/**
 * Absence list parameters
 */
export interface AbsenceListParams extends ListParams {
  organizationId?: string;
  contractId?: string;
  userId?: string;
  absenceTypeId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  year?: number;
  userIds?: string[];
  contractIds?: string[];
  statuses?: string[];
  teamId?: string;
  teamIds?: string[];
  excludeRejectedCancelled?: boolean;
}

/**
 * Absence type details
 */
export interface AbsenceType {
  id: string;
  organizationId: string;
  code: string;
  i18nKey?: string;
  name: string;
  descriptionI18nKey?: string;
  description?: string;
  color?: number;
  icon?: string;
  paid?: boolean;
  requiresApproval?: boolean;
  requiresDocumentation?: boolean;
  documentationRequiredAfterDays?: number;
  affectsOvertime?: boolean;
  deductsFromQuota?: boolean;
  maxConsecutiveDays?: number;
  minNoticeDays?: number;
  countryCode?: string;
  systemType?: boolean;
  active?: boolean;
  sortOrder?: number;
  lastUpdate?: number;
  created?: number;
}

/**
 * Create absence type request
 */
export interface AbsenceTypeCreateRequest {
  code: string;
  name: string;
  description?: string;
  color?: number;
  icon?: string;
  paid?: boolean;
  requiresApproval?: boolean;
  requiresDocumentation?: boolean;
  documentationRequiredAfterDays?: number;
  affectsOvertime?: boolean;
  deductsFromQuota?: boolean;
  maxConsecutiveDays?: number;
  minNoticeDays?: number;
  countryCode?: string;
  sortOrder?: number;
}

/**
 * Update absence type request
 */
export interface AbsenceTypeUpdateRequest {
  code?: string;
  name?: string;
  description?: string;
  color?: number;
  icon?: string;
  paid?: boolean;
  requiresApproval?: boolean;
  requiresDocumentation?: boolean;
  documentationRequiredAfterDays?: number;
  affectsOvertime?: boolean;
  deductsFromQuota?: boolean;
  maxConsecutiveDays?: number;
  minNoticeDays?: number;
  countryCode?: string;
  sortOrder?: number;
}

/**
 * Absence type list parameters
 */
export interface AbsenceTypeListParams extends ListParams {}
