import type { Member, PageParams } from './common';
import type { Project } from './Project';
import type { Todo } from './Todo';
import type { Rate } from './Rate';
import type { Tag } from './Tag';
import type { Pause } from './Pause';
import type { Expense } from './Expense';
import type { Note } from './Note';

export interface Task {
  id: string;
  projectId: string;
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
  distance?: number;
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
  salaryTotal?: number;
  salaryBreak?: number;
  expensesTotal?: number;
  expensesPaid?: number;
  mileage?: number;
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
  currentPerformance?: TaskPerformance;
  lastPerformance?: TaskPerformance;
}

export interface TaskStatistic {
  duration: number;
  durationBreak: number;
  salaryTotal: number;
  salaryBreak: number;
  expensesTotal: number;
  expensesPaid: number;
  mileage: number;
}

export interface TaskPerformance {
  startDateTime: string;
  endDateTime: string;
  duration: number;
  salaryTotal: number;
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
  startDateTime: string;
  /**
   * ISO 8601 date-time with timezone offset (e.g. 2025-05-31T16:45:51+02:00)
   */
  endDateTime: string;
}

export interface TaskListParams extends PageParams {
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
  performance?: boolean;
  startDate?: string;
  endDate?: string;
}
