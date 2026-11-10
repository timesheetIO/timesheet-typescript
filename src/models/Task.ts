import type { ListParams, Member } from './common';
import type { Project } from './Project';
import type { Todo } from './Todo';
import type { Rate } from './Rate';
import type { Tag } from './Tag';
import type { Pause } from './Pause';
import type { Expense } from './Expense';
import type { Note } from './Note';

export interface Task {
  id: string;
  description?: string;
  /**
   * ISO 8601 date-time with timezone offset (e.g. 2025-05-31T16:45:51+02:00)
   */
  startDateTime?: string;
  /**
   * ISO 8601 date-time with timezone offset (e.g. 2025-05-31T16:45:51+02:00)
   */
  endDateTime?: string;
  location?: string;
  locationEnd?: string;
  feeling?: number;
  typeId?: number;
  billable?: boolean;
  paid?: boolean;
  billed?: boolean;
  phoneNumber?: string;
  distance?: string;
  signature?: string;
  project?: Project;
  todo?: Todo;
  rate?: Rate;
  member?: Member;
  invoiceId?: string;
  tags?: Tag[];
  pauses?: Pause[];
  expenses?: Expense[];
  notes?: Note[];
  duration?: number;
  durationBreak?: number;
  salaryTotal?: string;
  salaryBreak?: string;
  expensesTotal?: string;
  expensesPaid?: string;
  mileage?: string;
  notesTotal?: number;
  salaryVisible?: boolean;
  user?: string;
  deleted?: boolean;
  running?: boolean;
  created?: number;
  lastUpdate?: number;
}

export interface TaskList {
  items: Task[];
  params: TaskListParams;
  taskStatistic?: TaskStatistic;
}

export interface TaskStatistic {
  duration: number;
  durationBreak: number;
  salaryTotal: string;
  salaryBreak: string;
  expensesTotal: string;
  expensesPaid: string;
  mileage: string;
}

/**
 * The totals of one project, member, tag, location or start day in a {@link TaskBreakdown}.
 */
export interface TaskBreakdownItem {
  /** Project id, member user id, tag id or day (YYYY-MM-DD); null for tasks without a project and for locations. */
  id?: string | null;
  /** Project title, member name, tag name or location; null for tasks without a project or location. */
  name?: string | null;
  /** Project or tag color. */
  color?: number | null;
  /** Seconds worked, breaks included. */
  duration: number;
  /** Seconds of breaks. */
  durationBreak: number;
  /** Sum of the salaries, each task's rounded to 2 places (half to even) before adding them up. */
  salaryTotal: string;
  /** Salary of the breaks: `salaryTotal - salaryBreak` is the salary without breaks. */
  salaryBreak: string;
  /** Number of tasks. */
  taskCount: number;
  /** Start of the latest task, as stored (ISO 8601 with offset). */
  lastStartDateTime?: string | null;
}

/**
 * Task totals per project, member, tag, location and start day, from `tasks.breakdown()`.
 * Finished tasks only, like `tasks.statistics()`. A task counts fully for each of its tags, so the
 * tag totals overlap and don't add up to the total; it counts whole on the day it started.
 */
export interface TaskBreakdown {
  projects: TaskBreakdownItem[];
  members: TaskBreakdownItem[];
  tags: TaskBreakdownItem[];
  locations: TaskBreakdownItem[];
  days: TaskBreakdownItem[];
}

export interface TaskCreateRequest {
  projectId: string;
  description?: string;
  location?: string;
  locationEnd?: string;
  /**
   * ISO 8601 date-time with timezone offset (e.g. 2025-05-31T16:45:51+02:00)
   */
  startDateTime: string;
  /**
   * ISO 8601 date-time with timezone offset (e.g. 2025-05-31T16:45:51+02:00)
   */
  endDateTime?: string;
  feeling?: number;
  typeId?: number;
  paid?: boolean;
  billed?: boolean;
  billable?: boolean;
  phoneNumber?: string;
  distance?: number;
  rateId?: string;
  todoId?: string;
  signature?: string;
  userId?: string;
  tagIds?: string[];
}

export interface TaskUpdateRequest {
  projectId?: string;
  description?: string;
  location?: string;
  locationEnd?: string;
  /**
   * ISO 8601 date-time with timezone offset (e.g. 2025-05-31T16:45:51+02:00)
   */
  startDateTime?: string;
  /**
   * ISO 8601 date-time with timezone offset (e.g. 2025-05-31T16:45:51+02:00)
   */
  endDateTime?: string;
  feeling?: number;
  typeId?: number;
  paid?: boolean;
  billed?: boolean;
  billable?: boolean;
  phoneNumber?: string;
  distance?: number;
  rateId?: string;
  todoId?: string;
  signature?: string;
  deleted?: boolean;
  tagIds?: string[];
}

export interface TaskStatusUpdateRequest {
  id: string;
  status?: number;
  paid?: boolean;
  notBillable?: boolean;
  unpaid?: boolean;
  notBilled?: boolean;
  billed?: boolean;
}

export interface TaskTimesUpdateRequest {
  id: string;
  /**
   * ISO 8601 date-time with timezone offset (e.g. 2025-05-31T16:45:51+02:00)
   */
  start: string;
  /**
   * ISO 8601 date-time with timezone offset (e.g. 2025-05-31T16:45:51+02:00)
   */
  end: string;
}

export interface TaskListParams extends ListParams {
  sort?: 'dateTime' | 'time' | 'created';
  order?: 'asc' | 'desc';
  organizationId?: string;
  teamId?: string;
  projectId?: string;
  todoId?: string;
  rateId?: string;
  documentId?: string;
  type?: string;
  filter?: string;
  teamIds?: string[];
  projectIds?: string[];
  tagIds?: string[];
  taskIds?: string[];
  userIds?: string[];
  feelings?: number[];
  populatePauses?: boolean;
  populateExpenses?: boolean;
  populateNotes?: boolean;
  populateTags?: boolean;
  excludeTaskIds?: string[];
  startDate?: string;
  endDate?: string;
  /** Set in a task list response: how many of the `count` tasks the user may change in a batch action. */
  changeableCount?: number;
}
