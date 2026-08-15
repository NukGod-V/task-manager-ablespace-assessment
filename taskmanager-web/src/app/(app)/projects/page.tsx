'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Users, Crown } from 'lucide-react';
import { fetchProjects, createProject, fetchUsers, type UiProject, type UiAppUser } from '@/lib/api';
import { useActiveProject } from '@/components/providers/active-project-provider';
import { getStoredUser } from '@/lib/auth';

export default function ProjectsPage() {
  const router = useRouter();
  const { setActiveProject } = useActiveProject();
  const [projects, setProjects] = useState<UiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  useEffect(() => {
    setCurrentUserId(getStoredUser()?.id);
  }, []);

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch(() => setError('Could not load projects. Is the API running on :4000?'))
      .finally(() => setLoading(false));
  }, []);

  function handleOpenProject(project: UiProject) {
    setActiveProject({ id: project.id, name: project.name });
    router.push('/tasks');
  }

  function handleCreated(project: UiProject) {
    setProjects((prev) => [project, ...prev]);
    setModalOpen(false);
  }

  if (loading) return <p className="text-sm text-muted">Loading projects…</p>;

  return (
    <div>
      {error && (
        <p className="mb-3 rounded-lg bg-date-overdue-bg px-3 py-2 text-xs text-date-overdue">{error}</p>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted">
          {projects.length} project{projects.length === 1 ? '' : 's'}
        </h2>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1 rounded-full bg-cta-primary px-4 py-1.5 text-sm font-medium text-cta-primary-foreground"
        >
          <Plus size={14} /> Add Project
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => handleOpenProject(project)}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left hover:border-accent"
          >
            <p className="text-sm font-medium text-foreground">{project.name}</p>

            {project.lead && (
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Crown size={12} />
                {project.lead.id === currentUserId ? 'You' : project.lead.username}
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Users size={12} />
              {project.members.length} member{project.members.length === 1 ? '' : 's'}
            </div>

            <div className="flex -space-x-1.5">
              {project.members.slice(0, 5).map((m) => (
                <div
                  key={m.id}
                  title={m.username ?? 'Unknown'}
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-accent text-[10px] text-white"
                >
                  {m.username?.[0]?.toUpperCase() ?? '?'}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      {modalOpen && <CreateProjectModal onClose={() => setModalOpen(false)} onCreated={handleCreated} />}
    </div>
  );
}

function CreateProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (p: UiProject) => void;
}) {
  const [name, setName] = useState('');
  const [allUsers, setAllUsers] = useState<UiAppUser[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  useEffect(() => {
  setCurrentUserId(getStoredUser()?.id);
  }, []);

  useEffect(() => {
    fetchUsers().then((users) => setAllUsers(users.filter((u) => u.id !== currentUserId)));
  }, [currentUserId]);

  function toggleMember(id: string) {
    setSelectedMembers((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  }

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const project = await createProject(name.trim(), selectedMembers);
      onCreated(project);
    } catch {
      setError('Could not create the project.');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-[420px] rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">New Project</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name..."
          autoFocus
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted"
        />

        {allUsers.length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-medium text-muted">Add members</p>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-border">
              {allUsers.map((u) => (
                <label key={u.id} className="flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-sidebar-active">
                  {u.username}
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(u.id)}
                    onChange={() => toggleMember(u.id)}
                    className="h-3.5 w-3.5 accent-accent"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm text-foreground hover:bg-sidebar-active">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-full bg-cta-primary px-4 py-2 text-sm text-cta-primary-foreground disabled:opacity-60"
          >
            {submitting ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}