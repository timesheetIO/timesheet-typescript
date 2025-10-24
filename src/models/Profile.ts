export interface Profile {
  permission?: number;
  email?: string;
  imageUrl?: string;
  firstname?: string;
  lastname?: string;
  newsletter?: boolean;
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
  planBusiness?: boolean;
  planPro?: boolean;
  planPlus?: boolean;
  planBasic?: boolean;
  member?: boolean;
  personalSubscriptionActive?: boolean;
  organizationSubscriptionActive?: boolean;

  // Validation and status fields
  validProfile?: boolean;
  validAndActivated?: boolean;
  deleted?: boolean;

  // Display fields
  displayName?: string;
  initials?: string;

  // Timestamps
  createdAt?: string;
}

export interface ProfileUpdateRequest {
  email?: string;
  imageUrl?: string;
  firstname?: string;
  lastname?: string;
  newsletter?: boolean;
}
