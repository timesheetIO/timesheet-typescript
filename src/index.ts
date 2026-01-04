import { ApiClient } from './http';
import type { Authentication } from './auth';
import { ApiKeyAuth, OAuth2Auth } from './auth';
import type { ClientConfig } from './config';
import { RetryConfig } from './config';
import type { AxiosInstance } from 'axios';
import {
  AutomationResource,
  DocumentResource,
  ExpenseResource,
  NoteResource,
  OrganizationResource,
  PauseResource,
  ProfileResource,
  ProjectResource,
  RateResource,
  ReportsClient,
  SettingsResource,
  TagResource,
  TaskResource,
  TeamResource,
  TimerResource,
  TodoResource,
  WebhookResource,
} from './resources';

// Export all modules
export * from './auth';
export * from './config';
export * from './exceptions';
export * from './models';
export * from './http';
export * from './resources';

/**
 * Main entry point for the Timesheet SDK.
 *
 * @example
 * ```typescript
 * // Using API Key
 * const client = new TimesheetClient({
 *   apiKey: 'your-api-key'
 * });
 *
 * // Using OAuth2
 * const client = new TimesheetClient({
 *   oauth2Token: 'your-access-token'
 * });
 * ```
 */
export class TimesheetClient {
  private readonly apiClient: ApiClient;
  private readonly reportsApiClient: ApiClient;

  // Resource APIs
  public readonly organizations: OrganizationResource;
  public readonly teams: TeamResource;
  public readonly projects: ProjectResource;
  public readonly tasks: TaskResource;
  public readonly rates: RateResource;
  public readonly tags: TagResource;
  public readonly expenses: ExpenseResource;
  public readonly notes: NoteResource;
  public readonly pauses: PauseResource;
  public readonly profile: ProfileResource;
  public readonly settings: SettingsResource;
  public readonly automations: AutomationResource;
  public readonly documents: DocumentResource;
  public readonly timer: TimerResource;
  public readonly todos: TodoResource;
  public readonly webhooks: WebhookResource;

  /**
   * Reports API for PDF generation, exports, and report data.
   * Provides access to document, task, expense, and note report generation,
   * as well as timesheet exports in various formats.
   *
   * @example
   * ```typescript
   * // Generate a document PDF
   * const pdfData = await client.reports.documents.getPdf('doc_123');
   *
   * // Generate a timesheet export
   * const exportResult = await client.reports.export.generate({
   *   report: 1,
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31',
   *   format: 'xlsx'
   * });
   * ```
   */
  public readonly reports: ReportsClient;

  /**
   * Creates a new TimesheetClient instance.
   *
   * @param options Configuration options
   */
  constructor(options: TimesheetClientOptions) {
    const authentication = this.createAuthentication(options);
    const retryConfig = options.retryConfig || RetryConfig.default();

    // Main API client (api.timesheet.io)
    const config: ClientConfig = {
      baseUrl: options.baseUrl || 'https://api.timesheet.io',
      authentication,
      retryConfig,
      httpClient: options.httpClient,
    };

    this.apiClient = new ApiClient(config);

    // Reports API client (reports.timesheet.io)
    const reportsConfig: ClientConfig = {
      baseUrl: options.reportsBaseUrl || 'https://reports.timesheet.io',
      authentication,
      retryConfig,
      httpClient: options.reportsHttpClient,
    };

    this.reportsApiClient = new ApiClient(reportsConfig);

    // Initialize main API resources
    this.organizations = new OrganizationResource(this.apiClient);
    this.teams = new TeamResource(this.apiClient);
    this.projects = new ProjectResource(this.apiClient);
    this.tasks = new TaskResource(this.apiClient);
    this.rates = new RateResource(this.apiClient);
    this.tags = new TagResource(this.apiClient);
    this.expenses = new ExpenseResource(this.apiClient);
    this.notes = new NoteResource(this.apiClient);
    this.pauses = new PauseResource(this.apiClient);
    this.profile = new ProfileResource(this.apiClient);
    this.settings = new SettingsResource(this.apiClient);
    this.automations = new AutomationResource(this.apiClient);
    this.documents = new DocumentResource(this.apiClient);
    this.timer = new TimerResource(this.apiClient);
    this.todos = new TodoResource(this.apiClient);
    this.webhooks = new WebhookResource(this.apiClient);

    // Initialize reports API resources
    this.reports = new ReportsClient(this.reportsApiClient);
  }

  private createAuthentication(options: TimesheetClientOptions): Authentication {
    if (options.apiKey) {
      return new ApiKeyAuth(options.apiKey);
    } else if (options.oauth2Token) {
      return new OAuth2Auth(options.oauth2Token);
    } else if (options.oauth2) {
      return new OAuth2Auth(
        options.oauth2.clientId,
        options.oauth2.clientSecret,
        options.oauth2.refreshToken,
      );
    } else if (options.authentication) {
      return options.authentication;
    } else {
      throw new Error('Authentication must be configured');
    }
  }
}

/**
 * Configuration options for TimesheetClient.
 */
export interface TimesheetClientOptions {
  /**
   * API key for authentication.
   */
  apiKey?: string;

  /**
   * OAuth2 bearer token for authentication.
   */
  oauth2Token?: string;

  /**
   * OAuth2 configuration with refresh capability.
   */
  oauth2?: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };

  /**
   * Custom authentication implementation.
   */
  authentication?: Authentication;

  /**
   * Custom base URL for the main API.
   * @default 'https://api.timesheet.io'
   */
  baseUrl?: string;

  /**
   * Custom base URL for the Reports API.
   * @default 'https://reports.timesheet.io'
   */
  reportsBaseUrl?: string;

  /**
   * Custom retry configuration.
   */
  retryConfig?: RetryConfig;

  /**
   * Custom HTTP client (axios instance) for the main API.
   */
  httpClient?: AxiosInstance;

  /**
   * Custom HTTP client (axios instance) for the Reports API.
   */
  reportsHttpClient?: AxiosInstance;
}

// Export convenience function
export function createClient(options: TimesheetClientOptions): TimesheetClient {
  return new TimesheetClient(options);
}
