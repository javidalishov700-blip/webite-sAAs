import type { CreateProjectInput, Project, Stats } from '../shared/types';

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const message = await res
      .json()
      .then((body) => (body as { error?: string }).error)
      .catch(() => undefined);
    throw new Error(message ?? `Request failed with ${res.status}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export const api = {
  listProjects: () => fetch('/api/projects').then((r) => handle<Project[]>(r)),
  stats: () => fetch('/api/stats').then((r) => handle<Stats>(r)),
  createProject: (input: CreateProjectInput) =>
    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }).then((r) => handle<Project>(r)),
  deleteProject: (id: number) =>
    fetch(`/api/projects/${id}`, { method: 'DELETE' }).then((r) => handle<void>(r)),
};
