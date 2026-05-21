export interface Profile {
  permission?: number;
  email?: string;
  imageUrl?: string;
  firstname?: string;
  lastname?: string;
  language?: string;
  countryIso?: string;
  country?: string;
  ipAddress?: string;
  referrer?: string;
  newsletter?: boolean;
  gdprConsent?: boolean;
  invited?: boolean;
  activatedTeams?: boolean;
  activated?: boolean;
  needsSetup?: boolean;
  user?: string;
  lastUpdate?: number;

  // Subscription fields
  subscriptionId?: string;
  expires?: number;
  status?: number;
  plan?: number;
  valid?: boolean;
  expired?: boolean;
  product?: string;
  trial?: boolean;
  planEnterprise?: boolean;
  planBusiness?: boolean;
  planPro?: boolean;
  planPlus?: boolean;
  planBasic?: boolean;
  member?: boolean;
  personalSubscriptionActive?: boolean;
  organizationSubscriptionActive?: boolean;
  basic?: boolean;
  pro?: boolean;
  plus?: boolean;

  // Validation and status fields
  validProfile?: boolean;
  validAndActivated?: boolean;
  admin?: boolean;
  deleted?: boolean;
  overtimeAccessible?: boolean;

  // Display fields
  displayName?: string;
  initials?: string;
}

export interface ProfileUpdateRequest {
  email?: string;
  imageUrl?: string;
  firstname?: string;
  lastname?: string;
  newsletter?: boolean;
}
