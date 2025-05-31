import { PageParams, SortablePageParams, DateRangeParams } from './common';

export interface Document {
  id: string;
  type: 'invoice' | 'timesheet' | 'workrecord';
  number?: string;
  title?: string;
  date: string;
  dueDate?: string;
  status?: 'draft' | 'sent' | 'paid';
  items?: DocumentItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  currency?: string;
  template?: string;
  created?: number;
  lastUpdate?: number;
}

export interface DocumentItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  taskId?: string;
  expenseId?: string;
}

export interface DocumentCreateRequest {
  type: 'invoice' | 'timesheet' | 'workrecord';
  number?: string;
  title?: string;
  date: string;
  dueDate?: string;
  taskIds?: string[];
  expenseIds?: string[];
  template?: string;
}

export interface DocumentUpdateRequest {
  number?: string;
  title?: string;
  date?: string;
  dueDate?: string;
  status?: 'draft' | 'sent' | 'paid';
  items?: DocumentItem[];
}

export interface DocumentPrintRequest {
  documentId: string;
  template?: string;
  format?: 'pdf' | 'html';
}

export interface DocumentListParams extends SortablePageParams, DateRangeParams {
  type?: 'invoice' | 'timesheet' | 'workrecord';
  status?: 'draft' | 'sent' | 'paid';
}

export interface DocumentSearchParams extends DocumentListParams {
  number?: string;
  title?: string;
}
