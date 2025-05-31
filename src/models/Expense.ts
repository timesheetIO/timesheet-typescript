import { PageParams, SortablePageParams, DateRangeParams } from './common';

export interface Expense {
  id: string;
  taskId: string;
  amount: number;
  currency?: string;
  description?: string;
  date: string;
  refunded?: boolean;
  fileId?: string;
  created?: number;
  lastUpdate?: number;
}

export interface ExpenseCreateRequest {
  taskId: string;
  amount: number;
  currency?: string;
  description?: string;
  date: string;
}

export interface ExpenseUpdateRequest {
  amount?: number;
  currency?: string;
  description?: string;
  date?: string;
}

export interface ExpenseStatusUpdateRequest {
  expenseIds: string[];
  refunded: boolean;
}

export interface ExpenseListParams extends SortablePageParams, DateRangeParams {
  taskId?: string;
  refunded?: boolean;
}

export interface ExpenseSearchParams extends ExpenseListParams {
  description?: string;
  minAmount?: number;
  maxAmount?: number;
}
