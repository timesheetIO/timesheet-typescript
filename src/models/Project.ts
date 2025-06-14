import type { ListParams } from './common';
import type { Team } from './Team';

export interface Project {
  id: string;
  title: string;
  description?: string;
  color?: number;
  employer?: string;
  office?: string;
  taskDefaultBillable?: boolean;
  taskDefaultRateId?: string;
  archived?: boolean;
  salaryVisibility?: number;
  salary?: number;
  team?: Team;
  permission?: {
    role: string;
    managerOrOwner: boolean;
    member: boolean;
    manager: boolean;
    owner: boolean;
  };
  duration?: number;
  durationBreak?: number;
  salaryTotal?: number;
  salaryBreak?: number;
  expenses?: number;
  expensesPaid?: number;
  mileage?: number;
  titleAndClient?: string;
  salaryVisible?: boolean;
  user?: string;
  created?: number;
  lastUpdate?: number;
  deleted?: boolean;
}

export interface ProjectList {
  items: Project[];
  params: ProjectListParams;
}

export interface ProjectMember {
  uid: string;
  email: string;
  firstname?: string;
  lastname?: string;
  employeeId?: string;
  imageUrl?: string;
  salaryActivated?: boolean;
  salary?: number;
  permission?: {
    role: string;
    managerOrOwner: boolean;
    member: boolean;
    manager: boolean;
    owner: boolean;
  };
  lastUpdate?: number;
  created?: number;
  displayName?: string;
}

export interface ProjectCreateRequest {
  title: string;
  description?: string;
  color?: number;
  employer?: string;
  office?: string;
  taskDefaultBillable?: boolean;
  taskDefaultRateId?: string;
  archived?: boolean;
  salaryVisibility?: number;
  salary?: number;
  teamId?: string;
}

export interface ProjectUpdateRequest {
  title?: string;
  description?: string;
  color?: number;
  employer?: string;
  office?: string;
  taskDefaultBillable?: boolean;
  taskDefaultRateId?: string;
  archived?: boolean;
  salaryVisibility?: number;
  salary?: number;
  deleted?: boolean;
}

export interface ProjectListParams extends ListParams {
  teamId?: string;
  status?: 'all' | 'active' | 'inactive';
  statistics?: boolean;
  sort?: 'alpha' | 'alphaNum' | 'client' | 'duration' | 'created' | 'status';
  order?: 'asc' | 'desc';
  teamIds?: string[];
  projectIds?: string[];
  taskStartDate?: string;
  taskEndDate?: string;
  taskRateId?: string;
  taskType?: string;
  taskFilter?: string;
  taskUserIds?: string[];
}
