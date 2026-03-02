import type { ApiClient } from '../../http';
import type {
  CustomExportField,
  CustomExportFieldCreateRequest,
  CustomExportFieldsResponse,
  CustomExportFieldUpdateRequest,
  ExportFieldsResponse,
  ExportParams,
  ExportReportsResponse,
  ExportTemplate,
  ExportTemplateCreateRequest,
  ExportTemplateListParams,
  ExportTemplateParams,
  ExportTemplateUpdateRequest,
  FileResponse,
  Page,
} from '../../models';
import { NavigablePage } from '../../models';
import { Resource } from '../Resource';

/**
 * Resource for generating timesheet exports in various formats.
 * Accesses the Reports API at reports.timesheet.io.
 */
export class ExportResource extends Resource {
  constructor(client: ApiClient) {
    super(client, '/v1/export');
  }

  // ============================================================================
  // Export Generation
  // ============================================================================

  /**
   * Generate and download a timesheet export.
   * Creates an export file based on the provided parameters and returns
   * a signed URL to download it. Supports Excel, CSV, and PDF formats.
   * @param params Export configuration parameters
   * @returns FileResponse with download URL
   */
  async generate(params: ExportParams): Promise<FileResponse> {
    return this.http.post<FileResponse>(`${this.basePath}/data`, params);
  }

  /**
   * Generate and email a timesheet export.
   * Creates an export file and sends it via email to the specified address.
   * The email field in params must be provided.
   * @param params Export configuration parameters (must include email)
   */
  async send(params: ExportParams): Promise<void> {
    return this.http.post<void>(`${this.basePath}/send`, params);
  }

  /**
   * Generate export from a saved template.
   * Creates an export file using a previously saved template with custom
   * start and end dates. The template defines the report type, format,
   * filters, and field selection.
   * @param params Template ID and date range
   * @returns ArrayBuffer containing the export file data
   */
  async generateFromTemplate(params: ExportTemplateParams): Promise<ArrayBuffer> {
    return this.http.request<ArrayBuffer>({
      method: 'POST',
      url: `${this.basePath}/from-template`,
      data: params,
      responseType: 'arraybuffer',
    });
  }

  // ============================================================================
  // Export Configuration
  // ============================================================================

  /**
   * Get available export fields.
   * Returns the list of available export fields from the field registry.
   * @param scope Optional scope filter: 'all', 'project', or 'team'
   */
  async getFields(scope?: 'all' | 'project' | 'team'): Promise<ExportFieldsResponse> {
    return this.http.get<ExportFieldsResponse, Record<string, unknown>>(
      `${this.basePath}/fields`,
      scope ? { scope } : undefined,
    );
  }

  /**
   * Get available report types.
   * Returns the list of available export report types with metadata.
   */
  async getReportTypes(): Promise<ExportReportsResponse> {
    return this.http.get<ExportReportsResponse>(`${this.basePath}/report-types`);
  }

  // ============================================================================
  // Export Templates
  // ============================================================================

  /**
   * Get user's export templates.
   * Returns a paginated list of export templates created by the authenticated user.
   * @param params Optional pagination and sorting parameters
   */
  async listTemplates(params?: ExportTemplateListParams): Promise<NavigablePage<ExportTemplate>> {
    const response = await this.http.get<Page<ExportTemplate>, Record<string, unknown>>(
      `${this.basePath}/templates`,
      params as Record<string, unknown>,
    );
    return new NavigablePage(response, (page) => this.listTemplates({ ...params, page }));
  }

  /**
   * Search export templates.
   * Performs an advanced search for export templates based on the provided parameters.
   * @param params Search parameters including filters, pagination, and sorting
   */
  async searchTemplates(params: ExportTemplateListParams): Promise<NavigablePage<ExportTemplate>> {
    const response = await this.http.post<Page<ExportTemplate>>(
      `${this.basePath}/templates/search`,
      params,
    );
    return this.createNavigablePage(response, (page) => this.searchTemplates({ ...params, page }));
  }

  /**
   * Create an export template.
   * Creates a new export template from the provided data.
   * @param data Template creation data
   */
  async createTemplate(data: ExportTemplateCreateRequest): Promise<ExportTemplate> {
    return this.http.post<ExportTemplate>(`${this.basePath}/templates`, data);
  }

  /**
   * Get a single export template.
   * Retrieves a specific export template by ID with resolved JSON fields.
   * @param templateId Template ID
   */
  async getTemplate(templateId: string): Promise<ExportTemplate> {
    return this.http.get<ExportTemplate>(
      `${this.basePath}/templates/${encodeURIComponent(templateId)}`,
    );
  }

  /**
   * Update an export template.
   * Updates an existing export template with new data.
   * @param templateId Template ID
   * @param data Updated template data
   */
  async updateTemplate(
    templateId: string,
    data: ExportTemplateUpdateRequest,
  ): Promise<ExportTemplate> {
    return this.http.put<ExportTemplate>(
      `${this.basePath}/templates/${encodeURIComponent(templateId)}`,
      data,
    );
  }

  /**
   * Delete an export template.
   * @param templateId Template ID
   */
  async deleteTemplate(templateId: string): Promise<void> {
    return this.http.delete(`${this.basePath}/templates/${encodeURIComponent(templateId)}`);
  }

  // ============================================================================
  // Custom Export Fields
  // ============================================================================

  /**
   * Get user's custom export fields.
   * Returns all custom export fields created by the authenticated user.
   * @param scope Optional scope filter: 'TASK', 'PROJECT', or 'TEAM'
   */
  async listCustomFields(scope?: 'TASK' | 'PROJECT' | 'TEAM'): Promise<CustomExportFieldsResponse> {
    return this.http.get<CustomExportFieldsResponse, Record<string, unknown>>(
      `${this.basePath}/custom-fields`,
      scope ? { scope } : undefined,
    );
  }

  /**
   * Create a custom export field.
   * Creates a new custom export field that can be used in exports.
   * @param data Custom field creation data
   */
  async createCustomField(data: CustomExportFieldCreateRequest): Promise<CustomExportField> {
    return this.http.post<CustomExportField>(`${this.basePath}/custom-fields`, data);
  }

  /**
   * Get a single custom export field.
   * Retrieves a specific custom export field by ID.
   * @param fieldId Field ID
   */
  async getCustomField(fieldId: string): Promise<CustomExportField> {
    return this.http.get<CustomExportField>(
      `${this.basePath}/custom-fields/${encodeURIComponent(fieldId)}`,
    );
  }

  /**
   * Update a custom export field.
   * Updates an existing custom export field.
   * @param fieldId Field ID
   * @param data Updated field data
   */
  async updateCustomField(
    fieldId: string,
    data: CustomExportFieldUpdateRequest,
  ): Promise<CustomExportField> {
    return this.http.put<CustomExportField>(
      `${this.basePath}/custom-fields/${encodeURIComponent(fieldId)}`,
      data,
    );
  }

  /**
   * Delete a custom export field (soft delete).
   * @param fieldId Field ID
   */
  async deleteCustomField(fieldId: string): Promise<void> {
    return this.http.delete(`${this.basePath}/custom-fields/${encodeURIComponent(fieldId)}`);
  }
}
