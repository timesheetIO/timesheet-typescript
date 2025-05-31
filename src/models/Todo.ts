import { PageParams, SortablePageParams } from './common';

export interface Todo {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  status: 'open' | 'closed';
  dueDate?: string;
  assignedTo?: string[];
  estimatedTime?: number;
  actualTime?: number;
  created?: number;
  lastUpdate?: number;
}

export interface TodoCreateRequest {
  name: string;
  description?: string;
  projectId: string;
  dueDate?: string;
  assignedTo?: string[];
  estimatedTime?: number;
}

export interface TodoUpdateRequest {
  name?: string;
  description?: string;
  status?: 'open' | 'closed';
  dueDate?: string;
  assignedTo?: string[];
  estimatedTime?: number;
}

export interface TodoListParams extends SortablePageParams {
  projectId?: string;
  status?: 'open' | 'closed';
  assignedTo?: string;
}

export interface TodoSearchParams extends TodoListParams {
  name?: string;
  description?: string;
}
