import type { ListParams, Member } from './common';

/**
 * Contract details
 */
export interface Contract {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  member?: Member;
  validFrom?: string;
  validTo?: string;
  status?: string;
  workDays?: string;
  weeklyHours?: number;
  dailyHours?: number;
  breakMinutesRequired?: number;
  breakThresholdMinutes?: number;
  salaryType?: string;
  salaryAmount?: number;
  salaryCurrency?: string;
  vacationDaysAnnual?: number;
  vacationDaysCarriedOver?: number;
  sickLeavePaidDays?: number;
  employmentModelId?: string;
  overtimeEnabled?: boolean;
  holidayCollectionId?: string;
  exemptStatus?: string;
  workweekStartDay?: number;
  countryCode?: string;
  regionCode?: string;
  timezone?: string;
  lastUpdate?: number;
  created?: number;
}

/**
 * Create contract request
 */
export interface ContractCreateRequest {
  name: string;
  userId: string;
  validFrom?: string;
  validTo?: string;
  workDays?: string;
  weeklyHours?: number;
  dailyHours?: number;
  breakMinutesRequired?: number;
  breakThresholdMinutes?: number;
  salaryType?: string;
  salaryAmount?: number;
  salaryCurrency?: string;
  vacationDaysAnnual?: number;
  vacationDaysCarriedOver?: number;
  sickLeavePaidDays?: number;
  employmentModelId?: string;
  overtimeEnabled?: boolean;
  holidayCollectionId?: string;
  exemptStatus?: string;
  workweekStartDay?: number;
  countryCode?: string;
  regionCode?: string;
  timezone?: string;
}

/**
 * Update contract request
 */
export interface ContractUpdateRequest {
  name?: string;
  validFrom?: string;
  validTo?: string;
  workDays?: string;
  weeklyHours?: number;
  dailyHours?: number;
  breakMinutesRequired?: number;
  breakThresholdMinutes?: number;
  salaryType?: string;
  salaryAmount?: number;
  salaryCurrency?: string;
  vacationDaysAnnual?: number;
  vacationDaysCarriedOver?: number;
  sickLeavePaidDays?: number;
  employmentModelId?: string;
  overtimeEnabled?: boolean;
  holidayCollectionId?: string;
  exemptStatus?: string;
  workweekStartDay?: number;
  countryCode?: string;
  regionCode?: string;
  timezone?: string;
}

/**
 * Contract list parameters
 */
export interface ContractListParams extends ListParams {}

/**
 * Contract amendment details
 */
export interface ContractAmendment {
  id: string;
  contractId: string;
  effectiveFrom?: string;
  reason?: string;
  amendmentType?: string;
  weeklyHours?: number;
  dailyHours?: number;
  salaryAmount?: number;
  employmentModelId?: string;
  vacationDaysAnnual?: number;
  approvedBy?: string;
  approvedAt?: number;
  lastUpdate?: number;
  created?: number;
}

/**
 * Create contract amendment request
 */
export interface ContractAmendmentCreateRequest {
  effectiveFrom: string;
  reason?: string;
  amendmentType?: string;
  weeklyHours?: number;
  dailyHours?: number;
  salaryAmount?: number;
  employmentModelId?: string;
  vacationDaysAnnual?: number;
}

/**
 * Contract template details
 */
export interface ContractTemplate {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  i18nKey?: string;
  workDays?: string;
  weeklyHours?: number;
  dailyHours?: number;
  breakMinutesRequired?: number;
  breakThresholdMinutes?: number;
  salaryType?: string;
  vacationDaysAnnual?: number;
  sickLeavePaidDays?: number;
  employmentModelId?: string;
  holidayCollectionId?: string;
  countryCode?: string;
  systemTemplate?: boolean;
  active?: boolean;
  lastUpdate?: number;
  created?: number;
}

/**
 * Create contract template request
 */
export interface ContractTemplateCreateRequest {
  name: string;
  description?: string;
  workDays?: string;
  weeklyHours?: number;
  dailyHours?: number;
  breakMinutesRequired?: number;
  breakThresholdMinutes?: number;
  salaryType?: string;
  vacationDaysAnnual?: number;
  sickLeavePaidDays?: number;
  employmentModelId?: string;
  holidayCollectionId?: string;
  countryCode?: string;
}

/**
 * Update contract template request
 */
export interface ContractTemplateUpdateRequest {
  name?: string;
  description?: string;
  workDays?: string;
  weeklyHours?: number;
  dailyHours?: number;
  breakMinutesRequired?: number;
  breakThresholdMinutes?: number;
  salaryType?: string;
  vacationDaysAnnual?: number;
  sickLeavePaidDays?: number;
  employmentModelId?: string;
  holidayCollectionId?: string;
  countryCode?: string;
}

/**
 * Contract template list parameters
 */
export interface ContractTemplateListParams extends ListParams {}
