import { useCallback, useEffect, useMemo, useState } from 'react';
import { PROJECT_STATUSES, type Project, type ProjectStatus, type Stats } from '../shared/types';
import { api } from './api';

const statusStyles: Record<ProjectStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
  archived: 'bg-slate-200 text-slate-600',
};

function Hero() {
  return (
    <header className="bg-gradient-to-b from-brand-600 to-brand-800 text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 text-lg font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/15">◆</span>
          webite-sAAs
        </div>
        <a
          href="#dashboard"
          className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/20 transition hover:bg-white/20"
        >
          Open dashboard
        </a>
      </nav>
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 text-center">
        <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-white/20">
          Starter kit
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
          Ship your SaaS idea in an afternoon.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-100">
          A batteries-included React + Express starter with a working projects dashboard, REST API,
          and persistent storage — no external services required.
        </p>
      </div>
    </header>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function CreateProjectForm({ onCreate }: { onCreate: (p: Project) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await api.createProject({ name, description, status });
      onCreate(created);
      setName('');
      setDescription('');
      setStatus('active');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">New project</h3>
      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Marketing site revamp"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
            rows={2}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Creating…' : 'Create project'}
        </button>
      </div>
    </form>
  );
}

function ProjectRow({ project, onDelete }: { project: Project; onDelete: (id: number) => void }) {
  return (
    <li className="flex items-start justify-between gap-4 border-b border-slate-100 py-4 last:border-0">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">{project.name}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[project.status]}`}>
            {project.status}
          </span>
        </div>
        {project.description && <p className="mt-1 text-sm text-slate-500">{project.description}</p>}
        <p className="mt-1 text-xs text-slate-400">Created {project.createdAt} UTC</p>
      </div>
      <button
        onClick={() => onDelete(project.id)}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
      >
        Delete
      </button>
    </li>
  );
}

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const list = await api.listProjects();
      setProjects(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats: Stats = useMemo(
    () => ({
      total: projects.length,
      active: projects.filter((p) => p.status === 'active').length,
      paused: projects.filter((p) => p.status === 'paused').length,
      archived: projects.filter((p) => p.status === 'archived').length,
    }),
    [projects],
  );

  const handleCreate = (project: Project) => setProjects((prev) => [project, ...prev]);

  const handleDelete = async (id: number) => {
    const prev = projects;
    setProjects((current) => current.filter((p) => p.id !== id));
    try {
      await api.deleteProject(id);
    } catch {
      setProjects(prev);
    }
  };

  return (
    <div className="min-h-screen">
      <Hero />
      <main id="dashboard" className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Active" value={stats.active} />
          <StatCard label="Paused" value={stats.paused} />
          <StatCard label="Archived" value={stats.archived} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
          <CreateProjectForm onCreate={handleCreate} />

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Projects</h3>
              <button
                onClick={() => void load()}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Refresh
              </button>
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            {loading ? (
              <p className="mt-6 text-sm text-slate-500">Loading…</p>
            ) : projects.length === 0 ? (
              <p className="mt-6 text-sm text-slate-500">
                No projects yet. Create your first one to get started.
              </p>
            ) : (
              <ul className="mt-2">
                {projects.map((project) => (
                  <ProjectRow key={project.id} project={project} onDelete={handleDelete} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400">
        webite-sAAs starter · React + Vite + Express + SQLite
      </footer>
    </div>
  );
}
