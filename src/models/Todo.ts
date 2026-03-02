import type { ListParams } from './common';
import type { Project } from './Project';

export interface Todo {
  id: string;
  name: string;
  description?: string;
  project?: Project;
  status: 'open' | 'closed';
  dueDate?: string;
  assignedUsers?: string;
  estimatedHours?: number;
  estimatedMinutes?: number;
  duration?: number;
  durationBreak?: number;
  salaryTotal?: number;
  salaryBreak?: number;
  expenses?: number;
  expensesPaid?: number;
  mileage?: number;
  user?: string;
  deleted?: boolean;
  created?: number;
  lastUpdate?: number;
}

export interface TodoList {
  items: Todo[];
  params: TodoListParams;
  todoStatistic?: {
    open: number;
    closed: number;
  };
}

export interface TodoCreateRequest {
  name: string;
  description?: string;
  projectId: string;
  dueDate?: string;
  assignedUsers?: string;
  estimatedHours?: number;
  estimatedMinutes?: number;
}

export interface TodoUpdateRequest {
  name?: string;
  description?: string;
  status?: 'open' | 'closed';
  dueDate?: string;
  assignedUsers?: string;
  estimatedHours?: number;
  estimatedMinutes?: number;
  deleted?: boolean;
}

export interface TodoListParams extends ListParams {
  projectId?: string;
  status?: 'open' | 'closed';
  assignedUsers?: string;
}
