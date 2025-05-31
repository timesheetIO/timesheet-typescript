import { PageParams, SortablePageParams, DateRangeParams } from './common';

export interface Note {
  id: string;
  taskId: string;
  content: string;
  date: string;
  fileId?: string;
  created?: number;
  lastUpdate?: number;
}

export interface NoteCreateRequest {
  taskId: string;
  content: string;
  date: string;
}

export interface NoteUpdateRequest {
  content?: string;
  date?: string;
}

export interface NoteListParams extends SortablePageParams, DateRangeParams {
  taskId?: string;
}
