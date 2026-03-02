/**
 * Reports API Models
 *
 * These models are used by the Reports API (reports.timesheet.io) for
 * generating PDFs, exports, and formatted report data.
 */

// ============================================================================
// Report Item Models
// ============================================================================

/**
 * Task report item for displaying task information in reports.
 */
export interface TaskReportItem {
  /** Formatted date when task was performed */
  taskDate?: string;
  /** Formatted start time display (e.g., "09:00") */
  taskStartTime?: string;
  /** Formatted end time display (e.g., "17:00") */
  taskEndTime?: string;
  /** Formatted start-end time display (e.g., "09:00 - 17:00") */
  taskTimeRange?: string;
  /** Formatted time spent on task (e.g., "8:00 h") */
  taskDuration?: string;
  /** Formatted time spent on task without breaks (e.g., "8:00 h") */
  taskDurationRelative?: string;
  /** Formatted time spent on breaks (e.g., "1:00 h") */
  pauseDuration?: string;
  /** Task description with markdown support */
  taskDescription?: string;
  /** Task identifier */
  taskId?: string;
  /** Task owner/user identifier */
  userId?: string;
  /** Related invoice identifier */
  invoiceId?: string;
  /** Raw task start date/time (ISO) */
  startDateTimeRaw?: string;
  /** Raw task end date/time (ISO) */
  endDateTimeRaw?: string;
  /** Raw task duration in seconds */
  durationSeconds?: number;
  /** Raw task break duration in seconds */
  durationBreakSeconds?: number;
  /** Task location */
  taskLocation?: string;
  /** Mileage start location */
  taskLocationStart?: string;
  /** Mileage end location */
  taskLocationEnd?: string;
  /** Mileage distance */
  taskDistance?: string;
  /** Task rate name */
  taskRateName?: string;
  /** Formatted hourly rate for task (e.g., "€ 50.00") */
  taskRate?: string;
  /** Formatted total amount for task (e.g., "€ 400.00") */
  taskTotal?: string;
  /** Formatted total amount without breaks for task (e.g., "€ 400.00") */
  taskTotalRelative?: string;
  /** Associated project name */
  projectName?: string;
  /** Associated project client */
  projectClient?: string;
  /** Associated project color */
  projectColor?: string;
  /** Name of person who performed the task */
  memberName?: string;
  /** Comma-separated list of associated tags */
  taskTags?: string;
  /** Base64 encoded signature for task approval */
  taskSignature?: string;
  /** Raw quantity expressed in hours */
  quantityHours?: number;
  /** Raw unit rate (net) */
  unitPriceNumeric?: number;
  /** Raw line total (net) */
  lineTotalNumeric?: number;
  /** Raw salary total */
  salaryTotalNumeric?: number;
  /** Raw salary break total */
  salaryBreakNumeric?: number;
  /** Project identifier */
  projectId?: string;
  /** Member identifier */
  memberId?: string;
  /** Whether the task is billable */
  billable?: boolean;
  /** Whether the task has been paid */
  paid?: boolean;
  /** List of expense items for display */
  expenses?: ExpenseReportItem[];
  /** List of note items for display */
  notes?: NoteReportItem[];
}

/**
 * Expense report item for displaying expense information in reports.
 */
export interface ExpenseReportItem {
  /** Formatted date and time when expense occurred */
  expenseDate?: string;
  /** Formatted time-only format (e.g., "14:30") */
  expenseTime?: string;
  /** Formatted monetary amount (e.g., "€ 25.50") */
  expenseAmount?: string;
  /** Expense description with markdown support */
  expenseDescription?: string;
  /** Raw expense description */
  expenseDescriptionRaw?: string;
  /** Raw expense date-time (ISO string) */
  expenseDateTimeRaw?: string;
  /** Expense identifier */
  expenseId?: string;
  /** Expense owner/user identifier */
  expenseUserId?: string;
  /** Base64 encoded image attachment */
  attachmentBase64?: string;
  /** Name of person who created the expense */
  expenseAuthor?: string;
  /** Raw expense amount (net) */
  amountNumeric?: number;
}

/**
 * Note report item for displaying note information in reports.
 */
export interface NoteReportItem {
  /** Formatted date and time when note was created */
  noteDate?: string;
  /** Note content with markdown support */
  noteContent?: string;
  /** Base64 encoded image attachment */
  attachmentBase64?: string;
  /** Note categorization/type */
  noteType?: string;
  /** Name of person who created the note */
  noteAuthor?: string;
}

/**
 * Complete document report model for PDF generation.
 * Contains all document data formatted and ready for display.
 */
export interface DocumentReport {
  // Document Header Properties
  /** Main document title/name */
  documentTitle?: string;
  /** Formatted document creation date */
  documentDate?: string;
  /** Invoice/document number */
  invoiceNumber?: string;
  /** Customer reference number */
  customerNumber?: string;
  /** Formatted due date for payment */
  paymentDate?: string;
  /** Payment method description */
  paymentMethod?: string;

  // Company Information
  /** Business/company name */
  companyName?: string;
  /** Company address line 1 */
  companyAddress1?: string;
  /** Company address line 2 */
  companyAddress2?: string;
  /** Company address line 3 */
  companyAddress3?: string;
  /** Company address line 4 */
  companyAddress4?: string;
  /** Base64 encoded company logo image */
  companyLogo?: string;

  // Customer Information
  /** Customer/client name */
  customerName?: string;
  /** Customer address line 1 */
  customerAddress1?: string;
  /** Customer address line 2 */
  customerAddress2?: string;
  /** Customer address line 3 */
  customerAddress3?: string;
  /** Customer address line 4 */
  customerAddress4?: string;

  // Financial Fields
  /** Formatted total amount for all tasks */
  taskSubtotal?: string;
  /** Formatted total amount for all expenses */
  expenseSubtotal?: string;
  /** Formatted pre-tax subtotal amount */
  subtotalAmount?: string;
  /** Tax percentage rate */
  taxRate?: number;
  /** Formatted calculated tax amount */
  taxAmount?: string;
  /** Second tax percentage rate */
  taxSecondRate?: number;
  /** Formatted second tax amount */
  taxSecondAmount?: string;
  /** Discount percentage rate */
  discountRate?: number;
  /** Formatted discount amount */
  discountAmount?: string;
  /** Second discount percentage rate */
  discountSecondRate?: number;
  /** Formatted second discount amount */
  discountSecondAmount?: string;
  /** Formatted final total amount */
  totalAmount?: string;
  /** Formatted total time worked */
  totalDuration?: string;
  /** Formatted payment amount */
  paymentAmount?: string;

  // E-invoicing Fields
  /** E-invoice type (NONE, ZUGFERD, XRECHNUNG, EBINTERFACE) */
  eInvoiceType?: string;
  /** Company VAT ID for tax reporting */
  companyVatId?: string;
  /** Company tax number */
  companyTaxNumber?: string;
  /** Company registration number */
  companyRegistrationNumber?: string;
  /** Company bank account (IBAN) */
  companyBankAccount?: string;
  /** Company bank BIC code */
  companyBankBIC?: string;
  /** E-invoice currency code (EUR, USD, etc.) */
  eInvoiceCurrency?: string;
  /** Delivery date formatted for display */
  deliveryDate?: string;
  /** Due date formatted for display */
  dueDate?: string;
  /** Payment reference number */
  paymentReference?: string;
  /** Order reference number */
  orderReference?: string;
  /** Tax exemption reason text */
  taxExemptionReason?: string;
  /** Reverse charge tax rate percentage */
  reverseChargeRate?: number;
  /** Whether reverse charge mechanism applies */
  isReverseCharge?: boolean;
  /** E-invoice document type code */
  eInvoiceDocumentType?: string;
  /** Invoice type code for classification */
  invoiceTypeCode?: string;
  /** Customer VAT ID for tax reporting */
  customerVatId?: string;
  /** Customer tax number */
  customerTaxNumber?: string;
  /** Customer's order number reference */
  customerOrderNumber?: string;
  /** Payment terms in days */
  paymentTermDays?: number;
  /** Cash discount rate percentage */
  cashDiscountRate?: number;
  /** Cash discount period in days */
  cashDiscountDays?: number;
  /** Original invoice number (for credit notes) */
  originalInvoiceNumber?: string;
  /** Original invoice date (for credit notes) */
  originalInvoiceDate?: string;
  /** Project reference number */
  projectReference?: string;
  /** Cost center reference */
  costCenter?: string;
  /** Whether this is a government/B2G invoice */
  isGovernmentInvoice?: boolean;
  /** Procurement reference number */
  procurementReference?: string;
  /** Contract reference number */
  contractReference?: string;
  /** Whether e-invoicing is enabled for this document */
  eInvoicingEnabled?: boolean;

  // Content & Settings
  /** Main document description/content */
  documentDescription?: string;
  /** Terms and conditions text */
  documentTerms?: string;
  /** Base64 encoded document signature */
  documentSignature?: string;
  /** Whether to display time columns */
  showTaskTime?: boolean;
  /** Whether to display rate information */
  showRates?: boolean;
  /** Whether to display tax calculations */
  showTaxes?: boolean;
  /** Whether to display second tax */
  showSecondTax?: boolean;
  /** Whether to display discount information */
  showDiscount?: boolean;
  /** Whether to display second discount */
  showSecondDiscount?: boolean;
  /** Whether to include expense section */
  includeExpenses?: boolean;
  /** Whether to include notes section */
  includeNotes?: boolean;
  /** Whether to show project titles in tasks */
  showProjectTitle?: boolean;
  /** Whether to show member names in tasks */
  showMemberName?: boolean;
  /** Whether to show tags in tasks */
  showTags?: boolean;
  /** Whether to show QR code on the document */
  showQrCode?: boolean;
  /** Type of QR code (e.g., URL, TEXT, PAYMENT) */
  qrCodeType?: string;
  /** Content to encode in the QR code */
  qrCodeContent?: string;
  /** Description text to display with the QR code */
  qrCodeDescription?: string;
  /** Whether to hide expense date/time */
  hideExpenseDateTime?: boolean;
  /** Whether to hide summation section */
  hideSummation?: boolean;
  /** Whether to use relative or absolute values */
  useRelatives?: boolean;

  // Collections
  /** List of transformed task items for display */
  tasks?: TaskReportItem[];
  /** List of transformed expense items for display */
  expenses?: ExpenseReportItem[];
  /** List of transformed note items for display */
  notes?: NoteReportItem[];

  // Field Labels (Localized)
  /** Localized "Description" label */
  labelDescription?: string;
  /** Localized "Rate" label */
  labelRate?: string;
  /** Localized "Quantity/Duration" label */
  labelQuantity?: string;
  /** Localized "Total" label */
  labelTotal?: string;
  /** Localized "Total Sum" label */
  labelTotalSum?: string;
  /** Localized "Subtotal" label */
  labelSubtotal?: string;
  /** Localized "Tax" label */
  labelTax?: string;
  /** Localized "Second Tax" label */
  labelSecondTax?: string;
  /** Localized "Discount" label */
  labelDiscount?: string;
  /** Localized "Second Discount" label */
  labelSecondDiscount?: string;
  /** Localized "Expense Title" label */
  labelExpenseTitle?: string;
  /** Localized "Expense Total" label */
  labelExpenseTotal?: string;

  // Metadata
  /** Template ID used for PDF generation */
  templateId?: string;
  /** Report type (invoice, timesheet, note) */
  reportType?: string;
  /** Language/locale for formatting */
  language?: string;
  /** Currency symbol/code */
  currency?: string;
  /** ISO currency code (e.g., EUR) */
  currencyCode?: string;
}

// ============================================================================
// Export Models
// ============================================================================

/**
 * Exported field configuration for custom exports.
 */
export interface ExportedField {
  /** Field identifier from FieldRegistry */
  id: string;
  /** Display name/label for the field */
  name?: string;
  /** Field position in the export */
  position?: number;
  /** Whether this is a project-level field */
  projectField?: boolean;
  /** Whether this is a team-level field */
  teamField?: boolean;
  /** Whether this is a custom field */
  customField?: boolean;
  /** Static value for TEXT/NUMBER custom fields */
  customValue?: string;
  /** Excel formula for FORMULA custom fields */
  customFormula?: string;
  /** Field type: text, number, formula */
  customType?: string;
}

/**
 * Parameters for generating timesheet exports.
 */
export interface ExportParams {
  /** Report type identifier */
  report: number;
  /** Email address to send export to (for send endpoint) */
  email?: string;
  /** Filename for the export */
  filename?: string;
  /** Filter by team IDs */
  teamIds?: string[];
  /** Filter by project IDs */
  projectIds?: string[];
  /** Filter by user IDs */
  userIds?: string[];
  /** Filter by tag IDs */
  tagIds?: string[];
  /** Task type filter: all, task, mileage, call */
  type?: string;
  /** Start date (YYYY-MM-DD) */
  startDate: string;
  /** End date (YYYY-MM-DD) */
  endDate: string;
  /** Export format: xlsx, xlsx1904, csv, pdf */
  format?: ExportFormat;
  /** Status filter: all, billable, notBillable, paid, unpaid, billed, outstanding */
  filter?: string;
  /** Whether to split multi-day tasks */
  splitTask?: boolean;
  /** Whether to summarize data */
  summarize?: boolean;
  /** Whether to save as a template */
  saveAsTemplate?: boolean;
  /** Template name when saving as template */
  templateName?: string;
  /** Custom exported fields configuration */
  exportedFields?: ExportedField[];
}

/**
 * Export file format options.
 */
export type ExportFormat = 'xlsx' | 'xlsx1904' | 'csv' | 'pdf';

/**
 * Parameters for generating export from a template.
 */
export interface ExportTemplateParams {
  /** Template ID to use */
  templateId: string;
  /** Start date (YYYY-MM-DD) */
  startDate: string;
  /** End date (YYYY-MM-DD) */
  endDate: string;
}

/**
 * Response containing a file download URL.
 */
export interface FileResponse {
  /** Signed URL to download the file */
  url: string;
  /** Filename */
  filename?: string;
  /** Content type */
  contentType?: string;
}

/**
 * Export template DTO with decoded JSON fields.
 */
export interface ExportTemplate {
  /** Template ID */
  id: string;
  /** User ID who owns the template */
  user?: string;
  /** Whether the template is deleted */
  deleted?: boolean;
  /** Last update timestamp */
  lastUpdate?: number;
  /** Creation timestamp */
  created?: number;
  /** Template name */
  name: string;
  /** Report type identifier */
  report: number;
  /** Team IDs filter */
  teamIds?: string[];
  /** Project IDs filter */
  projectIds?: string[];
  /** User IDs filter */
  userIds?: string[];
  /** Tag IDs filter */
  tagIds?: string[];
  /** Task type filter */
  type?: string;
  /** Export format */
  format?: string;
  /** Status filter */
  filter?: string;
  /** Whether to split multi-day tasks */
  splitTask?: boolean;
  /** Whether to summarize data */
  summarize?: boolean;
  /** Email address */
  email?: string;
  /** Filename */
  filename?: string;
  /** Custom exported fields */
  exportedFields?: ExportedField[];
}

/**
 * Request to create an export template.
 */
export interface ExportTemplateCreateRequest {
  /** Template name */
  name: string;
  /** Report type identifier */
  report?: number;
  /** Team IDs filter */
  teamIds?: string[];
  /** Project IDs filter */
  projectIds?: string[];
  /** User IDs filter */
  userIds?: string[];
  /** Tag IDs filter */
  tagIds?: string[];
  /** Task type filter */
  type?: string;
  /** Export format */
  format?: string;
  /** Status filter */
  filter?: string;
  /** Whether to split multi-day tasks */
  splitTask?: boolean;
  /** Whether to summarize data */
  summarize?: boolean;
  /** Email address */
  email?: string;
  /** Filename */
  filename?: string;
  /** Custom exported fields */
  exportedFields?: ExportedField[];
}

/**
 * Request to update an export template.
 */
export interface ExportTemplateUpdateRequest {
  /** Template name */
  name?: string;
  /** Report type identifier */
  report?: number;
  /** Team IDs filter */
  teamIds?: string[];
  /** Project IDs filter */
  projectIds?: string[];
  /** User IDs filter */
  userIds?: string[];
  /** Tag IDs filter */
  tagIds?: string[];
  /** Task type filter */
  type?: string;
  /** Export format */
  format?: string;
  /** Status filter */
  filter?: string;
  /** Whether to split multi-day tasks */
  splitTask?: boolean;
  /** Whether to summarize data */
  summarize?: boolean;
  /** Email address */
  email?: string;
  /** Filename */
  filename?: string;
  /** Custom exported fields */
  exportedFields?: ExportedField[];
}

/**
 * Parameters for listing export templates.
 */
export interface ExportTemplateListParams {
  /** Sort field: alpha, name, created, lastUpdate */
  sort?: 'alpha' | 'name' | 'created' | 'lastUpdate';
  /** Sort order direction */
  order?: 'asc' | 'desc';
  /** Page number (1-based) */
  page?: number;
  /** Number of items per page */
  limit?: number;
  /** Search text */
  search?: string;
}

/**
 * Field definition for exports from FieldRegistry.
 */
export interface ExportFieldDefinition {
  /** Field identifier */
  fieldId: string;
  /** Localization key for name */
  nameKey?: string;
  /** Localization key for description */
  descriptionKey?: string;
  /** Display name */
  name: string;
  /** Field description */
  description?: string;
  /** Field type: STRING, NUMBER, DURATION, DATE, BOOLEAN */
  type?: string;
  /** Field category: TASK, EXPENSE, NOTE, PAUSE, MILEAGE, CALL, PROJECT, TEAM */
  category?: string;
  /** Field scope: TASK, PROJECT, TEAM */
  scope?: string;
  /** Whether field is enabled by default */
  defaultEnabled?: boolean;
  /** Default position in export */
  defaultPosition?: number;
  /** Whether this is a custom field */
  customField?: boolean;
  /** Custom field type: text, number, formula */
  customType?: string;
  /** Static value for TEXT/NUMBER custom fields */
  customValue?: string;
  /** Excel formula for FORMULA custom fields */
  customFormula?: string;
}

/**
 * Response containing available export fields.
 */
export interface ExportFieldsResponse {
  /** List of available fields */
  fields: ExportFieldDefinition[];
}

/**
 * Report type definition.
 */
export interface ExportReportType {
  /** Report type identifier */
  id: number;
  /** Report name */
  name: string;
  /** Report description */
  description?: string;
  /** Whether report accepts custom field selection */
  acceptsCustomFields?: boolean;
  /** Field scope for this report */
  fieldScope?: string;
}

/**
 * Response containing available report types.
 */
export interface ExportReportsResponse {
  /** List of available report types */
  reports: ExportReportType[];
}

// ============================================================================
// Custom Export Field Models
// ============================================================================

/**
 * Custom export field DTO.
 */
export interface CustomExportField {
  /** Field ID */
  id: string;
  /** User ID who owns the field */
  user?: string;
  /** Field name/label */
  name: string;
  /** Field scope: TASK, PROJECT, TEAM */
  scope: string;
  /** Field type: TEXT, NUMBER, FORMULA */
  type: string;
  /** Field value or formula */
  value?: string;
  /** Default width */
  width?: number;
  /** Whether the field is deleted */
  deleted?: boolean;
  /** Last update timestamp */
  lastUpdate?: number;
  /** Creation timestamp */
  created?: number;
}

/**
 * Request to create a custom export field.
 */
export interface CustomExportFieldCreateRequest {
  /** Field name/label */
  name: string;
  /** Field scope: TASK, PROJECT, TEAM */
  scope: string;
  /** Field type: TEXT, NUMBER, FORMULA */
  type: string;
  /** Field value or formula */
  value?: string;
  /** Default width */
  width?: number;
}

/**
 * Request to update a custom export field.
 */
export interface CustomExportFieldUpdateRequest {
  /** Field name/label */
  name?: string;
  /** Field scope: TASK, PROJECT, TEAM */
  scope?: string;
  /** Field type: TEXT, NUMBER, FORMULA */
  type?: string;
  /** Field value or formula */
  value?: string;
  /** Default width */
  width?: number;
}

/**
 * Response containing custom export fields.
 */
export interface CustomExportFieldsResponse {
  /** List of custom export fields */
  fields: CustomExportField[];
}
