import type { ListParams, Member } from './common';
import type { Task } from './Task';

export interface Note {
  id: string;
  user?: string;
  deleted?: boolean;
  lastUpdate?: number;
  created?: number;
  text?: string;
  dateTime?: string;
  uri?: string;
  driveId?: string;
  task?: Task;
  member?: Member;
}

export interface NoteList {
  items: Note[];
  params: NoteListParams;
}

export interface NoteCreateRequest {
  text: string;
  dateTime: string;
  uri?: string;
  driveId?: string;
  taskId: string;
}

export interface NoteUpdateRequest {
  text: string;
  dateTime: string;
  uri?: string;
  driveId?: string;
  deleted?: boolean;
}

export interface NoteListParams extends ListParams {
  startDate?: string;
  endDate?: string;
  taskId?: string;
  documentId?: string;
  taskIds?: string[];
}

/**
 * File upload options for notes
 */
export interface NoteFileUpload {
  /** The file to upload (File object in browser, or Blob/Buffer in Node.js) */
  file: File | Blob;
  /** Optional custom filename */
  fileName?: string;
}

/**
 * Request to create a note with a file attachment
 */
export interface NoteCreateWithFileRequest extends NoteCreateRequest {
  /** File to attach to the note */
  file?: NoteFileUpload;
}
