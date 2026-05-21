import type { ListParams, Member } from './common';
import type { Task } from './Task';

export interface Expense {
  id: string;
  user?: string;
  deleted?: boolean;
  lastUpdate?: number;
  created?: number;
  description?: string;
  dateTime?: string;
  amount?: string;
  refunded?: boolean;
  fileUri?: string;
  fileName?: string;
  task?: Task;
  member?: Member;
  invoiceId?: string;
}

export interface ExpenseList {
  items: Expense[];
  params: ExpenseListParams;
}

export interface ExpenseCreateRequest {
  description?: string;
  dateTime: string;
  amount?: string;
  refunded?: boolean;
  fileUri?: string;
  fileName?: string;
  taskId: string;
}

export interface ExpenseUpdateRequest {
  description?: string;
  dateTime?: string;
  amount?: string;
  refunded?: boolean;
  deleted?: boolean;
  fileUri?: string;
  fileName?: string;
}

export interface ExpenseStatus {
  id: string;
  refunded: boolean;
}

export interface ExpenseListParams extends ListParams {
  startDate?: string;
  endDate?: string;
  taskId?: string;
  documentId?: string;
  organizationId?: string;
  filter?: string;
  projectIds?: string[];
  taskIds?: string[];
}

/**
 * File upload options for expenses
 */
export interface ExpenseFileUpload {
  /** The file to upload (File object in browser, or Blob/Buffer in Node.js) */
  file: File | Blob;
  /** Optional custom filename */
  fileName?: string;
}

/**
 * Request to create an expense with a file attachment
 */
export interface ExpenseCreateWithFileRequest extends ExpenseCreateRequest {
  /** File to attach to the expense */
  file?: ExpenseFileUpload;
}
