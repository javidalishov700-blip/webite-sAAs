export type ProjectStatus = 'active' | 'paused' | 'archived';

export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: ProjectStatus;
}

export interface Stats {
  total: number;
  active: number;
  paused: number;
  archived: number;
}

export const PROJECT_STATUSES: ProjectStatus[] = ['active', 'paused', 'archived'];
