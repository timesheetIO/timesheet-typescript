import type { ListParams } from './common';

/** One of the most used window titles of an activity, with the seconds it was in front. */
export interface TaskActivityTitle {
  title: string;
  seconds: number;
}

/** A screenshot taken during a task activity. Fetch the file through `getImageUrl()`. */
export interface TaskActivityImage {
  id: string;
  taskActivityId: string;
  taskId: string;
  /** ISO 8601 date-time with timezone offset */
  dateTime?: string;
  /** Bytes */
  fileSize?: number;
  width?: number;
  height?: number;
  lastUpdate?: number;
  created?: number;
}

/**
 * One stretch of time spent in one application while working on a task, recorded by the
 * desktop app. Only the owner of the task can read or write activities.
 */
export interface TaskActivity {
  id: string;
  user?: string;
  taskId: string;
  appName: string;
  /** For example `chrome.exe`. Stable across UI languages, unlike `appName`. */
  appExecutable?: string;
  titles?: TaskActivityTitle[];
  /** ISO 8601 date-time with timezone offset (e.g. 2025-05-31T16:45:51+02:00) */
  startDateTime: string;
  /** ISO 8601 date-time with timezone offset (e.g. 2025-05-31T16:45:51+02:00) */
  endDateTime: string;
  /** For example `desktop-macos`. */
  source?: string;
  images?: TaskActivityImage[];
  lastUpdate?: number;
  created?: number;
}

export interface TaskActivityUpsert {
  /**
   * Client generated id: 32 hex characters, or a UUID. Sending the same id again updates that
   * activity, which is how a still growing activity is re-sent while a timer runs.
   */
  id?: string;
  appName: string;
  appExecutable?: string;
  /** The server keeps the five titles with the most seconds. */
  titles?: TaskActivityTitle[];
  startDateTime: string;
  endDateTime: string;
  source?: string;
}

export interface TaskActivityListParams extends ListParams {
  taskId: string;
}

export interface TaskActivityImageUpload {
  /** Client generated id. Uploading the same id again returns the stored image. */
  id?: string;
  /** When the screenshot was taken. */
  dateTime?: string;
  width?: number;
  height?: number;
  /** jpg, jpeg, png or webp, up to 5 MB */
  file: File | Blob;
  /** Needs an image extension: the server derives the content type from it. */
  fileName: string;
}
